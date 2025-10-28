import 'dotenv/config'; // Load environment variables
import express from 'express';
import cors from 'cors'; // If your frontend is on a different origin
import bodyParser from 'body-parser'; // To parse JSON request bodies

import RAGChatbot from './chatbotBackend.js'; // Import your chatbot class

const app = express();
const port = process.env.PORT || 3001; // Your backend port

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(bodyParser.json()); // Parse JSON request bodies

let chatbot; // Declare chatbot instance globally or pass it around

async function initializeChatbot() {
    chatbot = new RAGChatbot();
    try {
        await chatbot._ensurePgVectorExtension(); // Ensure pgvector is active
        // It's crucial to await this if you want embeddings to be ready immediately
        // In a real application, you might have this ingestion run as a scheduled job
        // or a separate process, not every time the server starts.
        await chatbot.ingestContentEmbeddings();
        console.log("Chatbot initialized and embeddings processed.");
    } catch (error) {
        console.error("Failed to initialize chatbot:", error);
        process.exit(1); // Exit if chatbot can't be initialized
    }
}

// --- API Routes ---

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required." });
    }

    try {
        const response = await chatbot.chat(question);
        res.json({ answer: response });
    } catch (error) {
        console.error("Error in /api/chat:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

// Optional: Endpoint to manually trigger ingestion (useful for development/testing)
app.post('/api/ingest-embeddings', async (req, res) => {
    try {
        await chatbot.ingestContentEmbeddings();
        res.json({ message: "Embeddings ingestion triggered successfully." });
    } catch (error) {
        console.error("Error in /api/ingest-embeddings:", error);
        res.status(500).json({ error: "Failed to trigger embeddings ingestion." });
    }
});


// Start the server
initializeChatbot().then(() => {
    app.listen(port, () => {
        console.log(`Backend API listening at http://localhost:${port}`);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing chatbot resources.');
    if (chatbot) {
        await chatbot.close();
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing chatbot resources.');
    if (chatbot) {
        await chatbot.close();
    }
    process.exit(0);
});
