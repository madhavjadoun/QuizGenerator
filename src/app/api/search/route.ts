import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { vectorSearch } from "@/lib/rag/search";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, documentId } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Missing question in request body" },
        { status: 400 }
      );
    }

    // Forward the authorization token from the request headers
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      auth: {
        persistSession: false,
      }
    });

    console.log(`[RAG Ingestion] Performing similarity search for query: "${question}"`);
    const results = await vectorSearch(supabaseClient, question, {
      documentId,
      threshold: 0.1, // lenient threshold to show match rankings
      limit: 5,       // retrieve top 5 matching chunks
    });

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (err) {
    console.error("[RAG Search Endpoint] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An unhandled error occurred during vector search" },
      { status: 500 }
    );
  }
}
