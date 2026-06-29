"""
services/supabase_client.py — Supabase database client and all data-access helpers.

Tables used:
  documents       — document metadata
  chunks          — text chunks extracted from a document
  quizzes         — quiz header row
  quiz_questions  — individual MCQ questions belonging to a quiz
"""

from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# ── Singleton client cache ────────────────────────────────────────────────────
_client: Client | None = None


# ── Public API ────────────────────────────────────────────────────────────────

def get_client() -> Client:
    """
    Return a cached Supabase service-role client, creating it on first call.

    Raises:
        EnvironmentError: If SUPABASE_URL or SUPABASE_SERVICE_KEY are not set.
    """
    global _client
    if _client is not None:
        return _client

    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()

    if not url or url.lower() == "your_supabase_url":
        raise EnvironmentError("SUPABASE_URL is not configured in .env")
    if not key or key.lower() == "your_service_key":
        raise EnvironmentError("SUPABASE_SERVICE_KEY is not configured in .env")

    print("[supabase] Creating Supabase client...")
    _client = create_client(url, key)
    print("[supabase] Client ready.")
    return _client


# ── Documents ─────────────────────────────────────────────────────────────────

def save_document(
    user_id: str,
    title: str,
    file_name: str,
    file_size: int,
    file_url: str,
) -> dict[str, Any]:
    """
    Insert a new document record into the `documents` table.

    Returns:
        The created row dict (including the generated `id` and `created_at`).
    """
    client = get_client()
    payload = {
        "user_id":   user_id,
        "title":     title,
        "file_name": file_name,
        "file_size": file_size,
        "file_url":  file_url,
    }
    print(f"[supabase] Inserting document: title='{title}', user_id='{user_id}'")
    result = client.table("documents").insert(payload).execute()

    if not result.data:
        raise RuntimeError(f"Failed to insert document — Supabase returned empty data. Response: {result}")

    row = result.data[0]
    print(f"[supabase] Document saved with id={row.get('id')}")
    return row


def get_documents(user_id: str) -> list[dict[str, Any]]:
    """
    Fetch all documents for a user, ordered by creation date (newest first).

    Returns:
        List of document row dicts.
    """
    client = get_client()
    print(f"[supabase] Fetching documents for user_id='{user_id}'")
    result = (
        client.table("documents")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    docs = result.data or []
    print(f"[supabase] Found {len(docs)} document(s) for user '{user_id}'")
    return docs


# ── Chunks ────────────────────────────────────────────────────────────────────

def save_chunks(
    document_id: str,
    user_id: str,
    chunks: list[dict[str, Any]],
) -> None:
    """
    Bulk-insert text chunks into the `chunks` table.

    Each dict in `chunks` must contain:
        content      (str)  — the chunk text
        page_number  (int)  — source page (1-indexed)
        chunk_index  (int)  — position within the document
    """
    if not chunks:
        print("[supabase] save_chunks called with empty list — nothing to insert.")
        return

    client = get_client()
    rows = [
        {
            "document_id": document_id,
            "user_id":     user_id,
            "content":     chunk["content"],
            "page_number": chunk.get("page_number", 1),
            "chunk_index": chunk["chunk_index"],
        }
        for chunk in chunks
    ]

    print(f"[supabase] Inserting {len(rows)} chunk(s) for document_id='{document_id}'")
    result = client.table("chunks").insert(rows).execute()

    if result.data is None:
        raise RuntimeError(f"Failed to insert chunks — Supabase returned no data. Response: {result}")

    print(f"[supabase] {len(result.data)} chunk(s) saved.")


def get_chunks(document_id: str) -> list[dict[str, Any]]:
    """
    Fetch all chunks for a document, ordered by chunk_index ascending.

    Returns:
        Ordered list of chunk row dicts.
    """
    client = get_client()
    print(f"[supabase] Fetching chunks for document_id='{document_id}'")
    result = (
        client.table("chunks")
        .select("*")
        .eq("document_id", document_id)
        .order("chunk_index", desc=False)
        .execute()
    )
    chunks = result.data or []
    print(f"[supabase] Found {len(chunks)} chunk(s) for document '{document_id}'")
    return chunks


# ── Quizzes ───────────────────────────────────────────────────────────────────

def save_quiz(document_id: str, questions: list[dict[str, Any]]) -> str:
    """
    Persist a generated quiz to `quizzes` + all questions to `quiz_questions`.

    Each dict in `questions` must contain:
        question      (str)
        options       (list[str], length 4)
        correct       (str, exact text of correct option)
        explanation   (str)

    Returns:
        The UUID of the newly created quiz row.
    """
    client = get_client()

    # 1. Insert quiz header
    quiz_payload = {
        "document_id":    document_id,
        "total_questions": len(questions),
        "status":         "generated",
    }
    print(f"[supabase] Creating quiz for document_id='{document_id}' ({len(questions)} questions)")
    quiz_result = client.table("quizzes").insert(quiz_payload).execute()

    if not quiz_result.data:
        raise RuntimeError(f"Failed to create quiz row. Response: {quiz_result}")

    quiz_id: str = quiz_result.data[0]["id"]
    print(f"[supabase] Quiz created with id='{quiz_id}'")

    # 2. Insert all questions
    question_rows = []
    for idx, q in enumerate(questions):
        opts: list[str] = q["options"]
        # Determine which lettered option (A/B/C/D) matches the correct answer
        correct_letter = "A"  # safe fallback if option list is mutated/weird
        for letter, opt in zip(["A", "B", "C", "D"], opts):
            if opt.strip().lower() == q["correct"].strip().lower():
                correct_letter = letter
                break

        question_rows.append({
            "quiz_id":       quiz_id,
            "question":      q["question"],
            "option_a":      opts[0] if len(opts) > 0 else "",
            "option_b":      opts[1] if len(opts) > 1 else "",
            "option_c":      opts[2] if len(opts) > 2 else "",
            "option_d":      opts[3] if len(opts) > 3 else "",
            "correct_option": correct_letter,
            "explanation":   q.get("explanation", ""),
            "order_index":   idx,
        })

    print(f"[supabase] Inserting {len(question_rows)} question row(s)...")
    q_result = client.table("quiz_questions").insert(question_rows).execute()

    if q_result.data is None:
        raise RuntimeError(f"Failed to insert quiz questions. Response: {q_result}")

    print(f"[supabase] {len(q_result.data)} question(s) saved for quiz '{quiz_id}'")
    return quiz_id


def get_quiz_history(document_id: str) -> list[dict[str, Any]]:
    """
    Fetch all quizzes for a document, each including its questions.

    Returns:
        List of quiz dicts, each with a nested `questions` list.
    """
    client = get_client()
    print(f"[supabase] Fetching quiz history for document_id='{document_id}'")

    result = (
        client.table("quizzes")
        .select("*, quiz_questions(*)")
        .eq("document_id", document_id)
        .order("created_at", desc=True)
        .execute()
    )
    quizzes = result.data or []
    print(f"[supabase] Found {len(quizzes)} quiz(zes) for document '{document_id}'")
    return quizzes
