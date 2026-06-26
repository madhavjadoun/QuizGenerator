import { AIProvider } from "./aiProvider";

export type Intent =
  | "QUESTION_LOOKUP"
  | "TOPIC_SEARCH"
  | "MCQ_GENERATION"
  | "SUMMARY"
  | "EXPLANATION"
  | "COMPARE"
  | "COUNT"
  | "LIST"
  | "UNKNOWN";

/**
 * Classifies query intent using LLM provider with a fast regex heuristic fallback.
 */
export async function classifyIntent(query: string, provider: AIProvider): Promise<Intent> {
  const prompt = `Classify the intent of the following user query for a document RAG search system.
Choose exactly one of these categories:
- QUESTION_LOOKUP: Searching for a specific question number (e.g. "What is Question 9?", "Question 10", "Show Q3").
- TOPIC_SEARCH: Searching for topics, domains, or sections (e.g. "Array related questions", "problems about Graph", "Sliding window topics").
- MCQ_GENERATION: Request to generate multiple choice questions or quiz (e.g. "Generate MCQ on list", "Quiz about sorting").
- SUMMARY: Summarize, outline, or get an overview of the document (e.g. "Summarize document", "Give an overview", "Table of contents").
- EXPLANATION: Asking for an explanation or concept analysis (e.g. "Explain Naive Bayes", "What is KMeans?", "How does cycle detection work").
- COMPARE: Compare two concepts or identify differences (e.g. "Difference between BFS and DFS", "Compare KMeans and PCA").
- COUNT: Counting questions or pages (e.g. "How many questions are there?", "Count number of array problems").
- LIST: Requesting a list or extraction of all questions/problems (e.g. "List all questions", "Extract every question").
- UNKNOWN: None of the above categories match.

Reply with exactly one word from the list of categories: QUESTION_LOOKUP, TOPIC_SEARCH, MCQ_GENERATION, SUMMARY, EXPLANATION, COMPARE, COUNT, LIST, UNKNOWN. Do not write any other explanation or text.

User Query: "${query}"`;

  try {
    const response = await provider.generateText(
      prompt,
      "You are a precise intent classifier. Reply with exactly one category word."
    );
    const norm = response.text.trim().toUpperCase();

    if (norm.includes("QUESTION_LOOKUP")) return "QUESTION_LOOKUP";
    if (norm.includes("TOPIC_SEARCH")) return "TOPIC_SEARCH";
    if (norm.includes("MCQ_GENERATION")) return "MCQ_GENERATION";
    if (norm.includes("SUMMARY")) return "SUMMARY";
    if (norm.includes("EXPLANATION")) return "EXPLANATION";
    if (norm.includes("COMPARE")) return "COMPARE";
    if (norm.includes("COUNT")) return "COUNT";
    if (norm.includes("LIST")) return "LIST";
    if (norm.includes("UNKNOWN")) return "UNKNOWN";

    // Heuristic fallback if LLM returned an unrecognized response
    return classifyIntentHeuristically(query);
  } catch (err) {
    console.warn("[Intent Classifier] LLM classification failed, falling back to heuristics:", err);
    return classifyIntentHeuristically(query);
  }
}

/**
 * Heuristically classifies query intent based on keywords and regular expressions.
 */
export function classifyIntentHeuristically(query: string): Intent {
  const lower = query.toLowerCase();

  // 1. QUESTION_LOOKUP
  if (
    /\bquestion\s*\d+\b/i.test(lower) ||
    /\bq\s*\d+\b/i.test(lower) ||
    /\bproblem\s*\d+\b/i.test(lower) ||
    /\bno\s*\d+\b/i.test(lower)
  ) {
    return "QUESTION_LOOKUP";
  }

  // 2. MCQ_GENERATION
  if (
    lower.includes("mcq") ||
    lower.includes("multiple choice") ||
    lower.includes("quiz") ||
    lower.includes("practice questions")
  ) {
    return "MCQ_GENERATION";
  }

  // 3. SUMMARY
  if (
    lower.includes("summarize") ||
    lower.includes("summary") ||
    lower.includes("overview") ||
    lower.includes("outline") ||
    lower.includes("table of contents")
  ) {
    return "SUMMARY";
  }

  // 4. COMPARE
  if (
    lower.includes("compare") ||
    lower.includes("difference") ||
    lower.includes("vs") ||
    lower.includes("contrast")
  ) {
    return "COMPARE";
  }

  // 5. COUNT
  if (
    lower.includes("how many") ||
    lower.includes("count") ||
    lower.includes("number of")
  ) {
    return "COUNT";
  }

  // 6. LIST
  if (
    lower.includes("list") ||
    lower.includes("show all") ||
    lower.includes("get all") ||
    lower.includes("extract all")
  ) {
    return "LIST";
  }

  // 7. TOPIC_SEARCH
  const dsaKeywords = [
    "array", "arrays", "list", "lists", "graph", "graphs", "tree", "trees", "dp", "dynamic programming", "sql", "database",
    "machine learning", "ml", "sorting", "binary search", "hashing", "two pointers", "sliding window"
  ];
  if (dsaKeywords.some((keyword) => lower.includes(keyword))) {
    return "TOPIC_SEARCH";
  }

  // 8. EXPLANATION
  if (
    lower.includes("explain") ||
    lower.includes("what is") ||
    lower.includes("why") ||
    lower.includes("how do") ||
    lower.includes("define")
  ) {
    return "EXPLANATION";
  }

  return "UNKNOWN";
}
