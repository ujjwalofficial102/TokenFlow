import { Pinecone } from "@pinecone-database/pinecone";
import {
  getEmbedding,
  calculateCosineSimilarity,
} from "../embeddings/gemini-embeddings";
import { KnowledgeRecord } from "@/types";

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME || "tokenflow-knowledge";

let pineconeClient: Pinecone | null = null;
if (apiKey && !apiKey.includes("your_pinecone")) {
  try {
    pineconeClient = new Pinecone({ apiKey });
  } catch (err) {
    console.warn("Pinecone client init warning:", err);
  }
}

// In-Memory fallback vector storage index for seamless offline/demo mode
const memoryVectorStore: Array<{
  record: KnowledgeRecord;
  embedding: number[];
}> = [];

interface VectorSearchResult {
  match: KnowledgeRecord | null;
  similarity: number;
}

/**
 * Searches vector store for a semantically similar response matching the query embedding.
 * Default similarity threshold set to 0.90 (90%) for high-precision semantic search retrieval.
 */
export async function searchSemanticKnowledge(
  queryPrompt: string,
  similarityThreshold = 0.90
): Promise<VectorSearchResult> {
  if (!queryPrompt) return { match: null, similarity: 0 };

  const queryVector = await getEmbedding(queryPrompt);

  if (pineconeClient) {
    try {
      const index = pineconeClient.index(indexName);
      const queryResponse = await index.query({
        vector: queryVector,
        topK: 1,
        includeMetadata: true,
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        const topMatch = queryResponse.matches[0];
        const score = topMatch.score || 0;
        console.log(`[Pinecone Search] Query: "${queryPrompt}" | Top Match Score: ${(score * 100).toFixed(1)}% | Threshold: ${(similarityThreshold * 100).toFixed(1)}%`);

        if (score >= similarityThreshold && topMatch.metadata) {
          const record: KnowledgeRecord = {
            id: topMatch.id,
            originalPrompt: String(topMatch.metadata.originalPrompt || ""),
            optimizedPrompt: String(topMatch.metadata.optimizedPrompt || ""),
            normalizedPrompt: String(topMatch.metadata.normalizedPrompt || ""),
            response: String(topMatch.metadata.response || ""),
            responseTokens: Number(topMatch.metadata.responseTokens || 0),
            timesRetrieved: Number(topMatch.metadata.timesRetrieved || 0) + 1,
            createdAt: String(
              topMatch.metadata.createdAt || new Date().toISOString()
            ),
            lastAccessed: new Date().toISOString(),
          };
          return { match: record, similarity: score };
        }
      }
    } catch (err) {
      console.warn(
        "Pinecone query warning, falling back to local memory vector store:",
        err
      );
    }
  }

  // Fallback in-memory vector similarity search
  let bestMatch: KnowledgeRecord | null = null;
  let highestSimilarity = 0;

  for (const item of memoryVectorStore) {
    const similarity = calculateCosineSimilarity(queryVector, item.embedding);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = item.record;
    }
  }

  console.log(`[Memory Vector Store] Query: "${queryPrompt}" | Score: ${(highestSimilarity * 100).toFixed(1)}% | Threshold: ${(similarityThreshold * 100).toFixed(1)}%`);

  if (highestSimilarity >= similarityThreshold && bestMatch) {
    bestMatch.timesRetrieved += 1;
    bestMatch.lastAccessed = new Date().toISOString();
    return { match: bestMatch, similarity: highestSimilarity };
  }

  return { match: null, similarity: highestSimilarity };
}

/**
 * Stores a high quality LLM response in Vector DB following TokenFlow Intelligent Rules:
 * Rule 1: Only store if responseTokens >= 50
 * Rule 2: Prevent duplicates: Skip insertion if duplicate exists with similarity > 0.95
 */
export async function storeKnowledgeIfEligible(
  originalPrompt: string,
  optimizedPrompt: string,
  normalizedPrompt: string,
  response: string,
  responseTokens: number,
  minTokensThreshold = 50
): Promise<{ stored: boolean; reason?: string }> {
  // Quality Check 1: Must meet token threshold
  if (responseTokens < minTokensThreshold) {
    return {
      stored: false,
      reason: `Response tokens (${responseTokens}) below storage threshold (${minTokensThreshold})`,
    };
  }

  // Quality Check 2: Check for existing duplicate with similarity > 0.95 (PRD Rule 3)
  const duplicateCheck = await searchSemanticKnowledge(optimizedPrompt, 0.95);
  if (duplicateCheck.match) {
    console.log(`[Knowledge Storage] Skipped storing duplicate record (Similarity: ${(duplicateCheck.similarity * 100).toFixed(1)}% > 95%)`);
    return {
      stored: false,
      reason: `Duplicate knowledge detected (Similarity: ${Math.round(
        duplicateCheck.similarity * 100
      )}% > 95%)`,
    };
  }

  const embeddingVector = await getEmbedding(optimizedPrompt);
  const recordId =
    "kb-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

  const record: KnowledgeRecord = {
    id: recordId,
    originalPrompt,
    optimizedPrompt,
    normalizedPrompt,
    response,
    responseTokens,
    timesRetrieved: 0,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  };

  if (pineconeClient) {
    try {
      const index = pineconeClient.index(indexName);
      await index.upsert({
        records: [
          {
            id: recordId,
            values: embeddingVector,
            metadata: {
              text: optimizedPrompt,
              originalPrompt,
              optimizedPrompt,
              normalizedPrompt,
              response,
              responseTokens,
              timesRetrieved: 0,
              createdAt: record.createdAt,
              lastAccessed: record.lastAccessed,
            },
          },
        ],
      });
      console.log(`[Pinecone Storage] Successfully stored vector record "${recordId}" for prompt: "${optimizedPrompt}"`);
    } catch (err) {
      console.warn("Pinecone UPSERT Error:", err);
    }
  }

  // Store in memory store
  memoryVectorStore.push({ record, embedding: embeddingVector });
  return { stored: true };
}

export function getMemoryKnowledgeCount(): number {
  return memoryVectorStore.length;
}
