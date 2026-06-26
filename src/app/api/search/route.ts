import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAIProvider } from "@/lib/rag/aiProvider";
import { retrieveAndGenerate } from "@/lib/rag/retrieval";

export async function GET() {
  try {
    const provider = getAIProvider();
    return NextResponse.json({ provider: provider.name });
  } catch {
    const fallbackName = process.env.AI_PROVIDER === "ollama" ? "Ollama (Development)" : "Gemini";
    return NextResponse.json({ provider: fallbackName });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
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

    // Run the production-grade retrieval and generation pipeline
    const result = await retrieveAndGenerate(supabaseClient, question, documentId || undefined);

    // Maintain developer diagnostics logging
    console.log("=== [ADAPTIVE RETRIEVAL ENGINE DIAGNOSTICS] ===");
    console.log(`Retrieval Mode: ${result.intent}`);
    console.log(`Selected Document: ${documentId || "All Documents"}`);
    console.log(`Total Chunks: ${result.metrics.totalChunks}`);
    console.log(`Retrieved Chunks: ${result.metrics.retrievedChunksCount}`);
    console.log(`Removed Duplicates: ${result.metrics.removedDuplicatesCount}`);
    console.log(`Merged Chunks: ${result.metrics.mergedChunksCount}`);
    console.log(`Batch Count: 0`);
    console.log(`Final Context Tokens: ${result.metrics.finalContextTokens}`);
    console.log(`Gemini Input Tokens: ${result.metrics.geminiInputTokens}`);
    console.log(`Execution Time: ${result.metrics.executionTimeMs}ms`);
    console.log("================================================");

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      provider: result.provider,
    });

  } catch (err) {
    console.error("[RAG Search Endpoint] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An unhandled error occurred during vector search" },
      { status: 500 }
    );
  }
}
