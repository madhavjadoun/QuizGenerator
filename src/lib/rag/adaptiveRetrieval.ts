import type { AIProvider } from "./aiProvider";

export type RetrievalMode = "FACT" | "DOCUMENT" | "CATEGORY";

export interface CleanedContext {
  page_number: number;
  content: string;
}

export interface GeminiResult {
  text: string;
  promptTokens: number;
}

/**
 * Standard utility to query Gemini v1beta endpoint and retrieve response text + token metadata
 */
export async function callGemini(
  prompt: string,
  apiKey: string,
  systemInstruction?: string
): Promise<GeminiResult> {
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload: {
    contents: { parts: { text: string }[] }[];
    systemInstruction?: { parts: { text: string }[] };
  } = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(geminiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API call failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const promptTokens = data.usageMetadata?.promptTokenCount || Math.ceil((prompt.length + (systemInstruction?.length || 0)) / 4.2);

  return { text, promptTokens };
}

/**
 * Classifies query intent semantically using Gemini 2.5 Flash / Ollama with keyword fallbacks.
 * Classified into: FACT, DOCUMENT, or CATEGORY.
 */
export async function detectRetrievalMode(
  question: string,
  provider: AIProvider
): Promise<RetrievalMode> {
  const classificationPrompt = `Classify the following user query for a document RAG search system.
Analyze the user's intent:
- Respond with "DOCUMENT" if the user wants to summarize the whole document, explain the entire PDF, list all questions/algorithms, or ask a question that requires reading/summarizing the complete file.
- Respond with "CATEGORY" if the user wants to list, show, find, or search for questions/problems/topics related to a specific category or domain (e.g. "list all array questions", "show linked list problems", "find DP questions", "Show machine learning topics").
- Respond with "FACT" if the user asks about a narrow, specific concept, algorithm, particular page, single question, individual section, or one-off fact (e.g., "What is Sliding Window?", "Explain KMeans", "What is PCA?").

Do not write any explanation. Respond with exactly one word: either "FACT", "DOCUMENT", or "CATEGORY".

User Query: "${question}"`;

  try {
    const result = await provider.generateText(
      classificationPrompt,
      "You are a precise classifier. Reply with exactly one word: FACT, DOCUMENT, or CATEGORY."
    );

    const norm = result.text.toUpperCase().trim();
    if (norm.includes("DOCUMENT")) return "DOCUMENT";
    if (norm.includes("CATEGORY")) return "CATEGORY";
    return "FACT";
  } catch (err) {
    console.warn("[Adaptive Retrieval] Classification API call failed, falling back to heuristics:", err);

    const lower = question.toLowerCase();

    // Heuristic Category Check
    const categoryKeywords = [
      "array", "list", "graph", "tree", "dp", "dynamic programming", "sql", "database",
      "machine learning", "ml", "sorting", "binary search", "hashing", "two pointers", "sliding window"
    ];
    const isCategoryRequest = ["find", "show", "list", "get"].some(verb => lower.includes(verb)) &&
                              categoryKeywords.some(keyword => lower.includes(keyword));

    if (isCategoryRequest) {
      return "CATEGORY";
    }

    // Heuristic Document Check
    const docLevelKeywords = [
      "summarize", "summary", "overview", "table of contents", "outline",
      "list all", "list every", "show all", "show every", "extract all",
      "extract every", "entire", "whole", "full pdf", "complete notes", "syllabus", "how many questions"
    ];
    if (docLevelKeywords.some(keyword => lower.includes(keyword))) {
      return "DOCUMENT";
    }

    return "FACT";
  }
}

/**
 * Enriches the user query before vector search based on categorized topics.
 */
export function expandQuery(question: string): string {
  const lower = question.toLowerCase();
  let expansion = "";

  if (lower.includes("array") || lower.includes("arrays")) {
    expansion += " array arrays sorting binary search two pointers sliding window prefix sum hashing";
  }
  if (lower.includes("linked list") || lower.includes("list") || lower.includes("lists")) {
    expansion += " linked list lists nodes head tail reverse pointer two pointers slow fast cycle";
  }
  if (lower.includes("graph") || lower.includes("graphs")) {
    expansion += " graph graphs bfs dfs traversal tree adjacency list matrix cycle shortest path dijkstra topological sort";
  }
  if (lower.includes("tree") || lower.includes("bst") || lower.includes("binary tree")) {
    expansion += " tree binary tree bst preorder inorder postorder nodes root leaf height depth path";
  }
  if (lower.includes("dp") || lower.includes("dynamic programming")) {
    expansion += " dp dynamic programming memoization recursion knapsack tabulation coin change fibonacci grid travel";
  }
  if (lower.includes("sql") || lower.includes("database") || lower.includes("query")) {
    expansion += " sql database select query join group by order by aggregate window function primary key indexing table";
  }
  if (lower.includes("machine learning") || lower.includes("ml") || lower.includes("model")) {
    expansion += " machine learning ml model regression classification clustering training dataset feature engineering pca kmeans kmeans neural network";
  }

  return expansion ? `${question} ${expansion}`.trim() : question;
}

/**
 * Extracts normalized keyword lists from a query string.
 */
export function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    "what", "which", "where", "when", "this", "that", "these", "those",
    "with", "from", "into", "about", "your", "their", "there", "here",
    "them", "then", "than", "list", "show", "find", "questions", "question",
    "explain", "summarize", "page", "contains", "problems", "topics"
  ]);
  
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length >= 3 && !stopWords.has(w));
}

