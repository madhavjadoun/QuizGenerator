/**
 * Generates vector embeddings for a given text using the Google Gemini Embedding API.
 * Uses the latest `text-embedding-004` model (768 dimensions).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Please configure it in your environment or .env.local file.");
  }

  const cleanText = text.replace(/\n+/g, " ").trim();
  if (!cleanText) {
    return new Array(768).fill(0);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: {
        parts: [{ text: cleanText }],
      },
      outputDimensionality: 768
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Embedding API failed: ${response.statusText} (${response.status}) - ${errorText}`);
  }

  const data = await response.json();
  const values = data.embedding?.values;

  if (!values || !Array.isArray(values)) {
    throw new Error(`Invalid response format from Gemini Embedding API: ${JSON.stringify(data)}`);
  }

  return values;
}
