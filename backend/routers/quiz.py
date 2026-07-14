"""
routers/quiz.py — Quiz generation and history endpoints.

POST /quiz/generate              — generate a quiz (MCQ/T-F/FIB) from a document's chunks
GET  /quiz/history/{document_id} — return all quizzes for a document
"""

from __future__ import annotations

import random
import time
import asyncio
from typing import Any

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

from services.auth import get_current_user_id
from services.gemini_client import generate_quiz
from services.supabase_client import (
    check_document_ownership,
    check_quiz_ownership,
    consume_credits,
    delete_all_user_quizzes,
    delete_quiz,
    get_chunks,
    get_client,
    get_document,
    get_or_create_daily_credits,
    get_quiz_history,
    save_chunks,
    save_document,
    save_quiz,
    update_quiz,
)
from services.rate_limiter import quiz_limiter, api_limiter

router = APIRouter()

# Concurrency semaphore to restrict parallel quiz generations (saves Gemini quota)
quiz_semaphore = asyncio.Semaphore(5)


# ── Request models ────────────────────────────────────────────────────────────

class GenerateQuizRequest(BaseModel):
    """Request body for POST /quiz/generate."""
    model_config = {
        "extra": "forbid"
    }

    document_id: str
    """UUID of the document to generate a quiz from."""

    num_questions: int = 10
    """How many questions to generate (limit 50, defaults to 10)."""

    quiz_type: str = "mcq"
    """Type of quiz: 'mcq' (default), 'tf' (True/False), or 'fib' (Fill in the Blanks)."""

    difficulty: str = "Medium"
    """Difficulty level: 'Easy', 'Medium' (default), or 'Hard'."""

class GenerateQuizFromTextRequest(BaseModel):
    """Request body for POST /quiz/text."""
    model_config = {
        "extra": "forbid"
    }

    text: str
    """The pasted notes, article, documentation, or other text to generate a quiz from."""

    num_questions: int = 10
    """How many questions to generate (limit 50, defaults to 10)."""

    quiz_type: str = "mcq"
    """Type of quiz: 'mcq' (default), 'tf' (True/False), or 'fib' (Fill in the Blanks)."""

    difficulty: str = "Medium"
    """Difficulty level: 'Easy', 'Medium' (default), or 'Hard'."""

class SubmitQuizRequest(BaseModel):
    """Request body for POST /quiz/submit."""
    model_config = {
        "extra": "forbid"
    }

    quiz_id: str
    status: str
    total_questions: int




# ── POST /quiz/generate ───────────────────────────────────────────────────────

