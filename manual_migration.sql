-- Manual migration to fix foreign key constraint issue
-- backend and chatbot updation
-- Run this SQL directly in your database

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE "enrollCourse" DROP CONSTRAINT IF EXISTS "enrollCourse_cid_courses_cid_fk";

-- Add the embedding column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS embedding json;

-- Now add the foreign key constraint back
ALTER TABLE "enrollCourse" ADD CONSTRAINT "enrollCourse_cid_courses_cid_fk" 
FOREIGN KEY ("cid") REFERENCES "courses"("cid");

-- Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS courses_embedding_idx ON courses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
