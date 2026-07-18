import 'dotenv/config'; // backend and chatbot updation
import express from 'express';
import cors from 'cors'; // backend and chatbot updation
import bodyParser from 'body-parser'; // backend and chatbot updation

import RAGChatbot from './chatbotBackend.js'; // backend and chatbot updation

const app = express();
const port = process.env.PORT || 3001; // backend and chatbot updation

// backend and chatbot updation
app.use(cors()); // backend and chatbot updation
app.use(bodyParser.json()); // backend and chatbot updation

let chatbot; // backend and chatbot updation

async function initializeChatbot() {
    chatbot = new RAGChatbot();
    try {
        await chatbot._ensurePgVectorExtension(); // backend and chatbot updation
        console.log("Chatbot initialized.");
    } catch (error) {
        console.error("backend and chatbot updation", error);
        process.exit(1); // backend and chatbot updation
    }
}

// backend and chatbot updation
app.post('/api/chat', async (req, res) => {
    const { question, courseId, history } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required." });
    }

    try {
        const response = await chatbot.chat(question, courseId, history);
        res.json({ answer: response });
    } catch (error) {
        console.error("backend and chatbot updation", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

// backend and chatbot updation
app.post('/api/ingest-embeddings', async (req, res) => {
    try {
        await chatbot.ingestContentEmbeddings();
        res.json({ message: "Embeddings ingestion triggered successfully." });
    } catch (error) {
        console.error("backend and chatbot updation", error);
        res.status(500).json({ error: "Failed to trigger embeddings ingestion." });
    }
});


// backend and chatbot updation
initializeChatbot().then(() => {
    app.listen(port, () => {
        console.log(`backend and chatbot updation`);
    });
}).catch(err => {
    console.error("backend and chatbot updation", err);
    process.exit(1);
});

// backend and chatbot updation
process.on('SIGTERM', async () => {
    console.log('backend and chatbot updation');
    if (chatbot) {
        await chatbot.close();
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('backend and chatbot updation');
    if (chatbot) {
        await chatbot.close();
    }
    process.exit(0);
});
