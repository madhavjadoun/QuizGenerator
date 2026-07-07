# AI Quiz Generator
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8)
![Gemini AI](https://img.shields.io/badge/Google-Gemini-orange)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB)
![RAG](https://img.shields.io/badge/AI-RAG-purple)

An AI-powered Quiz Generator that transforms PDFs into intelligent multiple-choice quizzes. Upload study materials, research papers, notes, or books, and instantly generate high-quality MCQs using AI, semantic retrieval, and document understanding.

---

## 🚀 Features

- 📄 Upload PDF documents
- 🧠 AI-powered MCQ generation
- 📚 Supports both text-based and scanned PDFs
- 🔍 Adaptive document parsing & semantic chunking
- 🤖 Intelligent question generation using Google Gemini
- 📊 Multiple quiz sizes (up to 50 questions)
- 💬 AI Chat Assistant for document-related queries
- 📈 Quiz history & performance tracking
- 🎯 Automatic scoring and answer evaluation
- ⚡ Daily credit system
- 🔐 Secure authentication with Supabase
- ☁️ FastAPI backend with REST APIs
- 🎨 Modern responsive UI built with Next.js & Tailwind CSS

---

# ✨ How It Works

1. User uploads a PDF.
2. Backend extracts text using PDF parser.
3. Large documents are intelligently chunked.
4. Embeddings are generated for semantic understanding.
5. Relevant chunks are retrieved using similarity search.
6. Gemini generates high-quality MCQs from retrieved content.
7. Users attempt quizzes and receive instant results.

---

# 🏗️ Tech Stack

## Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Supabase Authentication

## Backend

- FastAPI
- Python
- Uvicorn
- Pydantic
- pdfplumber
- pytesseract (OCR)
- Google Gemini API

## Database & Storage

- Supabase PostgreSQL
- Supabase Storage

## AI

- Google Gemini
- Semantic Chunking
- Retrieval-Augmented Generation (RAG)
- Vector Embeddings

---

# 📂 Project Structure

```text
project_1/

├── backend/
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── main.py
│   └── requirements.txt
│
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   └── types/
│
├── public/
├── .env
├── package.json
└── README.md
```

---

# ⚙️ Local Setup

## Prerequisites

- Node.js 18+
- Python 3.10+
- npm
- Git

---

## 1. Clone Repository

```bash
git clone <repository-url>
cd project_1
```

---

## 2. Install Frontend

```bash
npm install
```

---

## 3. Install Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate
# Windows
# venv\Scripts\activate

pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create:

```
.env
backend/.env
```

Add required credentials:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

GEMINI_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 5. Run Backend

```bash
cd backend

source venv/bin/activate

uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

## 6. Run Frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# 📖 Application Workflow

```text
Upload PDF
      │
      ▼
Extract Text
      │
      ▼
Document Analysis
      │
      ▼
Semantic Chunking
      │
      ▼
Embedding Generation
      │
      ▼
Relevant Chunk Retrieval
      │
      ▼
Gemini AI
      │
      ▼
MCQ Generation
      │
      ▼
Quiz Attempt
      │
      ▼
Result & Analytics
```

---

# 🎯 Core Modules

- Authentication
- PDF Upload
- PDF Parsing
- OCR Support
- Adaptive Chunk Generator
- Embedding Service
- Quiz Generator
- Quiz History
- Credits Management
- AI Chat
- Dashboard

---

# 🔒 Authentication

- Google Login
- Email Authentication
- Secure JWT-based sessions
- User-specific documents & quizzes

---

# 📊 Current Features

- ✅ AI Quiz Generation
- ✅ PDF Upload
- ✅ OCR Support
- ✅ Adaptive Chunking
- ✅ Semantic Retrieval
- ✅ Dashboard
- ✅ Quiz History
- ✅ AI Chat
- ✅ Daily Credits
- ✅ Responsive UI

---
## 🌐 Live Demo

https://www.quizgens.tech/
---

# 🚀 Future Improvements

- DOCX Support
- PPT Support
- Flashcard Generation
- Difficulty Levels
- Timed Exams
- Leaderboard
- Quiz Sharing
- Team Workspace
- Export Quiz as PDF
- Multi-language Support

---

# 👨‍💻 Author

**Madhav Pratap Singh**

B.Tech CSE

GLA University

---

# 📄 License

This project is developed for educational and learning purposes.
