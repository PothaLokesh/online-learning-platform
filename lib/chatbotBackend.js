// Remove 'dotenv/config' if this file is directly used in Next.js API routes
// import 'dotenv/config';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pool } from 'pg';

// --- Configuration ---
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// IMPORTANT: In a Next.js API route, if these are missing, the build will likely fail,
// or runtime errors will occur which should be handled by the route's try/catch.
// Do NOT call process.exit() here.
if (!API_KEY) {
    console.error("Configuration Error: GOOGLE_API_KEY or GEMINI_API_KEY not found in environment variables.");
}
if (!DATABASE_URL) {
    console.error("Configuration Error: DATABASE_URL not found in environment variables.");
}

const GENERATION_MODEL_NAME = "gemini-flash-latest";
const EMBEDDING_MODEL_NAME = "text-embedding-004";
const EMBEDDING_DIMENSIONS = 768;

const COURSE_TABLE_NAME = "courses";
const COURSE_ID_COLUMN = "cid";
const COURSE_TEXT_COLUMN = "courseContent";
const COURSE_EMBEDDING_COLUMN = "embedding";

class RAGChatbot {
    constructor() {
        if (!API_KEY || !DATABASE_URL) {
            // Throw error immediately if critical env vars are missing
            // This error should ideally be caught during server startup or deployment
            throw new Error("Missing required environment variables for RAGChatbot initialization.");
        }

        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.generationModel = this.genAI.getGenerativeModel({ model: GENERATION_MODEL_NAME });
        this.embeddingModel = this.genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });

        this.pool = new Pool({
            connectionString: DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        // Initialize flag
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    async initialize() {
        if (this.isInitialized) {
            return; // Already initialized
        }
        if (this.initializationPromise) {
            return this.initializationPromise; // Return pending promise if already initializing
        }

        this.initializationPromise = (async () => {
            try {
                console.log("Initializing RAGChatbot...");
                await this._ensurePgVectorExtension();
                // IMPORTANT: Removed ingestContentEmbeddings from constructor/init
                // It should be called separately or as a scheduled job.
                this.isInitialized = true;
                console.log("RAGChatbot initialized successfully.");
            } catch (error) {
                console.error("Error during RAGChatbot initialization:", error);
                // Clean up pool if initialization fails
                await this.pool.end();
                throw error; // Re-throw to indicate initialization failure
            } finally {
                this.initializationPromise = null; // Clear promise on completion
            }
        })();

        return this.initializationPromise;
    }

    async _ensurePgVectorExtension() {
        const client = await this.pool.connect();
        try {
            const checkVector = await client.query("SELECT 1 FROM pg_extension WHERE extname = 'vector'");
            if (checkVector.rows.length === 0) {
                console.warn("pgvector extension not found. Attempting to create it.");
                await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
                console.log("pgvector extension created (or already exists).");
            } else {
                console.log("pgvector extension is already enabled.");
            }
        } finally {
            client.release();
        }
    }

    async _getEmbedding(text) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            // Return an array of nulls or throw error if empty text should not be embedded
            // For pgvector, JSON.stringify([0,0,...]) is valid
            return new Array(EMBEDDING_DIMENSIONS).fill(0);
        }
        try {
            const result = await this.embeddingModel.embedContent(text);
            if (result.embedding.values.length !== EMBEDDING_DIMENSIONS) {
                console.warn(`Embedding dimensions mismatch! Expected ${EMBEDDING_DIMENSIONS}, got ${result.embedding.values.length}.`);
            }
            return result.embedding.values;
        } catch (error) {
            console.error("Error generating embedding:", error);
            // Consider more specific error handling or retry logic here
            throw error;
        }
    }

    async ingestContentEmbeddings() {
        await this.initialize(); // Ensure chatbot is initialized before ingesting
        const client = await this.pool.connect();
        try {
            console.log(`Fetching courses from '${COURSE_TABLE_NAME}' table to generate/update embeddings...`);

            const coursesToProcess = await client.query(
                `SELECT "${COURSE_ID_COLUMN}", "${COURSE_TEXT_COLUMN}" FROM "${COURSE_TABLE_NAME}";`
            );

            console.log(`Found ${coursesToProcess.rows.length} courses to process.`);

            for (const row of coursesToProcess.rows) {
                const courseId = row[COURSE_ID_COLUMN];
                let contentText = '';

                if (row[COURSE_TEXT_COLUMN]) {
                    const courseContentJson = row[COURSE_TEXT_COLUMN];
                    // --- Custom JSON extraction logic ---
                    if (courseContentJson.sections && Array.isArray(courseContentJson.sections)) {
                        contentText = courseContentJson.sections.map(s => s.text || '').join(' ');
                    } else if (typeof courseContentJson === 'string') {
                        contentText = courseContentJson;
                    } else if (typeof courseContentJson === 'object' && courseContentJson !== null) {
                        // Attempt to stringify complex objects if no specific text field is found
                        contentText = JSON.stringify(courseContentJson);
                    }
                    // --- END Custom JSON extraction logic ---
                }

                if (!contentText.trim()) {
                    console.warn(`Skipping embedding for course ID ${courseId} as its content is empty or unextractable.`);
                    continue;
                }

                try {
                    const embedding = await this._getEmbedding(contentText);
                    await client.query(
                        `UPDATE "${COURSE_TABLE_NAME}" SET ${COURSE_EMBEDDING_COLUMN} = $1 WHERE "${COURSE_ID_COLUMN}" = $2;`,
                        [JSON.stringify(embedding), courseId]
                    );
                } catch (err) {
                    console.error(`Failed to update embedding for course ${courseId}:`, err);
                }
            }
            console.log("\nCourse embeddings generation/update complete.");
        } finally {
            client.release();
        }
    }

    async _retrieveRelevantContent(query, numResults = 3) {
        await this.initialize(); // Ensure chatbot is initialized before retrieving
        const queryEmbedding = await this._getEmbedding(query);
        const client = await this.pool.connect();
        try {
            const res = await client.query(
                `SELECT "${COURSE_ID_COLUMN}", "${COURSE_TEXT_COLUMN}"
                 FROM "${COURSE_TABLE_NAME}"
                 WHERE ${COURSE_EMBEDDING_COLUMN} IS NOT NULL
                 ORDER BY (${COURSE_EMBEDDING_COLUMN}::text)::vector <=> $1::vector
                 LIMIT $2;`,
                [JSON.stringify(queryEmbedding), numResults]
            );

            return res.rows.map(row => {
                let contentText = '';
                if (row[COURSE_TEXT_COLUMN]) {
                    const courseContentJson = row[COURSE_TEXT_COLUMN];
                    // --- Custom JSON extraction logic ---
                    if (courseContentJson.sections && Array.isArray(courseContentJson.sections)) {
                        contentText = courseContentJson.sections.map(s => s.text || '').join(' ');
                    } else if (typeof courseContentJson === 'string') {
                        contentText = courseContentJson;
                    } else if (typeof courseContentJson === 'object' && courseContentJson !== null) {
                        contentText = JSON.stringify(courseContentJson);
                    }
                    // --- END Custom JSON extraction logic ---
                }
                return contentText;
            });
        } finally {
            client.release();
        }
    }

    _constructRagPrompt(userQuestion, contextChunks) {
        const contextStr = contextChunks.filter(Boolean).join('\n---\n');

        const prompt = `
        You are a helpful and knowledgeable assistant specializing in the content of our online learning platform. Your goal is to clarify user doubts about specific lessons, articles, or code examples from the provided course content.

        When answering, adhere to the following guidelines:
        1.  **Refer strictly to the provided context.** If the answer is directly in the context, use it. Do not use outside knowledge.
        2.  **Be concise for simple questions, but provide detail when necessary** for complex concepts.
        3.  **If a code snippet is relevant and exists in the context, provide it.** Format code using markdown backticks (\`\`\`).
        4.  **If the answer is not in the provided context, state clearly that you don't have enough information** on that specific topic from the current course content, and suggest they refer to the original lesson or try rephrasing their question.
        5.  **Maintain a supportive and educational tone.**

        ---
        **Context:**
        ${contextStr}
        ---
        **User Question:**
        ${userQuestion}
        ---
        **Answer:**
        `;
        return prompt;
    }

    async chat(userQuestion, history = []) {
        await this.initialize(); // Ensure chatbot is initialized before processing chat
        try {
            console.log(`User query: "${userQuestion}"`);

            const contextChunks = await this._retrieveRelevantContent(userQuestion);
            // Even if no specific context is found, we might want to let the model answer generally
            // or we can keep the strict check. Let's keep the check but maybe relax it if history exists?
            // For now, keeping it strict as per original design.
            if (contextChunks.filter(Boolean).length === 0) {
                // Option: check if it's a follow-up question that doesn't need new context?
                // But for RAG, we usually always want context.
                // Falling back to just history conversation might be okay if the question is "What do you mean?"
                // but "What is the course about?" needs context.
                // Let's proceed with finding context. If none found, we return the standard message.
                return "I couldn't find any relevant course information in my knowledge base for that question. Please try rephrasing or check a different course.";
            }
            console.log("Retrieved context chunks:", contextChunks.map(c => c.substring(0, Math.min(c.length, 50)) + "..."));

            const fullPrompt = this._constructRagPrompt(userQuestion, contextChunks);

            // Start a chat session with history
            const chatSession = this.generationModel.startChat({
                history: history
            });

            // Send the prompt (which includes context + user question)
            // Note: In a pure chat history mode, usually we send just the question, 
            // and the context is added as a system instruction or prepended.
            // However, Gemini's `startChat` history is just previous turns.
            // The `sendMessage` adds the new user turn.
            // Our `_constructRagPrompt` combines context and question into one big string.
            // This is actually okay, as the model will see:
            // User: [Context + Question]
            // Model: Answer
            // User: [Context + Follow-up Question]
            // Model: Helper

            // This works for RAG.
            const result = await chatSession.sendMessage(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (error) {
            console.error("Error during chat processing:", error);
            // Return a user-friendly error message, not the raw error
            return "Oops! Something went wrong while processing your request. Please try again later.";
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log("PostgreSQL pool closed.");
        }
    }
}

// Implement a singleton pattern for Next.js API routes
// This ensures only one instance of the RAGChatbot is created and shared across requests.
let globalChatbotInstance = null;

export function getRAGChatbotInstance() {
    if (!globalChatbotInstance) {
        globalChatbotInstance = new RAGChatbot();
        // You might want to explicitly call initialize() here or in your API route
        // but ensure it's only called once and awaited if necessary.
        // A common pattern is to make API routes await `chatbot.initialize()`
        // on their first run.
    }
    return globalChatbotInstance;
}

// Also export the class itself if you need to instantiate it differently in other contexts
// (e.g., for a dedicated ingestion script)
export default RAGChatbot;