@router.post("/generate", status_code=201)
async def generate_quiz_endpoint(
    request: Request,
    body: GenerateQuizRequest,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
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
    # ── Rate limiting ──────────────────────────────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)
    quiz_limiter.check_rate_limit(f"quiz_ip:{ip}", ip)
    quiz_limiter.check_rate_limit(f"quiz_user:{user_id}", ip)

    async with quiz_semaphore:
        document_id = body.document_id.strip()
        num_questions = body.num_questions
        quiz_type = body.quiz_type.strip().lower() if body.quiz_type else "mcq"
        difficulty = body.difficulty.strip() if body.difficulty else "Medium"

        if not document_id:
            raise HTTPException(
                status_code=400,
                detail="document_id must be a non-empty string."
            )

        if num_questions < 1 or num_questions > 50:
            raise HTTPException(
                status_code=400,
                detail="Number of questions (num_questions) must be between 1 and 50."
            )

        if quiz_type not in ("mcq", "tf", "fib"):
            raise HTTPException(
                status_code=400,
                detail="quiz_type must be one of: 'mcq', 'tf', 'fib'."
            )

        if difficulty not in ("Easy", "Medium", "Hard"):
            raise HTTPException(
                status_code=400,
                detail="difficulty must be one of: 'Easy', 'Medium', 'Hard'."
            )

        # Verify ownership of the document
        if not check_document_ownership(document_id, user_id):
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You do not own this document."
            )

        # ── Credit check — BEFORE the Gemini call ─────────────────────────────────
        try:
            credit_row = get_or_create_daily_credits(user_id)
            credits_used  = credit_row["credits_used"]
            credits_limit = credit_row["credits_limit"]
            remaining     = credits_limit - credits_used
            if num_questions > remaining:
                raise HTTPException(
                    status_code=402,
                    detail=(
                        f"Insufficient credits: generating {num_questions} questions requires {num_questions} credits, "
                        f"but you only have {remaining} remaining today (limit: {credits_limit}/day). "
                        f"Your credits reset at midnight UTC."
                    ),
                )
        except HTTPException:
            raise  # re-raise our own 402
        except Exception as exc:
            print(f"[quiz] Failed to check daily credits for user_id='{user_id}': {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to check daily credits.",
            ) from exc

        print(f"[quiz] Generate request — document_id='{document_id}', user_id='{user_id}', num_questions={num_questions}, quiz_type={quiz_type}, difficulty={difficulty}")

        # ── 1. Fetch chunks ───────────────────────────────────────────────────────
        try:
            chunks = get_chunks(document_id)
        except Exception as exc:
            print(f"[quiz] Failed to fetch chunks for document_id='{document_id}': {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch document chunks.",
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

        # Check if the document is an image
        doc_metadata = get_document(document_id)
        is_image = False
        if doc_metadata:
            file_name = doc_metadata.get("file_name", "").lower()
            is_image = any(file_name.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".webp"))

        is_large = len(chunks) > 1

        if is_image:
            # For images, send all chunks (all text) without sampling
            selected = chunks
            print(f"[quiz] Image detected ({doc_metadata.get('file_name') if doc_metadata else ''}) — using all {len(chunks)} chunk(s) as context")
        elif is_large:
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

        # ── 3. Generate quiz via Gemini ───────────────────────────────────────────
        print(f"[quiz] Calling Gemini/Quiz API to generate {num_questions} {quiz_type.upper()} questions ({difficulty})...")
        try:
            questions = generate_quiz(combined_text, num_questions=num_questions, quiz_type=quiz_type, difficulty=difficulty)
        except ValueError as exc:
            print(f"[quiz] Quiz generation validation failure: {exc}")
            raise HTTPException(
                status_code=422,
                detail="Quiz generation failed. Please try again with a clearer document.",
            ) from exc
        except RuntimeError as exc:
            print(f"[quiz] Quiz API unavailable: {exc}")
            raise HTTPException(
                status_code=503,
                detail="Quiz API unavailable. Please try again shortly.",
            ) from exc
        except Exception as exc:
            print(f"[quiz] Unexpected quiz generation error: {exc}")
            raise HTTPException(
                status_code=500,
                detail="Unexpected error during quiz generation.",
            ) from exc

        print(f"[quiz] Quiz API returned {len(questions)} valid question(s)")

        # ── 4. Persist quiz to Supabase ───────────────────────────────────────────
        print("[quiz] Saving quiz to Supabase...")
        try:
            quiz_id = save_quiz(document_id=document_id, questions=questions, quiz_type=quiz_type)
        except Exception as exc:
            print(f"[quiz] Failed to save quiz for document_id='{document_id}': {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save quiz to database.",
            ) from exc

        print(f"[quiz] Quiz saved — quiz_id='{quiz_id}'")

        # ── 5. Consume credits — AFTER successful generation ──────────────────────
        try:
            updated_credits = consume_credits(user_id=user_id, amount=num_questions)
            credits_remaining_after = updated_credits["credits_limit"] - updated_credits["credits_used"]
            print(f"[quiz] Credits consumed — {num_questions} used, {credits_remaining_after} remaining today")
        except ValueError as exc:
            # Extremely unlikely (race condition), but handle gracefully.
            # Quiz is already saved — don't block the response, just log.
            print(f"[quiz] WARNING: Credit consumption failed after generation: {exc}")
            credits_remaining_after = None
        except Exception as exc:
            print(f"[quiz] WARNING: Unexpected error consuming credits: {exc}")
            credits_remaining_after = None


    # ── 6. Return full quiz payload ───────────────────────────────────────────
    return {
        "quiz_id":          quiz_id,
        "document_id":      document_id,
        "questions":        questions,
        "credits_remaining": credits_remaining_after,
    }


