export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parsePDF } from "@/lib/rag/parser";
import { chunkDocument } from "@/lib/rag/chunk";
import { generateEmbedding } from "@/lib/rag/embedding";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { storagePath, fileName } = body;

    if (!storagePath) {
      return NextResponse.json(
        { error: "Missing storagePath in request body" },
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

    console.log(`[RAG Pipeline] Downloading file: documents/${storagePath}`);

    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from("documents")
      .download(storagePath);

    if (downloadError) {
      console.error("[RAG Pipeline] Supabase storage download error:", downloadError);
      return NextResponse.json(
        { error: `Failed to download file from storage: ${downloadError.message}` },
        { status: 500 }
      );
    }

    if (!fileData) {
      return NextResponse.json(
        { error: "Downloaded file data is empty" },
        { status: 500 }
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();

    console.log(`[RAG Pipeline] Parsing PDF: ${fileName || storagePath}`);
    const parseResult = await parsePDF(arrayBuffer);

    // Look up the document ID in the database using the authenticated client
    const searchName = fileName || storagePath.split("/").pop() || storagePath;
    const { data: docData, error: docError } = await supabaseClient
      .from("documents")
      .select("id, user_id")
      .eq("file_name", searchName)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (docError || !docData) {
      console.error("[RAG Pipeline] Document lookup error:", docError);
      return NextResponse.json(
        { error: `Document record not found: ${docError?.message || "Unknown error"}` },
        { status: 404 }
      );
    }

    // Split parsed text into semantic chunks
    console.log(`[RAG Pipeline] Chunking document: ${docData.id}`);
    const chunks = chunkDocument(parseResult.pageTexts);

    // Persist new chunks with embedding = null (supporting incremental embedding generation)
    const chunksToInsert = chunks.map(chunk => ({
      document_id: docData.id,
      user_id: docData.user_id,
      page_number: chunk.pageNumber,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: null,
      created_at: new Date().toISOString()
    }));

    console.log(`[RAG Pipeline] Storing ${chunksToInsert.length} chunks...`);
    const { error: insertError } = await supabaseClient
      .from("chunks")
      .insert(chunksToInsert);

    if (insertError) {
      console.error("[RAG Pipeline] Error persisting chunks:", insertError);
      return NextResponse.json(
        { error: `Failed to persist chunks: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Process only chunks that do not yet have embeddings (for this document)
    console.log(`[RAG Pipeline] Querying pending chunks needing embeddings...`);
    const { data: pendingChunks, error: fetchError } = await supabaseClient
      .from("chunks")
      .select("id, content")
      .eq("document_id", docData.id)
      .is("embedding", null);

    if (fetchError) {
      console.error("[RAG Pipeline] Error fetching pending chunks:", fetchError);
      return NextResponse.json(
        { error: `Failed to fetch pending chunks: ${fetchError.message}` },
        { status: 500 }
      );
    }

    console.log(`[RAG Pipeline] Generating embeddings for ${pendingChunks?.length || 0} chunks...`);
    let successCount = 0;
    for (const chunk of pendingChunks || []) {
      try {
        const embedding = await generateEmbedding(chunk.content);

        console.log("Embedding type:", typeof embedding);
        console.log("Is array:", Array.isArray(embedding));
        console.log("Length:", embedding.length);
        console.log("First values:", embedding.slice(0,5));

        const { data, error: updateError } = await supabaseClient
          .from("chunks")
          .update({ embedding })
          .eq("id", chunk.id)
          .select();

        console.log("Updated row:", data);
        console.log("Update error:", updateError);

        if (updateError) {
          console.error(`[RAG Pipeline] Error updating chunk ${chunk.id} with embedding:`, updateError);
        } else {
          successCount++;
        }
      } catch (embErr) {
        console.error(`[RAG Pipeline] Failed to generate embedding for chunk ${chunk.id}:`, embErr);
      }
    }

    const endTime = Date.now();
    const totalTimeMs = endTime - startTime;

    // Log metrics
    console.log("=== [RAG PIPELINE COMPLETE METRICS] ===");
    console.log(`- File Name: ${fileName || "Unknown"}`);
    console.log(`- Total Pages: ${parseResult.pages}`);
    console.log(`- Total Chunks: ${chunks.length}`);
    console.log(`- Embeddings Generated: ${successCount}/${pendingChunks?.length || 0}`);
    console.log(`- Total Pipeline Execution Time: ${totalTimeMs}ms`);
    console.log("======================================================");

    return NextResponse.json({
      success: true,
      pages: parseResult.pages,
      chunks: chunks.length,
      embeddingsGenerated: successCount,
      totalTimeMs,
    });

  } catch (err) {
    console.error("[RAG Pipeline] Unhandled extraction error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An unhandled error occurred during document parsing" },
      { status: 500 }
    );
  }
}
