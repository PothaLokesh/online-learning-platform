# RAG Chatbot Integration for Online Learning Platform
<!-- backend and chatbot updation -->

This integration adds a RAG (Retrieval-Augmented Generation) chatbot to your online learning platform using Google's Gemini AI and PostgreSQL with pgvector for vector embeddings.

## Features

- **Course-specific AI Assistant**: Students can ask questions about course content
- **Vector-based Search**: Uses embeddings to find relevant course material
- **Real-time Chat Interface**: Floating chat widget in course pages
- **Context-aware Responses**: AI responses are based on actual course content

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Google AI API Key (required)
GOOGLE_API_KEY=your_google_api_key_here

# Database URL (should already exist)
DATABASE_URL=your_postgresql_connection_string

# Backend Port (optional, defaults to 3001)
PORT=3001
```

### 2. Database Setup

Run the database migration to add the embedding column:

```bash
# Option 1: Run the setup script
cd backend
node setup.js

# Option 2: Run the SQL migration manually
psql $DATABASE_URL -f migration.sql
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if not already done)
cd ..
npm install
```

### 4. Generate Embeddings

Before the chatbot can answer questions, you need to generate embeddings for your course content:

```bash
# Option 1: Use the ingest script
cd backend
npm run ingest

# Option 2: Use the API endpoint
curl -X PUT http://localhost:3000/api/chatbot
```

### 5. Start the Application

```bash
# Start Next.js frontend (from root directory)
npm run dev

# Start backend server (optional - if using standalone backend)
cd backend
npm run dev
```

## Usage

1. Navigate to any course page
2. Look for the floating chat button in the bottom-right corner
3. Click to open the chatbot widget
4. Ask questions about the course content
5. The AI will provide answers based on the course material

## API Endpoints

### POST /api/chatbot
Ask a question to the chatbot.

**Request:**
```json
{
  "question": "What is asynchronous JavaScript?"
}
```

**Response:**
```json
{
  "answer": "Asynchronous JavaScript allows code to run without blocking..."
}
```

### PUT /api/chatbot
Trigger embeddings ingestion for all courses.

**Response:**
```json
{
  "message": "Embeddings ingestion triggered successfully."
}
```

## File Structure

```
├── backend/
│   ├── chatbotBackend.js    # RAG chatbot implementation
│   ├── server.js            # Express server (standalone)
│   ├── setup.js             # Database setup script
│   ├── migration.sql        # SQL migration
│   └── package.json         # Backend dependencies
├── app/
│   ├── api/
│   │   └── chatbot/
│   │       └── route.js     # Next.js API route
│   └── course/
│       └── _components/
│           ├── ChapterContent.jsx  # Updated with chatbot
│           └── ChatbotWidget.jsx # Chat interface component
└── config/
    └── schema.js            # Updated with embedding column
```

## How It Works

1. **Content Ingestion**: Course content is processed and converted to vector embeddings using Google's text-embedding-004 model
2. **Question Processing**: User questions are converted to embeddings
3. **Similarity Search**: Vector similarity search finds the most relevant course content
4. **Response Generation**: Google's Gemini Pro model generates responses based on the retrieved content

## Customization

### Modifying the Chat Interface

Edit `app/course/_components/ChatbotWidget.jsx` to customize:
- Widget appearance and positioning
- Chat history display
- Input validation
- Error handling

### Adjusting AI Behavior

Edit `backend/chatbotBackend.js` to modify:
- Prompt templates
- Number of context chunks retrieved
- Embedding model settings
- Response formatting

### Database Schema Changes

If you modify the course content structure, update the text extraction logic in:
- `ingestContentEmbeddings()` method
- `_retrieveRelevantContent()` method

## Troubleshooting

### Common Issues

1. **"pgvector extension not found"**
   - Run the database setup script: `node backend/setup.js`

2. **"No relevant course information found"**
   - Generate embeddings: `npm run ingest` in backend directory
   - Check if course content exists in the database

3. **API errors**
   - Verify GOOGLE_API_KEY is set correctly
   - Check DATABASE_URL connection string
   - Ensure all dependencies are installed

### Performance Optimization

- The vector similarity index is created automatically
- For large datasets, consider running embeddings ingestion as a background job
- Monitor API usage with Google's Gemini API

## Security Notes

- The chatbot only accesses course content from your database
- No external data sources are used for responses
- API keys should be kept secure and not committed to version control
