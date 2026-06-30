"""
routers/documents.py — Document upload and listing endpoints.

POST /documents/upload — parse PDF, upload to Supabase Storage, save metadata + chunks
GET  /documents/list   — return all documents for a given user
"""

from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services.pdf_parser import parse_pdf
from services.supabase_client import (
    get_client,
    get_documents,
    save_chunks,
    save_document,
)

router = APIRouter()

# ── Constants ─────────────────────────────────────────────────────────────────
STORAGE_BUCKET = "documents"
CHUNK_SIZE     = 500   # characters per chunk
CHUNK_OVERLAP  = 50    # overlap between consecutive chunks


# ── Helpers ───────────────────────────────────────────────────────────────────

def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split `text` into overlapping windows of `size` characters.

    E.g. with size=500, overlap=50:
      chunk 0 → chars [0, 500)
      chunk 1 → chars [450, 950)
      ...
    """
    if not text:
        return []

    step = size - overlap
    chunks: list[str] = []
    start = 0

    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start += step

    return chunks


# ── POST /documents/upload ────────────────────────────────────────────────────

@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
) -> dict[str, Any]:
    """
    Upload a PDF, extract text, store in Supabase Storage, and save chunks.

    Form data:
        file    — multipart PDF upload
        user_id — authenticated user's UUID

    Returns:
        {
            "document_id":    str,
            "title":          str,
            "is_large":       bool,
            "chunks_created": int,
        }
    """
    # ── 1. Validate inputs ────────────────────────────────────────────────────
    user_id = user_id.strip()
    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="user_id form field must be a non-empty string."
        )

    print(f"[documents] Upload request — filename='{file.filename}', user_id='{user_id}'")

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted. Please upload a .pdf file.",
        )

    # Sanitize the filename to prevent directory traversal or folder structure breakout
    safe_filename = os.path.basename(file.filename)
    if not safe_filename or not safe_filename.lower().endswith(".pdf"):
        safe_filename = "uploaded_document.pdf"

    # ── 2. Read bytes ─────────────────────────────────────────────────────────
    file_bytes = await file.read()
    file_size  = len(file_bytes)
    print(f"[documents] Read {file_size} bytes from '{safe_filename}'")

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── 3. Parse PDF ──────────────────────────────────────────────────────────
    print("[documents] Parsing PDF...")
    try:
        parsed = parse_pdf(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"PDF parsing failed unexpectedly: {exc}",
        ) from exc

    extracted_text: str  = parsed["text"]
    is_large: bool       = parsed["is_large"]
    pages: int           = parsed["pages"]
    title: str           = safe_filename.removesuffix(".pdf").replace("_", " ").strip()

    print(
        f"[documents] Parsed — pages={pages}, chars={len(extracted_text)}, "
        f"is_large={is_large}, title='{title}'"
    )

    # ── 4. Upload original PDF to Supabase Storage ────────────────────────────
    storage_path = f"{user_id}/{safe_filename}"
    print(f"[documents] Uploading PDF to Storage — bucket='{STORAGE_BUCKET}', path='{storage_path}'")

    try:
        client = get_client()
        client.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )
        # Build a public URL for the stored file
        file_url: str = client.storage.from_(STORAGE_BUCKET).get_public_url(storage_path)
        print(f"[documents] PDF uploaded — public URL: {file_url}")
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload PDF to storage: {exc}",
        ) from exc

    # ── 5. Save document metadata ─────────────────────────────────────────────
    print("[documents] Saving document metadata to database...")
    try:
        doc_row = save_document(
            user_id=user_id,
            title=title,
            file_name=safe_filename,
            file_size=file_size,
            file_url=file_url,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save document metadata: {exc}",
        ) from exc

    document_id: str = doc_row["id"]

    # ── 6. Chunk and save text ────────────────────────────────────────────────
    chunk_dicts: list[dict[str, Any]] = []

    if is_large:
        print(f"[documents] Large PDF — chunking text into {CHUNK_SIZE}-char segments...")
        raw_chunks = _chunk_text(extracted_text)
        chunk_dicts = [
            {"content": chunk, "page_number": 1, "chunk_index": i}
            for i, chunk in enumerate(raw_chunks)
        ]
        print(f"[documents] Created {len(chunk_dicts)} chunk(s)")
    else:
        print("[documents] Small PDF — saving as single chunk")
        chunk_dicts = [{"content": extracted_text, "page_number": 1, "chunk_index": 0}]

    try:
        save_chunks(document_id=document_id, user_id=user_id, chunks=chunk_dicts)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save text chunks: {exc}",
        ) from exc

    print(
        f"[documents] Upload complete — document_id='{document_id}', "
        f"chunks_created={len(chunk_dicts)}"
    )

    return {
        "document_id":    document_id,
        "title":          title,
        "is_large":       is_large,
        "chunks_created": len(chunk_dicts),
    }


# ── GET /documents/list ───────────────────────────────────────────────────────

@router.get("/list")
async def list_documents(user_id: str) -> dict[str, Any]:
    """
    Return all documents belonging to a user.

    Query parameter:
        user_id — the authenticated user's UUID

    Returns:
        {"documents": [...]}
    """
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="user_id query parameter is required.")

    print(f"[documents] Listing documents for user_id='{user_id}'")

    try:
        docs = get_documents(user_id.strip())
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch documents: {exc}",
        ) from exc

    print(f"[documents] Returning {len(docs)} document(s)")
    return {"documents": docs}
