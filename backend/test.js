#!/usr/bin/env node

// Test script for the chatbot integration
require('dotenv').config();

const RAGChatbot = require('./chatbotBackend');

async function testChatbot() {
    console.log('🤖 Testing RAG Chatbot Integration...\n');
    
    try {
        // Initialize chatbot
        console.log('1. Initializing chatbot...');
        const chatbot = new RAGChatbot();
        
        // Ensure pgvector extension
        console.log('2. Ensuring pgvector extension...');
        await chatbot._ensurePgVectorExtension();
        
        // Test embedding generation
        console.log('3. Testing embedding generation...');
        const testEmbedding = await chatbot._getEmbedding("This is a test question about JavaScript.");
        console.log(`   ✓ Generated embedding with ${testEmbedding.length} dimensions`);
        
        // Test content retrieval (if embeddings exist)
        console.log('4. Testing content retrieval...');
        try {
            const relevantContent = await chatbot._retrieveRelevantContent("JavaScript basics", 2);
            console.log(`   ✓ Retrieved ${relevantContent.length} content chunks`);
        } catch (error) {
            console.log('   ⚠ No embeddings found - run ingestion first');
        }
        
        // Test chat functionality
        console.log('5. Testing chat functionality...');
        try {
            const response = await chatbot.chat("What is JavaScript?");
            console.log('   ✓ Chat response generated:');
            console.log(`   "${response.substring(0, 100)}..."`);
        } catch (error) {
            console.log('   ⚠ Chat test failed - may need embeddings');
        }
        
        // Close connections
        await chatbot.close();
        
        console.log('\n✅ Chatbot integration test completed!');
        console.log('\nNext steps:');
        console.log('1. Run "npm run chatbot:setup" to set up the database');
        console.log('2. Run "npm run chatbot:ingest" to generate embeddings');
        console.log('3. Start your Next.js app with "npm run dev"');
        console.log('4. Visit a course page and test the chatbot widget');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check your .env file has GOOGLE_API_KEY and DATABASE_URL');
        console.log('2. Ensure your database is accessible');
        console.log('3. Verify all dependencies are installed');
        process.exit(1);
    }
}

// Run the test
testChatbot().catch(console.error);
