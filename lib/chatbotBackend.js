// backend and chatbot updation
// import 'dotenv/config';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pool } from 'pg';

// backend and chatbot updation
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// backend and chatbot updation
// backend and chatbot updation
// backend and chatbot updation
if (!API_KEY) {
    console.error("backend and chatbot updation");
}
if (!DATABASE_URL) {
    console.error("backend and chatbot updation");
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
    constructor() {
        if (!API_KEY || !DATABASE_URL) {
            // backend and chatbot updation
            // backend and chatbot updation
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

        // backend and chatbot updation
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    async initialize() {
        if (this.isInitialized) {
            return; // backend and chatbot updation
        }
        if (this.initializationPromise) {
            return this.initializationPromise; // backend and chatbot updation
        }

        this.initializationPromise = (async () => {
            try {
                console.log("backend and chatbot updation");
                await this._ensurePgVectorExtension();
                // backend and chatbot updation
                // backend and chatbot updation
                this.isInitialized = true;
                console.log("backend and chatbot updation");
            } catch (error) {
                console.error("backend and chatbot updation", error);
                // backend and chatbot updation
                await this.pool.end();
                throw error; // backend and chatbot updation
            } finally {
                this.initializationPromise = null; // backend and chatbot updation
            }
        })();

        return this.initializationPromise;
    }

    async _ensurePgVectorExtension() {
        const client = await this.pool.connect();
        try {
            const checkVector = await client.query("SELECT 1 FROM pg_extension WHERE extname = 'vector'");
            if (checkVector.rows.length === 0) {
                console.warn("backend and chatbot updation");
                await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
                console.log("backend and chatbot updation");
            } else {
                console.log("backend and chatbot updation");
            }
        } finally {
            client.release();
        }
    }

    async _getEmbedding(text) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            // backend and chatbot updation
            // backend and chatbot updation
            return new Array(EMBEDDING_DIMENSIONS).fill(0);
        }
        try {
            const result = await this.embeddingModel.embedContent({
                content: { parts: [{ text: text }] },
                outputDimensionality: EMBEDDING_DIMENSIONS
            });
            if (result.embedding.values.length !== EMBEDDING_DIMENSIONS) {
                console.warn(`backend and chatbot updation`);
            }
            return result.embedding.values;
        } catch (error) {
            console.error("backend and chatbot updation", error);
            // backend and chatbot updation
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

    async ingestContentEmbeddings() {
        await this.initialize(); // backend and chatbot updation
        const client = await this.pool.connect();
        try {
            console.log(`backend and chatbot updation`);

            const coursesToProcess = await client.query(
                `SELECT "${COURSE_ID_COLUMN}", "${COURSE_TEXT_COLUMN}" FROM "${COURSE_TABLE_NAME}";`
            );

            console.log(`backend and chatbot updation`);

            for (const row of coursesToProcess.rows) {
                const courseId = row[COURSE_ID_COLUMN];
                const contentText = extractTextFromCourseContent(row[COURSE_TEXT_COLUMN]);

                if (!contentText.trim()) {
                    console.warn(`backend and chatbot updation`);
                    continue;
                }

                // Add 2-second delay to avoid 429 rate limit
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    const embedding = await this._getEmbeddingWithRetry(contentText);
                    await client.query(
                        `UPDATE "${COURSE_TABLE_NAME}" SET "${COURSE_EMBEDDING_COLUMN}" = $1 WHERE "${COURSE_ID_COLUMN}" = $2;`,
                        [JSON.stringify(embedding), courseId]
                    );
                } catch (err) {
                    console.error(`backend and chatbot updation`, err);
                }
            }
            console.log("\nbackend and chatbot updation");
        } finally {
            client.release();
        }
    }

    async _retrieveRelevantContent(query, courseId, numResults = 3) {
        await this.initialize(); // backend and chatbot updation
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

            return res.rows.map(row => {
                return extractTextFromCourseContent(row[COURSE_TEXT_COLUMN]);
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

    async chat(userQuestion, courseId, history = []) {
        await this.initialize(); // backend and chatbot updation
        try {
            console.log(`backend and chatbot updation`);

            const contextChunks = await this._retrieveRelevantContent(userQuestion, courseId);
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            if (contextChunks.filter(Boolean).length === 0) {
                // backend and chatbot updation
                // backend and chatbot updation
                // backend and chatbot updation
                // backend and chatbot updation
                // backend and chatbot updation
                return "I couldn't find any relevant course information in my knowledge base for that question. Please try rephrasing or check a different course.";
            }
            console.log("backend and chatbot updation", contextChunks.map(c => c.substring(0, Math.min(c.length, 50)) + "..."));

            const fullPrompt = this._constructRagPrompt(userQuestion, contextChunks);

            // backend and chatbot updation
            const chatSession = this.generationModel.startChat({
                history: history
            });

            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            // backend and chatbot updation
            const result = await chatSession.sendMessage(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (error) {
            console.error("backend and chatbot updation", error);
            // backend and chatbot updation
            return "Oops! Something went wrong while processing your request. Please try again later.";
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log("backend and chatbot updation");
        }
    }
}

// backend and chatbot updation
// backend and chatbot updation
let globalChatbotInstance = null;

export function getRAGChatbotInstance() {
    if (!globalChatbotInstance) {
        globalChatbotInstance = new RAGChatbot();
        // backend and chatbot updation
        // backend and chatbot updation
        // backend and chatbot updation
        // backend and chatbot updation
    }
    return globalChatbotInstance;
}

// backend and chatbot updation
// backend and chatbot updation
export default RAGChatbot;