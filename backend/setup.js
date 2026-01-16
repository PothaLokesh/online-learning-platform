#!/usr/bin/env node

// backend and chatbot updation
require('dotenv').config();

const { Pool } = require('pg');

async function setupDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('backend and chatbot updation');

        // backend and chatbot updation
        const client = await pool.connect();

        try {
            // backend and chatbot updation
            await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
            console.log('backend and chatbot updation');

            // backend and chatbot updation
            await client.query(`
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS embedding vector(768);
            `);
            console.log('backend and chatbot updation');

            // backend and chatbot updation
            await client.query(`
                CREATE INDEX IF NOT EXISTS courses_embedding_idx 
                ON courses USING ivfflat (embedding vector_cosine_ops) 
                WITH (lists = 100);
            `);
            console.log('backend and chatbot updation');

        } finally {
            client.release();
        }

        console.log('backend and chatbot updation');

    } catch (error) {
        console.error('backend and chatbot updation', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// backend and chatbot updation
setupDatabase().catch(console.error);
