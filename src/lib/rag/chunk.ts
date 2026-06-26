export interface Chunk {
  pageNumber: number; // 1-based page number
  chunkIndex: number;  // 0-based global sequence index of the chunk
  content: string;     // With metadata frontmatter prepended
}

const CHARS_PER_TOKEN = 4;
const TARGET_MAX_TOKENS = 1000;
const OVERLAP_TOKENS = 150;

const MAX_CHUNK_CHARS = TARGET_MAX_TOKENS * CHARS_PER_TOKEN; // 4000 characters
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN;       // 600 characters

/**
 * Strips the metadata block from the chunk content.
 */
export function stripMetadata(content: string): string {
  return content.replace(/^---[\s\S]*?---\n*/, "");
}

/**
 * Splits document page texts into semantic question-based chunks of approximately 800-1000 tokens.
 * Extracts page and document level metadata and prepends it to the stored chunk content.
 */
export function chunkDocument(pageTexts: string[], fileName?: string): Chunk[] {
  const chunks: Chunk[] = [];
  let globalChunkIndex = 0;

  for (let i = 0; i < pageTexts.length; i++) {
    const pageNumber = i + 1;
    const pageText = pageTexts[i]?.trim() ?? "";
    
    if (!pageText) {
      continue;
    }

    // Split page text semantically by Question or Heading boundaries
    // Matches: Question 9, Q9, Problem 9, No. 9, 1. Two Sum, ## Heading
    const boundaryPattern = /\n(?=(?:Question|q|problem|No\.)\s*\d+\b|\d+\.\s+[A-Z]|##+\s)/gi;
    const segments = pageText.split(boundaryPattern);

    for (const segment of segments) {
      const trimmedSegment = segment.trim();
      if (!trimmedSegment) {
        continue;
      }

      const segmentLength = trimmedSegment.length;

      // If the segment fits in one chunk, keep it intact
      if (segmentLength <= MAX_CHUNK_CHARS) {
        const contentWithMetadata = addMetadataHeader(trimmedSegment, pageNumber, fileName);
        chunks.push({
          pageNumber,
          chunkIndex: globalChunkIndex++,
          content: contentWithMetadata,
        });
        continue;
      }

      // Sentence boundary splitting for oversized segments
      const sentences = trimmedSegment.split(/(?<=[.!?])\s+/);
      let currentSentences: string[] = [];
      let currentLength = 0;

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) {
          continue;
        }

        const sentenceLength = trimmedSentence.length;

        if (currentLength + (currentLength > 0 ? 1 : 0) + sentenceLength > MAX_CHUNK_CHARS) {
          if (currentSentences.length > 0) {
            const rawContent = currentSentences.join(" ");
            const contentWithMetadata = addMetadataHeader(rawContent, pageNumber, fileName);
            chunks.push({
              pageNumber,
              chunkIndex: globalChunkIndex++,
              content: contentWithMetadata,
            });

            // Sliding window overlap
            const overlapSentences: string[] = [];
            let overlapLength = 0;
            for (let j = currentSentences.length - 1; j >= 0; j--) {
              const s = currentSentences[j];
              const candidateLength = overlapLength + (overlapLength > 0 ? 1 : 0) + s.length;
              if (candidateLength <= OVERLAP_CHARS) {
                overlapSentences.unshift(s);
                overlapLength = candidateLength;
              } else {
                break;
              }
            }
            currentSentences = overlapSentences;
            currentLength = overlapLength;
          }
        }

        if (sentenceLength > MAX_CHUNK_CHARS) {
          if (currentSentences.length > 0) {
            const rawContent = currentSentences.join(" ");
            const contentWithMetadata = addMetadataHeader(rawContent, pageNumber, fileName);
            chunks.push({
              pageNumber,
              chunkIndex: globalChunkIndex++,
              content: contentWithMetadata,
            });
            currentSentences = [];
            currentLength = 0;
          }

          // Giant sentence fallback: split by words
          const words = trimmedSentence.split(/\s+/);
          let wordChunk: string[] = [];
          let wordChunkLength = 0;

          for (const word of words) {
            const wordLength = word.length;
            if (wordChunkLength + (wordChunkLength > 0 ? 1 : 0) + wordLength > MAX_CHUNK_CHARS) {
              if (wordChunk.length > 0) {
                const rawContent = wordChunk.join(" ");
                const contentWithMetadata = addMetadataHeader(rawContent, pageNumber, fileName);
                chunks.push({
                  pageNumber,
                  chunkIndex: globalChunkIndex++,
                  content: contentWithMetadata,
                });

                const overlapWords: string[] = [];
                let overlapWordLength = 0;
                for (let k = wordChunk.length - 1; k >= 0; k--) {
                  const w = wordChunk[k];
                  const candLength = overlapWordLength + (overlapWordLength > 0 ? 1 : 0) + w.length;
                  if (candLength <= OVERLAP_CHARS) {
                    overlapWords.unshift(w);
                    overlapWordLength = candLength;
                  } else {
                    break;
                  }
                }
                wordChunk = overlapWords;
                wordChunkLength = overlapWordLength;
              }
            }
            wordChunk.push(word);
            wordChunkLength += (wordChunkLength > 0 ? 1 : 0) + wordLength;
          }

          if (wordChunk.length > 0) {
            currentSentences = [wordChunk.join(" ")];
            currentLength = wordChunkLength;
          }
        } else {
          currentSentences.push(trimmedSentence);
          currentLength += (currentLength > 0 ? 1 : 0) + sentenceLength;
        }
      }

      if (currentSentences.length > 0) {
        const rawContent = currentSentences.join(" ");
        const contentWithMetadata = addMetadataHeader(rawContent, pageNumber, fileName);
        chunks.push({
          pageNumber,
          chunkIndex: globalChunkIndex++,
          content: contentWithMetadata,
        });
      }
    }
  }

  return chunks;
}

