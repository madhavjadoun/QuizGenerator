import { SupabaseClient } from "@supabase/supabase-js";
import { getAIProvider } from "./aiProvider";
import { normalizeQuery } from "./queryNormalizer";
import { classifyIntent, Intent } from "./intentClassifier";
import { expandQueryAndRewrites } from "./queryExpansion";
import { hybridSearch } from "./hybridSearch";
import { rerankCandidates } from "./reranker";
import { buildContext } from "./contextBuilder";
import { generateFinalAnswer } from "./responseGenerator";

export interface RetrievalResponse {
  success: boolean;
  answer: string;
  sources: {
    page_number: number;
    similarity: number;
    content: string;
  }[];
  provider: string;
  intent: Intent;
  metrics: {
    totalChunks: number;
    retrievedChunksCount: number;
    removedDuplicatesCount: number;
    mergedChunksCount: number;
    finalContextTokens: number;
    geminiInputTokens: number;
    executionTimeMs: number;
  };
}

/**
 * Orchestrates the complete production-grade RAG retrieval and answer generation pipeline.
 */
export async function retrieveAndGenerate(
  supabaseClient: SupabaseClient,
  question: string,
  documentId?: string
): Promise<RetrievalResponse> {
  const startTime = Date.now();

  const provider = getAIProvider();

  // 1. Get total chunks count for diagnostic log metrics
  let totalChunks = 0;
  try {
    const countQuery = supabaseClient
      .from("chunks")
      .select("*", { count: "exact", head: true });
    if (documentId) {
      countQuery.eq("document_id", documentId);
    }
    const { count } = await countQuery;
    totalChunks = count || 0;
  } catch (countErr) {
    console.warn("[RAG Search Pipeline] Failed to query total chunks count:", countErr);
  }

  // 2. Query Preprocessing (Normalization)
  const normalizedQuery = normalizeQuery(question);

  // 3. Query Understanding (Intent Classification)
  const intent = await classifyIntent(normalizedQuery, provider);

  // 4. Multi-Query Retrieval & Expansion
  const rewrites = await expandQueryAndRewrites(normalizedQuery, provider);

  // 5. Hybrid Search (Vector similarity + Wildcard Postgres matches + Metadata lookup bypass)
  const candidates = await hybridSearch(
    supabaseClient,
    normalizedQuery,
    rewrites,
    intent,
    documentId
  );

  const retrievedChunksCount = candidates.length;

  // 6. Reranking (Lexical phrase + score alignment)
  const keywords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);
  const reranked = rerankCandidates(candidates, normalizedQuery, keywords);

  // 7. Context Builder (Deduplication, dynamic Top-K, page sorting & text merging)
  const { finalChunks, contextText } = buildContext(reranked, intent);

  // 8. Strict Context Answer Generation
  const { text: answer, promptTokens: geminiInputTokens } = await generateFinalAnswer(
    question,
    contextText,
    intent,
    provider
  );

  const endTime = Date.now();
  const executionTimeMs = endTime - startTime;
  const finalContextTokens = Math.ceil(contextText.length / 4.2);

  // Calculate metrics
  const removedDuplicatesCount = Math.max(0, retrievedChunksCount - finalChunks.length);
  const mergedChunksCount = 0; // Page merges are done on text construction level

  const sources = finalChunks.map((c) => ({
    page_number: c.page_number,
    similarity: c.similarity,
    content: c.content,
  }));

  return {
    success: true,
    answer,
    sources,
    provider: provider.name,
    intent,
    metrics: {
      totalChunks,
      retrievedChunksCount,
      removedDuplicatesCount,
      mergedChunksCount,
      finalContextTokens,
      geminiInputTokens,
      executionTimeMs,
    },
  };
}
