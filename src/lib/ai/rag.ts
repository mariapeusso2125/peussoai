import { semanticSearch, type SearchResult } from './embeddings';
import { buildPromptWithContext } from './system-prompt';
import { getSourceById, getProductById } from '@/lib/db/queries';

export interface RAGContext {
  systemPrompt: string;
  sources: SearchResult[];
  hasContext: boolean;
}

export async function buildRAGContext(query: string): Promise<RAGContext> {
  const results = await semanticSearch(query, 8, 0.25);

  if (results.length === 0) {
    return {
      systemPrompt: buildPromptWithContext(''),
      sources: [],
      hasContext: false,
    };
  }

  // Build context string with source attribution
  const contextParts: string[] = [];

  for (const result of results) {
    const source = getSourceById(result.sourceId);
    const sourceName = source?.name || 'Fuente desconocida';
    const supplierName = source?.supplier || '';

    let productInfo = '';
    if (result.productId) {
      const product = getProductById(result.productId);
      if (product) {
        productInfo = `\nProducto: ${product.name}${product.brand ? ` | Marca: ${product.brand}` : ''}${product.category ? ` | Categoría: ${product.category}` : ''}`;
      }
    }

    contextParts.push(
      `--- Fuente: ${sourceName}${supplierName ? ` (${supplierName})` : ''} | Relevancia: ${(result.similarity * 100).toFixed(0)}% ---${productInfo}\n${result.content}\n`
    );
  }

  const context = contextParts.join('\n');

  return {
    systemPrompt: buildPromptWithContext(context),
    sources: results,
    hasContext: true,
  };
}
