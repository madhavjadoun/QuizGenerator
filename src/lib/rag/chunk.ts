export interface Chunk {
  pageNumber: number; // 1-based page number
  chunkIndex: number;  // 0-based global sequence index of the chunk
  content: string;
}

const CHARS_PER_TOKEN = 4;
const TARGET_MAX_TOKENS = 1000;
const OVERLAP_TOKENS = 150;

const MAX_CHUNK_CHARS = TARGET_MAX_TOKENS * CHARS_PER_TOKEN; // 4000 characters
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN;       // 600 characters

/**
 * Splits document page texts into semantic chunks of approximately 800-1000 tokens.
 * Maintains a 150-token overlap and preserves page numbers.
 */
export function chunkDocument(pageTexts: string[]): Chunk[] {
  const chunks: Chunk[] = [];
  let globalChunkIndex = 0;

  for (let i = 0; i < pageTexts.length; i++) {
    const pageNumber = i + 1;
    const pageText = pageTexts[i]?.trim() ?? "";
    
    if (!pageText) {
      continue;
    }

    const estimatedPageTokens = Math.ceil(pageText.length / CHARS_PER_TOKEN);

    // If the entire page fits comfortably within the target chunk size, keep it whole
    if (estimatedPageTokens <= TARGET_MAX_TOKENS) {
      chunks.push({
        pageNumber,
        chunkIndex: globalChunkIndex++,
        content: pageText,
      });
      continue;
    }

    // Split page text into sentences (using lookbehind to keep punctuation with the sentence)
    const sentences = pageText.split(/(?<=[.!?])\s+/);
    
    let currentSentences: string[] = [];
    let currentLength = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) {
        continue;
      }

      const sentenceLength = trimmedSentence.length;

      // If adding this sentence exceeds MAX_CHUNK_CHARS and we already have content,
      // emit the current chunk and prepare the overlapping sliding window
      if (currentLength + (currentLength > 0 ? 1 : 0) + sentenceLength > MAX_CHUNK_CHARS) {
        if (currentSentences.length > 0) {
          chunks.push({
            pageNumber,
            chunkIndex: globalChunkIndex++,
            content: currentSentences.join(" "),
          });

          // Build the overlap for the next chunk from the end of the current sentences array
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

      // Handle edge case where a single sentence is larger than the maximum chunk size.
      // In this case, if the sentence is alone, we must split it by words to stay within size.
      if (sentenceLength > MAX_CHUNK_CHARS) {
        // First, flush whatever is in currentSentences
        if (currentSentences.length > 0) {
          chunks.push({
            pageNumber,
            chunkIndex: globalChunkIndex++,
            content: currentSentences.join(" "),
          });
          currentSentences = [];
          currentLength = 0;
        }

        // Split the giant sentence by words
        const words = trimmedSentence.split(/\s+/);
        let wordChunk: string[] = [];
        let wordChunkLength = 0;

        for (const word of words) {
          const wordLength = word.length;
          if (wordChunkLength + (wordChunkLength > 0 ? 1 : 0) + wordLength > MAX_CHUNK_CHARS) {
            if (wordChunk.length > 0) {
              chunks.push({
                pageNumber,
                chunkIndex: globalChunkIndex++,
                content: wordChunk.join(" "),
              });

              // Overlap for word-level split: take trailing words up to OVERLAP_CHARS
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

    // Flush any remaining content as the final chunk of the page
    if (currentSentences.length > 0) {
      chunks.push({
        pageNumber,
        chunkIndex: globalChunkIndex++,
        content: currentSentences.join(" "),
      });
    }
  }

  return chunks;
}