/**
 * Parses semantic metadata from chunk text and structures it as standard frontmatter.
 */
function addMetadataHeader(content: string, pageNumber: number, fileName?: string): string {
  // 1. Extract Question Number (matches Q9, q9, Question 9, Problem 9, No. 9)
  const qNumMatch = content.match(/\b(?:Question|q|problem|No\.)\s*(\d+)\b/i);
  const questionNumber = qNumMatch ? qNumMatch[1] : "";

  // 2. Extract Headings / Title (first line of the chunk content)
  const firstLine = content.split("\n")[0]?.trim() || "";
  const headings = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;

  // 3. Extract Topic / DSA category keywords
  const topics: string[] = [];
  const lower = content.toLowerCase();
  
  if (lower.includes("array") || lower.includes("arrays") || lower.includes("subarray")) {
    topics.push("Array");
  }
  if (lower.includes("linked list") || lower.includes("linked-list") || lower.includes("singly linked") || lower.includes("list")) {
    topics.push("Linked List");
  }
  if (lower.includes("graph") || lower.includes("bfs") || lower.includes("dfs") || lower.includes("shortest path")) {
    topics.push("Graph");
  }
  if (lower.includes("tree") || lower.includes("binary tree") || lower.includes("bst")) {
    topics.push("Tree");
  }
  if (lower.includes("dp") || lower.includes("dynamic programming")) {
    topics.push("Dynamic Programming");
  }
  if (lower.includes("sql") || lower.includes("database") || lower.includes("query")) {
    topics.push("Database/SQL");
  }
  if (lower.includes("kmeans") || lower.includes("k-means")) {
    topics.push("K-Means Clustering");
  }
  if (lower.includes("naive bayes") || lower.includes("naivebayes") || lower.includes("bayes")) {
    topics.push("Naive Bayes");
  }
  if (lower.includes("pca") || lower.includes("principal component")) {
    topics.push("PCA");
  }
  if (lower.includes("sliding window") || lower.includes("slidingwindow")) {
    topics.push("Sliding Window");
  }
  if (lower.includes("two pointer") || lower.includes("two-pointer") || lower.includes("two pointers")) {
    topics.push("Two Pointers");
  }
  if (lower.includes("sorting")) {
    topics.push("Sorting");
  }

  const topic = topics.length > 0 ? topics.join(", ") : "General";

  return `---
document_name: ${fileName || "Unknown"}
page_number: ${pageNumber}
question_number: ${questionNumber}
headings: ${headings}
topic: ${topic}
---
${content}`;
}
