#!/usr/bin/env node

// backend and chatbot updation
require('dotenv').config();

const RAGChatbot = require('./chatbotBackend');

async function testChatbot() {
    console.log('backend and chatbot updation');

    try {
        // backend and chatbot updation
        console.log('backend and chatbot updation');
        const chatbot = new RAGChatbot();

        // backend and chatbot updation
        console.log('backend and chatbot updation');
        await chatbot._ensurePgVectorExtension();

        // backend and chatbot updation
        console.log('backend and chatbot updation');
        const testEmbedding = await chatbot._getEmbedding("This is a test question about JavaScript.");
        console.log(`backend and chatbot updation`);

        // backend and chatbot updation
        console.log('backend and chatbot updation');
        try {
            const relevantContent = await chatbot._retrieveRelevantContent("JavaScript basics", 2);
            console.log(`backend and chatbot updation`);
        } catch (error) {
            console.log('backend and chatbot updation');
        }

        // backend and chatbot updation
        console.log('backend and chatbot updation');
        try {
            const response = await chatbot.chat("What is JavaScript?");
            console.log('backend and chatbot updation');
            console.log(`backend and chatbot updation`);
        } catch (error) {
            console.log('backend and chatbot updation');
        }

        // backend and chatbot updation
        await chatbot.close();

        console.log('\nbackend and chatbot updation');
        console.log('\nbackend and chatbot updation');
        console.log('backend and chatbot updation');
        console.log('backend and chatbot updation');
        console.log('backend and chatbot updation');
        console.log('backend and chatbot updation');

    } catch (error) {
        console.error('backend and chatbot updation', error.message);
        console.log('\nbackend and chatbot updation');
        console.log('backend and chatbot updation');
        console.log('backend and chatbot updation');
        console.log('backend and chatbot updation');
        process.exit(1);
    }
}

// backend and chatbot updation
testChatbot().catch(console.error);