/**
 * Calculates keyword overlap metric.
 */
export function getKeywordOverlap(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const lowerContent = content.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (lowerContent.includes(kw.toLowerCase())) {
      matches++;
    }
  }
  return matches / keywords.length;
}

/**
 * Computes Jaccard word-level overlap similarity between two strings.
 */
export function calculateJaccardSimilarity(s1: string, s2: string): number {
  const words1 = new Set(s1.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let intersectionCount = 0;
  for (const w of words1) {
    if (words2.has(w)) {
      intersectionCount++;
    }
  }
  
  const unionSize = words1.size + words2.size - intersectionCount;
  return intersectionCount / unionSize;
}

/**
 * Removes duplicate or nearly identical chunks based on Jaccard similarity.
 * Keeps the chunk with the highest similarity score.
 */
export function removeNearlyIdenticalChunks<T extends { content: string; similarity: number }>(
  chunks: T[]
): T[] {
  const result: T[] = [];
  
  for (const candidate of chunks) {
    let isDuplicate = false;
    for (let i = 0; i < result.length; i++) {
      const existing = result[i];
      const jaccardSim = calculateJaccardSimilarity(candidate.content, existing.content);
      if (jaccardSim > 0.85) {
        isDuplicate = true;
        if (candidate.similarity > existing.similarity) {
          result[i] = candidate;
        }
        break;
      }
    }
    if (!isDuplicate) {
      result.push(candidate);
    }
  }
  
  return result;
}

/**
 * Clean context pack logic.
 */
export function cleanAndMergeContext(
  chunks: { page_number: number; content: string; chunk_index?: number }[]
): { cleaned: CleanedContext[]; removedDuplicatesCount: number; mergedChunksCount: number } {
  const uniqueChunks: typeof chunks = [];
  const seen = new Set<string>();
  let removedDuplicatesCount = 0;

  for (const chunk of chunks) {
    const norm = chunk.content.trim().toLowerCase();
    if (!seen.has(norm)) {
      seen.add(norm);
      uniqueChunks.push(chunk);
    } else {
      removedDuplicatesCount++;
    }
  }

  const groups: Record<number, typeof chunks> = {};
  for (const chunk of uniqueChunks) {
    const page = chunk.page_number;
    if (!groups[page]) {
      groups[page] = [];
    }
    groups[page].push(chunk);
  }

  const cleaned: CleanedContext[] = [];
  const pages = Object.keys(groups).map(Number).sort((a, b) => a - b);
  let mergedChunksCount = 0;

  for (const page of pages) {
    const pageChunks = groups[page];
    if (pageChunks[0].chunk_index !== undefined) {
      pageChunks.sort((a, b) => (a.chunk_index || 0) - (b.chunk_index || 0));
    }

    const mergedText = pageChunks.map(c => c.content.trim()).join("\n\n---\n\n");
    cleaned.push({
      page_number: page,
      content: mergedText,
    });
    
    if (pageChunks.length > 1) {
      mergedChunksCount += (pageChunks.length - 1);
    }
  }

  return {
    cleaned,
    removedDuplicatesCount,
    mergedChunksCount,
  };
}

/**
 * Summarizes document chunks in batches of 20-25 to handle large contexts safely.
 */
export async function summarizeBatches(
  chunks: { page_number: number; content: string; chunk_index?: number }[],
  provider: AIProvider,
  batchSize: number = 20
): Promise<{ mergedSummary: string; totalBatchInputTokens: number }> {
  const batchSummaries: string[] = [];
  let totalBatchInputTokens = 0;
  const totalBatches = Math.ceil(chunks.length / batchSize);

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchContext = batch
      .map((c) => `[Page ${c.page_number}]:\n${c.content}`)
      .join("\n\n");

    const batchPrompt = `Analyze the following section of a document and generate a detailed structured summary containing all key facts, definitions, formulas, questions, and important topics mentioned. Preserve page references.

Document Section:
${batchContext}`;

    console.log(`[Large Document Mode] Summarizing batch ${Math.floor(i / batchSize) + 1}/${totalBatches}`);
    const result = await provider.generateText(
      batchPrompt,
      "You are a precise document analyzer. Extract all key information without losing details."
    );

    batchSummaries.push(result.text);
    totalBatchInputTokens += result.promptTokens;
  }

  const mergedSummary = batchSummaries.join("\n\n=== Section Summary ===\n\n");
  return {
    mergedSummary,
    totalBatchInputTokens,
  };
}
