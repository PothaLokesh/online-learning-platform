import 'dotenv/config'; // Load environment variables from .env

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pool } from 'pg'; // PostgreSQL client

// --- Configuration ---
const API_KEY = process.env.GOOGLE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_KEY) {
    console.error("GOOGLE_API_KEY not found in .env file. Please set it.");
    process.exit(1);
}
if (!DATABASE_URL) {
    console.error("DATABASE_URL not found in .env file. Please set it to your Neon PostgreSQL connection string.");
    process.exit(1);
}

const GENERATION_MODEL_NAME = "gemini-flash-latest";
const EMBEDDING_MODEL_NAME = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 768;

const COURSE_TABLE_NAME = "courses";
const COURSE_ID_COLUMN = "cid";
const COURSE_TEXT_COLUMN = "courseContent";
const COURSE_EMBEDDING_COLUMN = "embedding";

function extractTextFromCourseContent(courseContentJson) {
    if (!courseContentJson) return '';
    if (typeof courseContentJson === 'string') {
        try {
            const parsed = JSON.parse(courseContentJson);
            return extractTextFromCourseContent(parsed);
        } catch {
            return courseContentJson;
        }
    }
    if (Array.isArray(courseContentJson)) {
        return courseContentJson.map(chapter => {
            const chapterName = chapter?.courseData?.chapterName || '';
            const topicsText = Array.isArray(chapter?.courseData?.topics) 
                ? chapter.courseData.topics.map(t => `${t.topic}\n${t.content || ''}`).join('\n')
                : '';
            return `${chapterName}\n${topicsText}`;
        }).join('\n\n');
    }
    if (typeof courseContentJson === 'object') {
        if (courseContentJson.sections && Array.isArray(courseContentJson.sections)) {
            return courseContentJson.sections.map(s => s.text || '').join(' ');
        }
        return JSON.stringify(courseContentJson);
    }
    return '';
}

