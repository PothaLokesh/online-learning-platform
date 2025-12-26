# Online Learning Platform with RAG Chatbot

![Project Banner](https://via.placeholder.com/1200x300?text=Online+Learning+Platform+with+AI+Assistant)

## 🚀 Unique Properties

This is not just another learning platform. It distinguishes itself with advanced **AI integration** designed to enhance the student learning experience:

*   **🧠 Intelligent RAG Chatbot**: Built-in AI assistant that uses **Retrieval Augmented Generation (RAG)** to answer student questions based *strictly* on the course content. It doesn't hallucinate; it "reads" the course material to give accurate answers.
*   **💎 Google Gemini Powered**: Leverages Google's state-of-the-art **Gemini Flash (`gemini-flash-latest`)** for fast, natural language understanding and generation.
*   **🔎 Vector Search with pgvector**: Utilizes **PostgreSQL with `pgvector`** to perform semantic searches on course content. It understands the *meaning* of a question, not just keyword matching.
*   **🔄 Automatic Embeddings Pipeline**: Includes a system to automatically generate and update vector embeddings using **`text-embedding-004`** whenever course content is updated.
*   **📅 Smart Context Awareness**: The AI retrieves specific course sections, code snippets, and lessons relevant to the user's query to provide precise, context-aware help.

---

## 📖 Project Overview

This is a full-stack Online Learning Platform designed to provide an interactive and supported learning environment. Beyond standard features like course listings and progress tracking, it embeds a powerful AI tutor that helps students clarify doubts instantly without leaving the platform.

## ✨ Key Features

-   **Interactive AI Tutor**: A floating chatbot widget available on course pages.
-   **Course Management**: efficiently organize and display learning materials.
-   **Semantic Search**: Find relevant lessons by asking natural language questions.
-   **Modern UI/UX**: Built with a responsive design for desktop and mobile learning.
-   **Secure Database**: Robust data handling with PostgreSQL.

## 🛠️ Tech Stack

*   **Frontend**: Next.js (App Router), React, Tailwind CSS
*   **Backend**: Next.js API Routes (Serverless)
*   **Database**: PostgreSQL (with `pgvector` extension)
*   **AI/ML**: Google Generative AI (Gemini), LangChain (concepts used for RAG logic)
*   **Driver**: `pg` (node-postgres)
*   **Embeddings**: `text-embedding-004`

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL database (local or cloud like Neon/Supabase)
*   Google Cloud API Key (with Gemini API access)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/online-learning-platform.git
    cd online-learning-platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following keys:
    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

    # Google Gemini API
    GOOGLE_API_KEY="your_google_api_key_here"
    # or
    GEMINI_API_KEY="your_google_api_key_here"
    ```

4.  **Initialize Database:**
    Ensure your PostgreSQL database has the `vector` extension enabled. The project attempts to create it automatically, but you can run:
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

6.  **Open the App:**
    Visit `http://localhost:3000` in your browser.

## 🧠 AI Embeddings Setup

To make the chatbot work, you need to generate embeddings for your course content.

1.  Populate your database with courses.
2.  Trigger the embedding generation endpoint (e.g., via a simplified UI button or curl command if configured):
    ```bash
    curl -X PUT http://localhost:3000/api/chatbot
    ```
    *This acts as a manual trigger to ingest and vectorize course content.*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
