"""
services/pdf_parser.py — PDF text extraction service.

Extracts text from PDFs using pdfplumber (with markdown table support).
Falls back to pytesseract OCR for scanned / image-only PDFs.
Returns: {"text": str, "is_large": bool, "pages": int}
"""

from __future__ import annotations

import io
from typing import Any

import pdfplumber


# ── Helpers ───────────────────────────────────────────────────────────────────

def _table_to_markdown(table: list[list[str | None]]) -> str:
    """Convert a pdfplumber table (list of rows) into a clean markdown table."""
    if not table or not table[0]:
        return ""

    # Sanitise every cell: strip whitespace, replace None/newlines with space
    cleaned: list[list[str]] = [
        [str(cell).replace("\n", " ").strip() if cell is not None else "" for cell in row]
        for row in table
    ]

    # Build header + separator + body
    header = "| " + " | ".join(cleaned[0]) + " |"
    separator = "| " + " | ".join(["---"] * len(cleaned[0])) + " |"
    body_rows = ["| " + " | ".join(row) + " |" for row in cleaned[1:]]

    return "\n".join([header, separator] + body_rows)


def _ocr_pdf(file_bytes: bytes) -> str:
    """
    Convert each PDF page to an image and run pytesseract OCR.
    Used as a fallback when pdfplumber finds little/no text (scanned PDF).
    """
    from pdf2image import convert_from_bytes
    import pytesseract

    print("[pdf_parser] OCR fallback: converting pages to images...")
    images = convert_from_bytes(file_bytes, dpi=200)
    print(f"[pdf_parser] OCR fallback: got {len(images)} image(s), running tesseract...")

    page_texts: list[str] = []
    for i, img in enumerate(images, start=1):
        try:
            text = pytesseract.image_to_string(img, lang="eng")
            print(f"[pdf_parser] OCR page {i}: extracted {len(text)} chars")
            page_texts.append(text)
        finally:
            img.close()  # Clean up image resource from memory

    return "\n\n".join(page_texts)


# ── Public API ────────────────────────────────────────────────────────────────

def parse_pdf(file_bytes: bytes) -> dict[str, Any]:
    """
    Extract text from a PDF given its raw bytes.

    Returns:
        {
            "text":     str   — full extracted text (all pages combined),
            "is_large": bool  — True if text length > 3000 chars,
            "pages":    int   — total number of pages in the PDF,
        }

    Raises:
        ValueError: For empty input, password-protected, corrupted, or empty PDFs.
    """
    # ── Guard: empty bytes ────────────────────────────────────────────────────
    if not file_bytes:
        raise ValueError("PDF file is empty — no bytes received.")

    print(f"[pdf_parser] Starting extraction on {len(file_bytes)} byte PDF...")

    # ── Open with pdfplumber ──────────────────────────────────────────────────
    try:
        pdf_stream = io.BytesIO(file_bytes)
        pdf = pdfplumber.open(pdf_stream)
    except Exception as exc:
        err = str(exc).lower()
        if "password" in err or "encrypted" in err:
            raise ValueError(
                "This PDF is password-protected. Please remove the password and re-upload."
            ) from exc
        raise ValueError(
            f"Could not open PDF — the file may be corrupted or in an unsupported format. Detail: {exc}"
        ) from exc

    total_pages = len(pdf.pages)
    print(f"[pdf_parser] PDF opened successfully — {total_pages} page(s) detected.")

    if total_pages == 0:
        pdf.close()
        raise ValueError("This PDF has no pages.")

    # ── Extract text page by page ─────────────────────────────────────────────
    page_texts: list[str] = []

    try:
        for page_num, page in enumerate(pdf.pages, start=1):
            segments: list[str] = []

            # 1. Extract plain text layer
            raw_text = page.extract_text() or ""
            if raw_text.strip():
                segments.append(raw_text.strip())
                print(f"[pdf_parser] Page {page_num}: extracted {len(raw_text)} text chars")

            # 2. Detect and convert tables to markdown
            tables = page.extract_tables() or []
            for table_idx, table in enumerate(tables, start=1):
                md_table = _table_to_markdown(table)
                if md_table:
                    segments.append(md_table)
                    print(
                        f"[pdf_parser] Page {page_num}: converted table {table_idx} "
                        f"({len(table)} rows) to markdown"
                    )

            page_texts.append("\n\n".join(segments))
    finally:
        pdf.close()

    combined_text = "\n\n".join(filter(None, page_texts)).strip()
    print(f"[pdf_parser] pdfplumber total chars extracted: {len(combined_text)}")

    # ── OCR fallback for scanned PDFs ─────────────────────────────────────────
    pre_ocr_text = combined_text
    ocr_failed = False
    if len(combined_text) < 50:
        print(
            "[pdf_parser] Less than 50 chars found — likely a scanned PDF. "
            "Triggering OCR fallback..."
        )
        try:
            combined_text = _ocr_pdf(file_bytes).strip()
            print(f"[pdf_parser] OCR complete — total chars: {len(combined_text)}")
        except Exception as exc:
            print("[pdf_parser] OCR failed — returning empty text. Install poppler and tesseract for scanned PDF support.")
            combined_text = pre_ocr_text
            ocr_failed = True

    # ── Final guard: truly empty document ─────────────────────────────────────
    if not combined_text and not ocr_failed:
        raise ValueError(
            "No text could be extracted from this PDF — "
            "it may contain only images with no readable content."
        )

    is_large = len(combined_text) > 3000
    print(
        f"[pdf_parser] Done — pages={total_pages}, "
        f"chars={len(combined_text)}, is_large={is_large}"
    )

    return {
        "text": combined_text,
        "is_large": is_large,
        "pages": total_pages,
    }