class RAGChatbot {
    constructor() { // Removed contentData from constructor, will fetch from DB
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.generationModel = this.genAI.getGenerativeModel({ model: GENERATION_MODEL_NAME });
        this.embeddingModel = this.genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });

        this.pool = new Pool({
            connectionString: DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        // We still need to ensure pgvector is enabled, but Drizzle handles table creation/updates
        this._ensurePgVectorExtension().catch(console.error);
    }

    // New method to just ensure pgvector is enabled
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
        // Ensure text is not null or empty for embedding
        if (!text || typeof text !== 'string' || text.trim() === '') {
            // Return a zero vector or throw an error if empty text can't be embedded
            // Returning a zero vector is a common way to handle this, but might affect similarity
            return new Array(EMBEDDING_DIMENSIONS).fill(0);
        }
        try {
            const result = await this.embeddingModel.embedContent({
                content: { parts: [{ text: text }] },
                outputDimensionality: EMBEDDING_DIMENSIONS
            });
            if (result.embedding.values.length !== EMBEDDING_DIMENSIONS) {
                console.warn(`Embedding dimensions mismatch! Expected ${EMBEDDING_DIMENSIONS}, got ${result.embedding.values.length}.`);
            }
            return result.embedding.values;
        } catch (error) {
            console.error("Error generating embedding:", error);
            throw error;
        }
    }

    async _getEmbeddingWithRetry(text, retries = 5, delay = 2000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this._getEmbedding(text);
            } catch (error) {
                if (error.status === 429 && i < retries - 1) {
                    const waitTime = delay * Math.pow(2, i);
                    console.warn(`429 Rate Limit hit. Retrying in ${waitTime}ms (Attempt ${i + 1}/${retries})...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    throw error;
                }
            }
        }
    }

    // This method will now update existing rows in 'courses' table
    async ingestContentEmbeddings() {
        const client = await this.pool.connect();
        try {
            console.log(`Fetching courses from '${COURSE_TABLE_NAME}' table to generate/update embeddings...`);

            // Select all courses that don't have an embedding or whose content might have changed
            // For simplicity, we'll process all for now. In production, add a flag or timestamp.
            const coursesToProcess = await client.query(
                `SELECT "${COURSE_ID_COLUMN}", "${COURSE_TEXT_COLUMN}" FROM "${COURSE_TABLE_NAME}";`
            );

            console.log(`Found ${coursesToProcess.rows.length} courses to process.`);

            for (const row of coursesToProcess.rows) {
                const courseId = row[COURSE_ID_COLUMN];
                const contentText = extractTextFromCourseContent(row[COURSE_TEXT_COLUMN]);

                if (!contentText.trim()) {
                    console.warn(`Skipping embedding for course ID ${courseId} as its content is empty.`);
                    continue; // Skip if no meaningful text
                }

                // Add 2-second delay to avoid 429 rate limit
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    const embedding = await this._getEmbeddingWithRetry(contentText);
                    await client.query(
                        `UPDATE "${COURSE_TABLE_NAME}" SET "${COURSE_EMBEDDING_COLUMN}" = $1 WHERE "${COURSE_ID_COLUMN}" = $2;`,
                        [JSON.stringify(embedding), courseId]
                    );
                    process.stdout.write('.'); // Show progress
                } catch (err) {
                    console.error(`\nFailed to generate embedding for course ID ${courseId}:`, err.message);
                }
            }
            console.log("\nCourse embeddings generation/update complete.");
        } finally {
            client.release();
        }
    }

    // This method will now retrieve from the 'courses' table
    async _retrieveRelevantContent(query, courseId, numResults = 3) {
        const queryEmbedding = await this._getEmbeddingWithRetry(query);
        const client = await this.pool.connect();
        try {
            let queryStr = `
                SELECT "${COURSE_ID_COLUMN}", "${COURSE_TEXT_COLUMN}" 
                FROM "${COURSE_TABLE_NAME}" 
                WHERE "${COURSE_EMBEDDING_COLUMN}" IS NOT NULL`;
            
            const params = [JSON.stringify(queryEmbedding), numResults];
            
            if (courseId) {
                queryStr += ` AND "${COURSE_ID_COLUMN}" = $3`;
                params.push(courseId);
            }
            
            queryStr += ` ORDER BY ("${COURSE_EMBEDDING_COLUMN}"::text)::vector <=> $1::vector LIMIT $2;`;

            const res = await client.query(queryStr, params);
            
            // Return the full content object (or just the text part)
            return res.rows.map(row => {
                return extractTextFromCourseContent(row[COURSE_TEXT_COLUMN]);
            });
        } finally {
            client.release();
        }
    }

    _constructRagPrompt(userQuestion, contextChunks) {
        // ... (Prompt construction logic remains the same) ...
        const contextStr = contextChunks.filter(Boolean).join('\n---\n'); // Filter out empty strings

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

    async chat(userQuestion, courseId, history = []) {
        try {
            console.log(`User query: "${userQuestion}"`);

            // 1. Retrieve relevant content from PostgreSQL
            const contextChunks = await this._retrieveRelevantContent(userQuestion, courseId);
            if (contextChunks.filter(Boolean).length === 0) { // Check if there's any actual content after filtering
                return "I couldn't find any relevant course information in my knowledge base for that question. Please try rephrasing or check a different course.";
            }
            console.log("Retrieved context chunks:", contextChunks.map(c => c.substring(0, Math.min(c.length, 50)) + "...")); // Log first 50 chars

            // 2. Construct RAG prompt
            const fullPrompt = this._constructRagPrompt(userQuestion, contextChunks);

            // 3. Send to Gemini API for generation
            const result = await this.generationModel.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (error) {
            console.error("Error during chat processing:", error);
            return "Oops! Something went wrong while processing your request. Please try again.";
        }
    }

    async close() {
        await this.pool.end();
        console.log("PostgreSQL pool closed.");
    }
}

export default RAGChatbot;
