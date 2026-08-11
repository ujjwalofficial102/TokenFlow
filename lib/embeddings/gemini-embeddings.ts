import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Failed to init GenAI for embeddings:", err);
  }
}

/**
 * Generates vector embedding array for a given text prompt.
 * Configured to output 768 dimensions to match Pinecone index configuration.
 */
export async function getEmbedding(
  text: string,
  targetDim = 768
): Promise<number[]> {
  const sanitized = text.toLowerCase().trim();

  if (apiKey && aiClient) {
    try {
      const response: any = await aiClient.models.embedContent({
        model: "gemini-embedding-2",
        contents: sanitized,
        config: {
          outputDimensionality: targetDim,
        },
      });

      const rawValues =
        response.embedding?.values || response.embeddings?.[0]?.values;
      if (rawValues && Array.isArray(rawValues)) {
        // Ensure exact target dimensionality (768)
        if (rawValues.length > targetDim) {
          return rawValues.slice(0, targetDim);
        }
        if (rawValues.length < targetDim) {
          const padded = new Array(targetDim).fill(0);
          for (let i = 0; i < rawValues.length; i++) padded[i] = rawValues[i];
          return padded;
        }
        return rawValues;
      }
    } catch (err) {
      console.warn(
        "Gemini embedding API error or dimension mismatch, fallback to 768d deterministic vector:",
        err
      );
    }
  }

  // Fallback 768-dimensional embedding simulation matching Pinecone index
  return generateDeterministicEmbedding(sanitized, targetDim);
}

/**
 * Calculates cosine similarity between two vector embedding arrays (returns 0 to 1).
 */
export function calculateCosineSimilarity(
  vecA: number[],
  vecB: number[]
): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, similarity));
}

function generateDeterministicEmbedding(text: string, dim = 768): number[] {
  const vec = new Array(dim).fill(0);
  const words = text.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
  }

  // Normalize vector to unit length
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return norm > 0 ? vec.map((v) => v / norm) : vec;
}
