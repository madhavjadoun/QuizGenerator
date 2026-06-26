/**
 * Normalizes query string patterns to improve search consistency.
 * Standardizes question names, specific concepts, lowercases, removes punctuation, and cleans spacing.
 */
export function normalizeQuery(query: string): string {
  if (!query) return "";

  let normalized = query.trim().toLowerCase();

  // 1. Normalize Question/Problem/Number tags (e.g. q9, Question9, problem 9, no.9 -> question 9)
  normalized = normalized.replace(/\b(?:question|problem|q|no\.?)\s*(\d+)\b/gi, "question $1");

  // 2. Normalize typical DSA/ML terminology structures
  normalized = normalized.replace(/\blinked\s*list\b/gi, "linked list");
  normalized = normalized.replace(/\blinkedlist\b/gi, "linked list");
  normalized = normalized.replace(/\bsliding\s*window\b/gi, "sliding window");
  normalized = normalized.replace(/\bslidingwindow\b/gi, "sliding window");
  
  normalized = normalized.replace(/\bk\s*means\b/gi, "k-means");
  normalized = normalized.replace(/\bkmeans\b/gi, "k-means");
  
  normalized = normalized.replace(/\bnaive\s*bayes\b/gi, "naive bayes");
  normalized = normalized.replace(/\bnaivebayes\b/gi, "naive bayes");

  normalized = normalized.replace(/\btwo\s*pointer\b/gi, "two pointer");
  
  // 3. Remove punctuation (retaining hyphens, spaces, alphanumeric)
  normalized = normalized.replace(/[^\w\s-]/gi, "");

  // 4. Fix spaces (collapse multiple spaces to single)
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}
