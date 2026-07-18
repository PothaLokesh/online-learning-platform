import { NextResponse } from 'next/server';
import RAGChatbot from '@/lib/chatbotBackend';

let chatbot;

// Initialize chatbot instance
async function initializeChatbot() {
    if (!chatbot) {
        chatbot = new RAGChatbot();
        try {
            await chatbot._ensurePgVectorExtension();
            console.log("Chatbot initialized for API route.");
        } catch (error) {
            console.error("Failed to initialize chatbot:", error);
            throw error;
        }
    }
    return chatbot;
}

export async function POST(request) {
    try {
        const { question, courseId, history } = await request.json();

        if (!question) {
            return NextResponse.json(
                { error: "Question is required." },
                { status: 400 }
            );
        }

        // Initialize chatbot if not already done
        const chatbotInstance = await initializeChatbot();

        // Get response from chatbot
        const response = await chatbotInstance.chat(question, courseId, history);

        return NextResponse.json({ answer: response });
    } catch (error) {
        console.error("Error in chatbot API:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        // Initialize chatbot if not already done
        const chatbotInstance = await initializeChatbot();

        // Trigger embeddings ingestion
        await chatbotInstance.ingestContentEmbeddings();

        return NextResponse.json({
            message: "Embeddings ingestion triggered successfully."
        });
    } catch (error) {
        console.error("Error in embeddings ingestion:", error);
        return NextResponse.json(
            { error: "Failed to trigger embeddings ingestion." },
            { status: 500 }
        );
    }
}