# ── POST /quiz/text ───────────────────────────────────────────────────────────

@router.post("/text", status_code=201)
async def generate_quiz_from_text_endpoint(
    request: Request,
    body: GenerateQuizFromTextRequest,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
    """
    Generate a quiz from pasted text directly.
    
    Steps:
      1. Normalize and validate text length (300 to 6000 chars).
      2. Check rate limits and credits.
      3. Upload text to Supabase Storage as a .txt file.
      4. Save document metadata in the documents table.
      5. Split text into chunks and save chunks.
      6. Call Gemini to generate questions.
      7. Save quiz and questions, consume credits, and return.
    """
    import re
    import uuid
    from routers.documents import _chunk_text, STORAGE_BUCKET

    # ── Rate limiting ──────────────────────────────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)
    quiz_limiter.check_rate_limit(f"quiz_ip:{ip}", ip)
    quiz_limiter.check_rate_limit(f"quiz_user:{user_id}", ip)

    async with quiz_semaphore:
        raw_text = body.text
        num_questions = body.num_questions
        quiz_type = body.quiz_type.strip().lower() if body.quiz_type else "mcq"
        difficulty = body.difficulty.strip() if body.difficulty else "Medium"

        if not raw_text:
            raise HTTPException(
                status_code=400,
                detail="Text content must be a non-empty string."
            )

        # Normalize text
        normalized_text = raw_text.strip()
        normalized_text = normalized_text.replace('\r\n', '\n').replace('\r', '\n')
        normalized_text = re.sub(r'\n{3,}', '\n\n', normalized_text)

        char_count = len(normalized_text.replace('\n', '').replace('\r', ''))
        if char_count < 300:
            raise HTTPException(
                status_code=400,
                detail="Please enter at least 300 characters."
            )
        if char_count > 6000:
            raise HTTPException(
                status_code=400,
                detail="Maximum limit is 6000 characters."
            )

        if num_questions < 1 or num_questions > 50:
            raise HTTPException(
                status_code=400,
                detail="Number of questions (num_questions) must be between 1 and 50."
            )

        if quiz_type not in ("mcq", "tf", "fib"):
            raise HTTPException(
                status_code=400,
                detail="quiz_type must be one of: 'mcq', 'tf', 'fib'."
            )

        if difficulty not in ("Easy", "Medium", "Hard"):
            raise HTTPException(
                status_code=400,
                detail="difficulty must be one of: 'Easy', 'Medium', 'Hard'."
            )

        # ── Credit check ──────────────────────────────────────────────────────────
        try:
            credit_row = get_or_create_daily_credits(user_id)
            credits_used  = credit_row["credits_used"]
            credits_limit = credit_row["credits_limit"]
            remaining     = credits_limit - credits_used
            if num_questions > remaining:
                raise HTTPException(
                    status_code=402,
                    detail=(
                        f"Insufficient credits: generating {num_questions} questions requires {num_questions} credits, "
                        f"but you only have {remaining} remaining today (limit: {credits_limit}/day). "
                        f"Your credits reset at midnight UTC."
                    ),
                )
        except HTTPException:
            raise  # re-raise our own 402
        except Exception as exc:
            print(f"[quiz] Failed to check daily credits for user_id='{user_id}': {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to check daily credits.",
            ) from exc

        print(f"[quiz] Generate request from pasted text — user_id='{user_id}', num_questions={num_questions}, quiz_type={quiz_type}, difficulty={difficulty}")

        # ── 1. Create storage filename and document title ────────────────────────
        file_uuid = str(uuid.uuid4())
        file_name = f"pasted_text_{file_uuid}.txt"
        storage_path = f"{user_id}/{file_name}"
        storage_content_type = "text/plain; charset=utf-8"

        # Generate a clean title from first 35 chars
        snippet = normalized_text[:35].replace('\n', ' ').strip()
        title = f"Pasted Text: {snippet}..." if len(normalized_text) > 35 else f"Pasted Text: {snippet}"

        # ── 2. Upload text to Supabase Storage ────────────────────────────────────
        file_bytes = normalized_text.encode('utf-8')
        file_size = len(file_bytes)
        print(f"[quiz] Uploading text to Storage — bucket='{STORAGE_BUCKET}', path='{storage_path}'")

        try:
            client = get_client()
            client.storage.from_(STORAGE_BUCKET).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": storage_content_type, "upsert": "true"},
            )
            file_url = storage_path
            print(f"[quiz] Text uploaded — storage path: {file_url}")
        except Exception as exc:
            print(f"[quiz] Storage upload failed: {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to upload text to storage.",
            ) from exc

        # ── 3. Save document metadata ─────────────────────────────────────────────
        print("[quiz] Saving document metadata to database...")
        try:
            doc_row = save_document(
                user_id=user_id,
                title=title,
                file_name=file_name,
                file_size=file_size,
                file_url=file_url,
            )
        except Exception as exc:
            print(f"[quiz] Failed to save document metadata: {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save document metadata.",
            ) from exc

        document_id = doc_row["id"]

        # ── 4. Chunk and save text chunks ─────────────────────────────────────────
        is_large = len(normalized_text) > 3000
        if is_large:
            print(f"[quiz] Large text — chunking text into 500-char segments...")
            raw_chunks = _chunk_text(normalized_text)
            chunk_dicts = [
                {"content": chunk, "page_number": 1, "chunk_index": i}
                for i, chunk in enumerate(raw_chunks)
            ]
            print(f"[quiz] Created {len(chunk_dicts)} chunk(s)")
        else:
            print("[quiz] Small text — saving as single chunk")
            chunk_dicts = [{"content": normalized_text, "page_number": 1, "chunk_index": 0}]

        try:
            save_chunks(document_id=document_id, user_id=user_id, chunks=chunk_dicts)
        except Exception as exc:
            print(f"[quiz] Failed to save text chunks: {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save text chunks.",
            ) from exc

        # ── 5. Select context for Gemini call ─────────────────────────────────────
        # For large text, randomly sample chunks matching target questions (same as PDF)
        if is_large:
            calculated_sample_size = int(num_questions * 0.6) + 1
            sample_size = min(calculated_sample_size, len(chunk_dicts))
            selected = random.sample(chunk_dicts, sample_size)
            selected.sort(key=lambda c: c.get("chunk_index", 0))
            print(f"[quiz] sampled {sample_size}/{len(chunk_dicts)} chunk(s)")
        else:
            selected = chunk_dicts

        combined_text = "\n\n".join(c["content"] for c in selected)

        # ── 6. Generate quiz via Gemini ───────────────────────────────────────────
        print(f"[quiz] Calling Gemini/Quiz API to generate {num_questions} {quiz_type.upper()} questions ({difficulty})...")
        try:
            questions = generate_quiz(combined_text, num_questions=num_questions, quiz_type=quiz_type, difficulty=difficulty)
        except ValueError as exc:
            print(f"[quiz] Quiz generation validation failure: {exc}")
            raise HTTPException(
                status_code=422,
                detail="Quiz generation failed. Please try again with clearer content.",
            ) from exc
        except RuntimeError as exc:
            print(f"[quiz] Quiz API unavailable: {exc}")
            raise HTTPException(
                status_code=503,
                detail="Quiz API unavailable. Please try again shortly.",
            ) from exc
        except Exception as exc:
            print(f"[quiz] Unexpected quiz generation error: {exc}")
            raise HTTPException(
                status_code=500,
                detail="Unexpected error during quiz generation.",
            ) from exc

        # ── 7. Save quiz and consume credits ──────────────────────────────────────
        try:
            quiz_id = save_quiz(document_id=document_id, questions=questions, quiz_type=quiz_type)
        except Exception as exc:
            print(f"[quiz] Failed to save quiz: {exc}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save quiz to database.",
            ) from exc

        try:
            updated_credits = consume_credits(user_id=user_id, amount=num_questions)
            credits_remaining_after = updated_credits["credits_limit"] - updated_credits["credits_used"]
        except Exception as exc:
            print(f"[quiz] WARNING: Credit consumption failed: {exc}")
            credits_remaining_after = None

    return {
        "quiz_id":          quiz_id,
        "document_id":      document_id,
        "questions":        questions,
        "credits_remaining": credits_remaining_after,
    }


