import { openai } from '@ai-sdk/openai';
import { embedMany, embed } from 'ai';
import { getAllChunksWithEmbeddings } from '@/lib/db/queries';

const EMBEDDING_MODEL = openai.embedding('text-embedding-3-small');

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: text,
  });
  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: texts,
  });
  return embeddings;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface SearchResult {
  chunkId: string;
  content: string;
  similarity: number;
  sourceId: string;
  productId: string | null;
  metadata: Record<string, unknown> | null;
}

export async function semanticSearch(query: string, topK: number = 5, minSimilarity: number = 0.3): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);
  const chunks = getAllChunksWithEmbeddings();

  const results: SearchResult[] = chunks
    .map(chunk => {
      const chunkEmbedding = JSON.parse(chunk.embedding!) as number[];
      const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
      return {
        chunkId: chunk.id,
        content: chunk.content,
        similarity,
        sourceId: chunk.source_id,
        productId: chunk.product_id,
        metadata: chunk.metadata ? JSON.parse(chunk.metadata) : null,
      };
    })
    .filter(r => r.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return results;
}
