"""
main.py — FastAPI entry point for the PDF Quiz Generator API.

Responsibilities:
  - Boot the FastAPI application
  - Configure CORS for the Next.js frontend
  - Mount all routers
  - Expose a health-check endpoint
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import documents, quiz

# ── Load environment variables from .env ──────────────────────────────────────
load_dotenv()

# ── Application factory ───────────────────────────────────────────────────────
app = FastAPI(
    title="PDF Quiz Generator API",
    description="A FastAPI backend that parses PDFs and generates MCQ quizzes via Gemini.",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def health_check() -> dict:
    """Return a simple health-check payload to confirm the API is running."""
    return {"status": "ok", "message": "Quiz Generator API running"}
