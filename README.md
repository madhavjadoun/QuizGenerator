# Personal Knowledge Search Engine

An AI-powered "Second Brain" to ingest, index, and query your personalized documents. Upload notes, articles, and PDFs, and search them instantly using high-dimensional vector representations and semantic search, or hold context-reinforced conversations with your knowledge database.

---

## Key Features

- 📂 **PDF & Document Upload**: Ingest and structure documents, research papers, notes, and text.
- 🔍 **Semantic Search**: Natural language similarity search to retrieve concepts and answers by meaning.
- 💬 **AI Assistant Chat**: Natural dialogue with an AI assistant contextualized on your uploaded files.
- 📍 **Source Citations**: Inline citations pointing directly to specific pages and paragraphs in the source files.
- 📊 **Vector Embeddings**: Text chunk representation in high-dimensional vector spaces.
- 🕸️ **Knowledge Retrieval**: Unified, graph-like retrieval of notes and highlights for swift semantic parsing.

---

## Technology Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 (Glassmorphic modules, custom @theme configuration)
- **Database**: PostgreSQL (Structured application data)
- **ORM**: Prisma ORM (Type-safe schemas and query generation)
- **Vector Database**: pgvector (Vector search and indexing)
- **AI / LLM Integration**: OpenAI GPT / Google Gemini API (Embeddings & text generation)
- **Language**: TypeScript (Strict Mode)

---

## Folder Structure

```text
src/
 ├── app/                  # App Router components, styles, layouts, metadata
 ├── components/           # UI Elements & layouts
 │    ├── ui/              # Reusable atomic UI (Buttons, cards, etc.)
 │    ├── layout/          # Global layouts (Navbar, Footer, Container)
 │    └── shared/          # Project specific shared modules
 ├── hooks/                # Custom React hooks
 ├── lib/                  # Third-party configurations & clients (Prisma, OpenAI, etc.)
 ├── services/             # Service integration logic
 ├── utils/                # Utility & helper functions
 ├── types/                # Strict TypeScript declaration types
 ├── constants/            # Navigation items, configuration constants
 └── styles/               # Styling configurations
```

---

## Local Setup & Installation

### Prerequisites

- Node.js >= 18.17
- npm or yarn

### Installation Steps

1. **Clone the repository** (or navigate to workspace directory):
   ```bash
   cd /Users/madhavpratapsingh/Desktop/project_1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server (with Turbopack)**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

4. **Build the production bundle**:
   ```bash
   npm run build
   ```

---

## Future Roadmap

### 📅 Day 1: Project Architecture & UI (Current)
- Establish Next.js 15 App router structure.
- Configure Tailwind CSS v4 styling tokens and custom glassmorphism.
- Set up SEO metadata and baseline layout (Container, Navbar, Footer, Button).
- Deploy clean, modern landing page UI.

### 📅 Day 2: Parsing & Database Integration
- Configure Prisma ORM with PostgreSQL database.
- Build API endpoints for files & PDF uploads.
- Build parsing workers to extract clean markdown/text layout from files.

### 📅 Day 3: Embedding Computation & AI Chat
- Configure pgvector schemas for chunks.
- Connect Google Gemini / OpenAI embeddings endpoint.
- Develop vector query pipeline with cosine similarity.
- Implement streaming RAG Chat interface with citation highlighting.
# personal-knowledge-search
