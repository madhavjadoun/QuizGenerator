import { SupabaseClient } from "@supabase/supabase-js";
import { vectorSearch } from "./search";
import { Intent } from "./intentClassifier";

export interface HybridCandidate {
  id: string;
  document_id: string;
  page_number: number;
  chunk_index: number;
  content: string;
  similarity: number;
  keywordScore: number;
  combinedScore: number;
}

/**
 * Performs a hybrid search combining Vector pgvector matches and direct Postgres Full Text/Wildcard keyword matching.
 * Bypasses vector embeddings entirely for specific QUESTION_LOOKUP queries using direct frontmatter metadata queries.
 */
export async function hybridSearch(
  supabaseClient: SupabaseClient,
  query: string,
  rewrites: string[],
  intent: Intent,
  documentId?: string
): Promise<HybridCandidate[]> {
  // 1. Bypass Vector Search if it's a specific QUESTION_LOOKUP with a question number
  const qNumMatch = query.match(/\b(?:question|problem|q|no\.?)\s*(\d+)\b/i);
  const qNumber = qNumMatch ? qNumMatch[1] : null;

  if (intent === "QUESTION_LOOKUP" && qNumber) {
    console.log(`[RAG Search] Question lookup detected for Question ${qNumber}. Bypassing vector search and using direct metadata matching.`);
    
    let metaQuery = supabaseClient
      .from("chunks")
      .select("id, document_id, page_number, chunk_index, content")
      .ilike("content", `%question_number: ${qNumber}%`);

    if (documentId) {
      metaQuery = metaQuery.eq("document_id", documentId);
    }

    const { data: matchedChunks, error } = await metaQuery.limit(20);
    if (!error && matchedChunks && matchedChunks.length > 0) {
      return matchedChunks.map((c) => ({
        id: c.id,
        document_id: c.document_id,
        page_number: c.page_number,
        chunk_index: c.chunk_index,
        content: c.content,
        similarity: 1.0, // High constant similarity since it is a direct metadata match
        keywordScore: 1.0,
        combinedScore: 1.0,
      }));
    }
  }

  // 2. Otherwise, perform Hybrid Retrieval (Multi-Query Vector Search + Keyword wildcards)
  const candidateMap = new Map<string, HybridCandidate>();

  // 2a. Multi-Query Vector Search in parallel
  console.log(`[RAG Search] Running multi-query vector searches for ${rewrites.length} variants concurrently...`);
  const searchPromises = rewrites.map(async (rewrite) => {
    try {
      return await vectorSearch(supabaseClient, rewrite, {
        documentId,
        threshold: 0.15, // Retrieve lower threshold candidates to let reranking filter
        limit: 20,
      });
    } catch (err) {
      console.warn(`[RAG Search] Vector search failed for query rewrite "${rewrite}":`, err);
      return [];
    }
  });

  const allResults = await Promise.all(searchPromises);

  for (const results of allResults) {
    for (const res of results) {
      const existing = candidateMap.get(res.id);
      if (existing) {
        // Keep the highest similarity score matched across the variations
        existing.similarity = Math.max(existing.similarity, res.similarity);
      } else {
        candidateMap.set(res.id, {
          id: res.id,
          document_id: res.document_id,
          page_number: res.page_number,
          chunk_index: res.chunk_index,
          content: res.content,
          similarity: res.similarity,
          keywordScore: 0,
          combinedScore: 0,
        });
      }
    }
  }

  // 2b. Postgres Full-Text/Wildcard keyword matching
  const keywords = extractKeywords(query);
  if (keywords.length > 0) {
    let kwQuery = supabaseClient
      .from("chunks")
      .select("id, document_id, page_number, chunk_index, content");

    if (documentId) {
      kwQuery = kwQuery.eq("document_id", documentId);
    }

    // Match any chunks containing any keyword
    const filterStr = keywords.map((kw) => `content.ilike.%${kw}%`).join(",");
    const { data: keywordChunks, error } = await kwQuery.or(filterStr).limit(30);

    if (!error && keywordChunks) {
      for (const kc of keywordChunks) {
        const keywordScore = getKeywordOverlapScore(kc.content, keywords);
        const existing = candidateMap.get(kc.id);
        if (existing) {
          existing.keywordScore = keywordScore;
        } else {
          // Estimate similarity score for keyword-only matches
          const estimatedSim = 0.2 + keywordScore * 0.3;
          candidateMap.set(kc.id, {
            id: kc.id,
            document_id: kc.document_id,
            page_number: kc.page_number,
            chunk_index: kc.chunk_index,
            content: kc.content,
            similarity: estimatedSim,
            keywordScore,
            combinedScore: 0,
          });
        }
      }
    }
  }

  // 2c. Combined Weighted Score: 70% Semantic Vector Similarity + 30% Keyword Score
  const candidates = Array.from(candidateMap.values());
  for (const c of candidates) {
    // If not found in keyword search, compute overlap score dynamically
    if (c.keywordScore === 0) {
      c.keywordScore = getKeywordOverlapScore(c.content, keywords);
    }
    c.combinedScore = 0.7 * c.similarity + 0.3 * c.keywordScore;
  }

  // Sort candidates by combined score descending
  candidates.sort((a, b) => b.combinedScore - a.combinedScore);
  return candidates;
}

/**
 * Extracts distinct alphabetic keywords of length >= 3 from a query.
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "what", "which", "where", "when", "this", "that", "these", "those",
    "with", "from", "into", "about", "your", "their", "there", "here",
    "them", "then", "than", "list", "show", "find", "questions", "question",
    "explain", "summarize", "page", "contains", "problems", "topics", "give"
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));
}

/**
 * Calculates keyword overlap ratio.
 */
function getKeywordOverlapScore(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const lowerContent = content.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (lowerContent.includes(kw)) {
      matches++;
    }
  }
  return matches / keywords.length;
}
