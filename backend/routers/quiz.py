"""
routers/quiz.py — Quiz generation and history endpoints.

POST /quiz/generate              — generate an MCQ quiz from a document's chunks
GET  /quiz/history/{document_id} — return all quizzes for a document
"""

from __future__ import annotations

import random
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.gemini_client import generate_quiz
from services.supabase_client import get_chunks, get_quiz_history, save_quiz

router = APIRouter()

# ── Number of chunks to sample for large PDFs ─────────────────────────────────
LARGE_PDF_CHUNK_SAMPLE = 3


# ── Request models ────────────────────────────────────────────────────────────

class GenerateQuizRequest(BaseModel):
    """Request body for POST /quiz/generate."""

    document_id: str
    """UUID of the document to generate a quiz from."""

    user_id: str
    """UUID of the requesting user (used for auth checks in future)."""

    num_questions: int = 10
    """How many questions to generate (limit 50, defaults to 10)."""


# ── POST /quiz/generate ───────────────────────────────────────────────────────

@router.post("/generate", status_code=201)
async def generate_quiz_endpoint(body: GenerateQuizRequest) -> dict[str, Any]:
    """
    Generate a 10-question MCQ quiz for a document and persist it.

    Steps:
      1. Fetch all chunks for the document.
      2. For large PDFs (> 1 chunk), randomly sample up to 3 chunks.
         For small PDFs (1 chunk), use the full text.
      3. Combine selected chunks into a single context string.
      4. Call Gemini to generate questions.
      5. Persist quiz + questions to Supabase.
      6. Return the complete quiz payload.

    Returns:
        {
            "quiz_id":   str,
            "document_id": str,
            "questions": [
                {
                    "question":     str,
                    "options":      list[str],   # 4 items
                    "correct":      str,
                    "explanation":  str,
                },
                ...
            ]
        }
    """
    document_id = body.document_id.strip()
    user_id     = body.user_id.strip()
    num_questions = body.num_questions

    if not document_id or not user_id:
        raise HTTPException(
            status_code=400,
            detail="Both document_id and user_id must be non-empty strings."
        )

    if num_questions < 1 or num_questions > 50:
        raise HTTPException(
            status_code=400,
            detail="Number of questions (num_questions) must be between 1 and 50."
        )

    print(f"[quiz] Generate request — document_id='{document_id}', user_id='{user_id}', num_questions={num_questions}")

    # ── 1. Fetch chunks ───────────────────────────────────────────────────────
    try:
        chunks = get_chunks(document_id)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch document chunks: {exc}",
        ) from exc

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No chunks found for document_id='{document_id}'. "
                "Ensure the document was uploaded and processed successfully."
            ),
        )

    print(f"[quiz] Found {len(chunks)} chunk(s) for document '{document_id}'")

    # ── 2. Select chunks ──────────────────────────────────────────────────────
    is_large = len(chunks) > 1

    if is_large:
        # Dynamically scale chunk sample size to coverage requirements:
        # e.g., 5 MCQs -> 3-4 chunks, 10 MCQs -> 6-8 chunks, 50 MCQs -> 30-35 chunks.
        calculated_sample_size = int(num_questions * 0.6) + 1
        sample_size = min(calculated_sample_size, len(chunks))
        selected = random.sample(chunks, sample_size)
        # Re-sort by chunk_index to keep reading order
        selected.sort(key=lambda c: c.get("chunk_index", 0))
        print(
            f"[quiz] Large PDF — sampled {sample_size}/{len(chunks)} chunk(s) (target was {calculated_sample_size}) "
            f"(indices: {[c.get('chunk_index') for c in selected]})"
        )
    else:
        selected = chunks
        print("[quiz] Small PDF — using single chunk as full context")

    combined_text: str = "\n\n".join(c["content"] for c in selected)
    print(f"[quiz] Combined context length: {len(combined_text)} chars")

    # ── 3. Generate quiz via Groq ─────────────────────────────────────────────
    print(f"[quiz] Calling Groq/Quiz API to generate {num_questions} questions...")
    try:
        questions = generate_quiz(combined_text, num_questions=num_questions)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Quiz generation failed — {exc}",
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Quiz API unavailable — {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during quiz generation: {exc}",
        ) from exc

    print(f"[quiz] Quiz API returned {len(questions)} valid question(s)")

    # ── 4. Persist quiz to Supabase ───────────────────────────────────────────
    print("[quiz] Saving quiz to Supabase...")
    try:
        quiz_id = save_quiz(document_id=document_id, questions=questions)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save quiz to database: {exc}",
        ) from exc

    print(f"[quiz] Quiz saved — quiz_id='{quiz_id}'")

    # ── 5. Return full quiz payload ───────────────────────────────────────────
    return {
        "quiz_id":     quiz_id,
        "document_id": document_id,
        "questions":   questions,
    }


# ── GET /quiz/history/{document_id} ──────────────────────────────────────────

@router.get("/history/{document_id}")
async def quiz_history(document_id: str) -> dict[str, Any]:
    """
    Return all quizzes (with nested questions) generated for a document.

    Path parameter:
        document_id — UUID of the document

    Returns:
        {"quizzes": [...]}
    """
    document_id = document_id.strip()
    if not document_id:
        raise HTTPException(status_code=400, detail="document_id path parameter is required.")

    print(f"[quiz] Fetching quiz history for document_id='{document_id}'")

    try:
        quizzes = get_quiz_history(document_id)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quiz history: {exc}",
        ) from exc

    if not quizzes:
        raise HTTPException(
            status_code=404,
            detail=f"No quizzes found for document_id='{document_id}'.",
        )

    print(f"[quiz] Returning {len(quizzes)} quiz(zes)")
    return {"quizzes": quizzes}
