#!/usr/bin/env node

// Setup script to initialize the chatbot system
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
        console.log('Setting up database for chatbot...');
        
        // Check if pgvector extension exists
        const client = await pool.connect();
        
        try {
            // Enable pgvector extension
            await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
            console.log('✓ pgvector extension enabled');
            
            // Add embedding column if it doesn't exist
            await client.query(`
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS embedding vector(768);
            `);
            console.log('✓ embedding column added to courses table');
            
            // Create index for vector similarity search
            await client.query(`
                CREATE INDEX IF NOT EXISTS courses_embedding_idx 
                ON courses USING ivfflat (embedding vector_cosine_ops) 
                WITH (lists = 100);
            `);
            console.log('✓ vector similarity index created');
            
        } finally {
            client.release();
        }
        
        console.log('Database setup completed successfully!');
        
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the setup
setupDatabase().catch(console.error);
