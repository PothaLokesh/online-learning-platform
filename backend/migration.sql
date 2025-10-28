-- Migration to add embedding column to courses table
-- Run this SQL in your PostgreSQL database

-- First, ensure pgvector extension is installed
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for vector similarity search (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS courses_embedding_idx ON courses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