# ── GET /quiz/history/{document_id} ──────────────────────────────────────────

@router.get("/history/{document_id}")
async def quiz_history(
    request: Request,
    document_id: str,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
    """
    Return all quizzes (with nested questions) generated for a document.

    Path parameter:
        document_id — UUID of the document

    Returns:
        {"quizzes": [...]}
    """
    # ── Rate limiting ──────────────────────────────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)

    document_id = document_id.strip()
    if not document_id:
        raise HTTPException(status_code=400, detail="document_id path parameter is required.")

    if not check_document_ownership(document_id, user_id):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not own this document."
        )

    print(f"[quiz] Fetching quiz history for document_id='{document_id}', user_id='{user_id}'")

    try:
        quizzes = get_quiz_history(document_id)
    except Exception as exc:
        print(f"[quiz] Failed to fetch quiz history for document_id='{document_id}': {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch quiz history.",
        ) from exc

    if not quizzes:
        raise HTTPException(
            status_code=404,
            detail=f"No quizzes found for document_id='{document_id}'.",
        )

    print(f"[quiz] Returning {len(quizzes)} quiz(zes)")
    return {"quizzes": quizzes}


# ── GET /quiz/user-history ───────────────────────────────────────────────────

@router.get("/user-history")
async def get_user_quiz_history(
    request: Request,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
    """
    Fetch all quizzes associated with the user's documents.
    """
    # ── Rate limiting ──────────────────────────────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)

    start_time = time.time()
    print(f"[history] Request received: GET /quiz/user-history")
    print(f"[history] Authenticated user ID: {user_id}")
    
    client = get_client()

    try:
        # 1. Fetch user's documents
        docs_res = client.table("documents").select("id").eq("user_id", user_id).execute()
        doc_ids = [d["id"] for d in (docs_res.data or [])]
        if not doc_ids:
            duration = (time.time() - start_time) * 1000
            print(f"[history] Quizzes returned: 0. Execution time: {duration:.2f}ms")
            return {"quizzes": []}

        # 2. Fetch quizzes for those document IDs
        quizzes_res = (
            client.table("quizzes")
            .select("*, quiz_questions(*)")
            .in_("document_id", doc_ids)
            .order("created_at", desc=True)
            .execute()
        )
        quizzes_data = quizzes_res.data or []
        duration = (time.time() - start_time) * 1000
        print(f"[history] Quizzes returned: {len(quizzes_data)}. Execution time: {duration:.2f}ms")
        return {"quizzes": quizzes_data}
    except Exception as exc:
        duration = (time.time() - start_time) * 1000
        print(f"[history] Failed after {duration:.2f}ms: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch user quiz history."
        ) from exc


# ── POST /quiz/submit ────────────────────────────────────────────────────────

@router.post("/submit")
async def submit_quiz_endpoint(
    request: Request,
    body: SubmitQuizRequest,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
    """
    Submit/save a completed quiz attempt. Updates status and total_questions.
    """
    # ── Rate limiting ──────────────────────────────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)

    quiz_id = body.quiz_id.strip()
    status = body.status.strip()
    total_questions = body.total_questions

    if not quiz_id or not status:
        raise HTTPException(
            status_code=400,
            detail="quiz_id and status must be non-empty strings."
        )

    # Verify ownership of the quiz (and document)
    if not check_quiz_ownership(quiz_id, user_id):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not own this quiz."
        )

    print(f"[quiz] Submit request — quiz_id='{quiz_id}', user_id='{user_id}', total_questions={total_questions}")

    try:
        updated_quiz = update_quiz(
            quiz_id=quiz_id,
            status=status,
            total_questions=total_questions
        )
        return {"success": True, "quiz": updated_quiz}
    except Exception as exc:
        print(f"[quiz] Failed to update quiz_id='{quiz_id}': {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update quiz in database."
        ) from exc


# ── GET /quiz/{quiz_id} ──────────────────────────────────────────────────────

@router.get("/{quiz_id}")
async def get_quiz_by_id(
    request: Request,
    quiz_id: str,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
    """
    Fetch a single quiz by its UUID, including nested questions, if the user owns it.
    """
    # ── Rate limiting ───────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)

    quiz_id = quiz_id.strip()
    if not quiz_id:
        raise HTTPException(status_code=400, detail="quiz_id path parameter is required.")

    print(f"[quiz] Fetching quiz details for quiz_id='{quiz_id}', user_id='{user_id}'")

    # Verify ownership of the quiz (and document)
    if not check_quiz_ownership(quiz_id, user_id):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not own this quiz."
        )

    try:
        client = get_client()
        result = (
            client.table("quizzes")
            .select("*, quiz_questions(*)")
            .eq("id", quiz_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Quiz not found.")
        return result.data
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[quiz] Failed to fetch quiz_id='{quiz_id}': {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch quiz details."
        ) from exc


# ── DELETE /quiz/clear-all ───────────────────────────────────────────────────

@router.delete("/clear-all")
async def clear_all_quizzes_endpoint(
    request: Request,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
    """
    Delete all quiz history belonging to the authenticated user.
    """
    # ── Rate limiting ──────────────────────────────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)

    print(f"[quiz] Clear all request — user_id='{user_id}'")
    try:
        delete_all_user_quizzes(user_id=user_id)
        return {"success": True, "message": "All quiz history cleared successfully."}
    except Exception as exc:
        print(f"[quiz] Failed to clear quiz history for user_id='{user_id}': {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to clear all quiz history."
        ) from exc


# ── DELETE /quiz/{quiz_id} ────────────────────────────────────────────────────

@router.delete("/{quiz_id}")
async def delete_quiz_endpoint(
    request: Request,
    quiz_id: str,
    user_id: str = Depends(get_current_user_id)
) -> dict[str, Any]:
    """
    Delete a single quiz attempt by its ID.
    """
    # ── Rate limiting ──────────────────────────────────────────────────────────
    ip = request.client.host if request.client else "unknown"
    api_limiter.check_rate_limit(f"api_ip:{ip}", ip)
    api_limiter.check_rate_limit(f"api_user:{user_id}", ip)

    quiz_id = quiz_id.strip()
    if not quiz_id:
        raise HTTPException(status_code=400, detail="quiz_id path parameter is required.")

    print(f"[quiz] Delete request — quiz_id='{quiz_id}', user_id='{user_id}'")

    # Verify ownership of the quiz (and document)
    if not check_quiz_ownership(quiz_id, user_id):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not own this quiz."
        )

    try:
        delete_quiz(quiz_id=quiz_id)
        return {"success": True, "message": f"Quiz {quiz_id} deleted successfully."}
    except Exception as exc:
        print(f"[quiz] Failed to delete quiz_id='{quiz_id}': {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete quiz."
        ) from exc

