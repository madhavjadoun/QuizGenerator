import { Intent } from "./intentClassifier";
import { HybridCandidate } from "./hybridSearch";
import { stripMetadata } from "./chunk";

/**
 * Resolves the Top-K retrieval limit based on intent.
 */
export function getTopKLimit(intent: Intent): number {
  switch (intent) {
    case "QUESTION_LOOKUP":
      return 2;
    case "TOPIC_SEARCH":
      return 8;
    case "SUMMARY":
      return 20;
    case "EXPLANATION":
      return 10;
    case "MCQ_GENERATION":
      return 6;
    default:
      return 5;
  }
}

/**
 * Deduplicates candidate chunks using Jaccard word similarity, merges overlapping chunks on the same page,
 * sorts them logically, and applies intent-specific dynamic Top-K capping.
 */
export function buildContext(
  candidates: HybridCandidate[],
  intent: Intent
): {
  finalChunks: HybridCandidate[];
  contextText: string;
} {
  const topK = getTopKLimit(intent);

  // 1. Deduplicate nearly identical chunks using Jaccard similarity (>0.85)
  const uniqueCandidates: HybridCandidate[] = [];
  for (const cand of candidates) {
    let isDuplicate = false;
    const cleanCandContent = stripMetadata(cand.content);

    for (const existing of uniqueCandidates) {
      const cleanExistingContent = stripMetadata(existing.content);
      const similarity = calculateJaccardSimilarity(cleanCandContent, cleanExistingContent);
      
      if (similarity > 0.85) {
        isDuplicate = true;
        // Keep the candidate with higher similarity score
        if (cand.similarity > existing.similarity) {
          existing.similarity = cand.similarity;
          existing.combinedScore = cand.combinedScore;
          existing.content = cand.content;
        }
        break;
      }
    }

    if (!isDuplicate) {
      uniqueCandidates.push(cand);
    }
  }

  // 2. Select top K candidates
  const topCandidates = uniqueCandidates.slice(0, topK);

  // 3. Sort by: Similarity (Score) descending, then Page Number ascending, then Chunk Index ascending
  topCandidates.sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }
    if (a.page_number !== b.page_number) {
      return a.page_number - b.page_number;
    }
    return a.chunk_index - b.chunk_index;
  });

  // 4. Merge consecutive/overlapping chunks on the same page to clean up context
  const pageGroups: Record<number, HybridCandidate[]> = {};
  for (const c of topCandidates) {
    const page = c.page_number;
    if (!pageGroups[page]) {
      pageGroups[page] = [];
    }
    pageGroups[page].push(c);
  }

  const sortedPages = Object.keys(pageGroups).map(Number).sort((a, b) => a - b);
  const mergedTexts: string[] = [];

  for (const page of sortedPages) {
    const pageChunks = pageGroups[page];
    // Sort page chunks chronologically by chunk index
    pageChunks.sort((a, b) => a.chunk_index - b.chunk_index);

    const mergedPageContent = pageChunks
      .map((c) => stripMetadata(c.content).trim())
      .join("\n\n---\n\n");

    mergedTexts.push(`[Page ${page}]:\n${mergedPageContent}`);
  }

  const contextText = mergedTexts.join("\n\n====================\n\n");

  return {
    finalChunks: topCandidates,
    contextText,
  };
}

/**
 * Calculates word-level Jaccard similarity between two strings.
 */
function calculateJaccardSimilarity(s1: string, s2: string): number {
  const w1 = s1.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
  const w2 = s2.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2);

  const set1 = new Set(w1);
  const set2 = new Set(w2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) {
      intersection++;
    }
  }

  const union = set1.size + set2.size - intersection;
  return intersection / union;
}
