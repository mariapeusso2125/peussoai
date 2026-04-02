import { scrapeUrl, chunkText } from './url-scraper';
import { generateEmbeddings } from '@/lib/ai/embeddings';
import { createSource, createProduct, createChunk, updateSourceStatus, updateSourceCounts } from '@/lib/db/queries';
import { getSupplierByDomain } from '@/lib/suppliers';

const KNOWN_SUPPLIERS: Record<string, string> = {
  'macroled.com.ar': 'Macroled',
  'lucciola.com.ar': 'Lucciola',
  'ideailuminacion.com.ar': 'IDEA Iluminación',
  'artelum.com.ar': 'Artelum',
  'bael.com.ar': 'Bael',
  'vonderk.com': 'Vonder K',
  'candil.com.ar': 'Candil',
  'puntoiluminacion.com.ar': 'Punto Iluminación',
  'wlgled.com': 'World LEDs Go',
  'gmge.com.ar': 'GMGE',
  'leukiluminacion.com': 'Leuk',
  'oblumo.com': 'Oblumo',
  'minimo.com.ar': 'Mínimo',
  'iluminacionronda.com.ar': 'Ronda',
  'arailuminacion.com.ar': 'Ara Iluminación',
  'markasiluminacion.com': 'Markas',
  'imdi.com.ar': 'IMDI',
  'plugiluminacion.com.ar': 'Plug Iluminación',
  'gsgdesign.com.ar': 'GSG Design',
  'premieriluminacion.com.ar': 'Premier',
  'girasolesiluminacion.com.ar': 'Girasoles',
  'kinglight.com.ar': 'Kinglight',
  'mendizabal.com.ar': 'Mendizábal',
  '180grados.com.ar': '180 Grados',
  'baluiluminacion.com.ar': 'Balu',
  'birot.com': 'Birot',
  'nikeliluminacion.com.ar': 'Nikeli',
  'fwiluminacionsrl.com.ar': 'FW Iluminación',
  'spotsline.com.ar': 'Spotsline',
};

function detectSupplier(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return KNOWN_SUPPLIERS[hostname];
  } catch {
    return undefined;
  }
}

function inferCategory(text: string): string | undefined {
  const lower = text.toLowerCase();
  const categories: Record<string, string[]> = {
    'Apliques': ['aplique', 'apliques', 'wall sconce', 'sconce'],
    'Plafones': ['plafon', 'plafón', 'plafones', 'ceiling'],
    'Colgantes': ['colgante', 'colgantes', 'pendant', 'suspendido'],
    'Empotrables': ['empotrable', 'empotrables', 'downlight', 'embutir', 'embutido'],
    'Proyectores': ['proyector', 'proyectores', 'reflector', 'reflectores', 'floodlight'],
    'Tiras LED': ['tira led', 'tiras led', 'strip', 'cinta led'],
    'Paneles LED': ['panel led', 'paneles led'],
    'Lámparas': ['lampara', 'lámpara', 'lamparas', 'lámparas', 'bulbo', 'foco'],
    'Exterior': ['exterior', 'outdoor', 'estaca', 'farola', 'balizas'],
    'Interior': ['interior', 'indoor'],
    'Perfilería': ['perfil', 'perfilería', 'perfileria', 'aluminio'],
    'Riel': ['riel', 'track', 'rieles'],
    'De pie': ['de pie', 'floor lamp', 'pie'],
    'De mesa': ['de mesa', 'table lamp', 'mesa', 'velador'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return undefined;
}

export interface IngestResult {
  sourceId: string;
  chunksCreated: number;
  productsCreated: number;
  errors: string[];
}

export async function ingestUrl(url: string, customName?: string): Promise<IngestResult> {
  const supplier = detectSupplier(url);
  const source = createSource({
    name: customName || `Página de ${supplier || new URL(url).hostname}`,
    type: 'url',
    url,
    supplier,
  });

  updateSourceStatus(source.id, 'processing');

  const result: IngestResult = {
    sourceId: source.id,
    chunksCreated: 0,
    productsCreated: 0,
    errors: [],
  };

  try {
    const page = await scrapeUrl(url);

    // Create products from scraped data
    for (const scrapedProduct of page.products) {
      try {
        createProduct({
          name: scrapedProduct.name,
          brand: supplier,
          supplier,
          category: inferCategory(scrapedProduct.name + ' ' + (scrapedProduct.description || '')),
          sku: scrapedProduct.sku,
          description: scrapedProduct.description,
          image_urls: scrapedProduct.imageUrls,
          source_id: source.id,
        });
        result.productsCreated++;
      } catch (e) {
        result.errors.push(`Error creating product ${scrapedProduct.name}: ${e}`);
      }
    }

    // Chunk the page content
    const chunks = chunkText(page.textContent);

    // Generate embeddings in batches
    const batchSize = 20;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      try {
        const embeddings = await generateEmbeddings(batch);

        for (let j = 0; j < batch.length; j++) {
          createChunk({
            content: batch[j],
            embedding: embeddings[j],
            source_id: source.id,
            chunk_index: i + j,
            metadata: {
              url: page.url,
              title: page.title,
              supplier,
            },
          });
          result.chunksCreated++;
        }
      } catch (e) {
        result.errors.push(`Error generating embeddings for batch ${i}: ${e}`);
        // Still save chunks without embeddings
        for (let j = 0; j < batch.length; j++) {
          createChunk({
            content: batch[j],
            source_id: source.id,
            chunk_index: i + j,
            metadata: { url: page.url, title: page.title, supplier },
          });
          result.chunksCreated++;
        }
      }
    }

    updateSourceCounts(source.id, result.chunksCreated, result.productsCreated);
    updateSourceStatus(source.id, 'completed');
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    updateSourceStatus(source.id, 'error', errorMsg);
    result.errors.push(errorMsg);
  }

  return result;
}

export async function ingestText(text: string, name: string, supplier?: string): Promise<IngestResult> {
  const source = createSource({
    name,
    type: 'manual',
    supplier,
  });

  updateSourceStatus(source.id, 'processing');

  const result: IngestResult = {
    sourceId: source.id,
    chunksCreated: 0,
    productsCreated: 0,
    errors: [],
  };

  try {
    const chunks = chunkText(text);
    const batchSize = 20;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await generateEmbeddings(batch);

      for (let j = 0; j < batch.length; j++) {
        createChunk({
          content: batch[j],
          embedding: embeddings[j],
          source_id: source.id,
          chunk_index: i + j,
          metadata: { name, supplier },
        });
        result.chunksCreated++;
      }
    }

    updateSourceCounts(source.id, result.chunksCreated, 0);
    updateSourceStatus(source.id, 'completed');
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    updateSourceStatus(source.id, 'error', errorMsg);
    result.errors.push(errorMsg);
  }

  return result;
}
