import { AIProvider } from "./aiProvider";

// In-memory cache for expanded queries
const rewriteCache = new Map<string, string[]>();

/**
 * Rewrites a normalized query into multiple search variations and enriches it with topic synonyms.
 * Keeps an in-memory cache to prevent duplicate LLM calls.
 */
export async function expandQueryAndRewrites(
  query: string,
  provider: AIProvider
): Promise<string[]> {
  const cacheKey = query.trim().toLowerCase();
  if (rewriteCache.has(cacheKey)) {
    return rewriteCache.get(cacheKey)!;
  }

  const rewrites: string[] = [query];

  // 1. Semantic Query Rewriter using the active AI provider
  try {
    const rewritePrompt = `You are a search query rewriter for a vector database.
Generate 3 distinct, search-friendly alternative queries or phrases to search for information related to this question:
"${query}"

Return only the alternative queries, one per line. Do not write explanations, numbers, bullet points, or list markers. Just output raw plain text query strings.`;

    const response = await provider.generateText(
      rewritePrompt,
      "You are a precise search rewriter. Return exactly 3 lines of query variants."
    );

    const lines = response.text
      .split("\n")
      .map((l) => l.replace(/^[-*+\d.\s]+/g, "").trim())
      .filter((l) => l.length > 3);

    for (const line of lines) {
      if (!rewrites.includes(line)) {
        rewrites.push(line);
      }
    }
  } catch (err) {
    console.warn("[Query Expansion] LLM rewrite query failed, using rule-based rewrites:", err);
  }

  // 2. DSA Topic Keyword Expansion Synonyms
  const lower = query.toLowerCase();

  // Array-related expansion
  if (lower.includes("array") || lower.includes("arrays") || lower.includes("subarray")) {
    rewrites.push(
      "array subarray sliding window two pointers sorting frequency binary search prefix sum rain water k closest maximum subarray merge intervals"
    );
  }

  // Sliding Window expansion
  if (lower.includes("sliding window") || lower.includes("slidingwindow") || lower.includes("window")) {
    rewrites.push(
      "sliding window fixed window dynamic window maximum sum subarray variable window subarray"
    );
  }

  // Linked List expansion
  if (lower.includes("linked list") || lower.includes("linkedlist") || lower.includes("list")) {
    rewrites.push(
      "linked list singly linked list cycle detection reverse linked list merge linked list intersection remove nth node group reverse"
    );
  }

  // Graph expansion
  if (lower.includes("graph") || lower.includes("graphs")) {
    rewrites.push(
      "graph graphs bfs dfs shortest path dijkstra topological sort tree adjacency list matrix cycle minimum spanning tree mst"
    );
  }

  // Dynamic Programming expansion
  if (lower.includes("dp") || lower.includes("dynamic programming")) {
    rewrites.push(
      "dp dynamic programming memoization recursion knapsack tabulation coin change fibonacci grid travel"
    );
  }

  // SQL/Database expansion
  if (lower.includes("sql") || lower.includes("database") || lower.includes("query")) {
    rewrites.push(
      "sql database select query join group by order by aggregate window function primary key indexing table"
    );
  }

  // KMeans / Clustering / ML expansion
  if (
    lower.includes("kmeans") ||
    lower.includes("k-means") ||
    lower.includes("clustering") ||
    lower.includes("machine learning") ||
    lower.includes("ml")
  ) {
    rewrites.push(
      "machine learning ml clustering kmeans k-means neural network regression classification feature engineering pca naive bayes"
    );
  }

  // Deduplicate and filter empty queries
  const finalRewrites = Array.from(new Set(rewrites.map((r) => r.trim()).filter((r) => r.length > 0)));

  // Cache result
  rewriteCache.set(cacheKey, finalRewrites);
  return finalRewrites;
}
