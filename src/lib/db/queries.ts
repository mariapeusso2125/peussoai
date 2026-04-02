import { getDb } from './schema';
import { v4 as uuid } from 'uuid';

// ============ SOURCES ============

export interface Source {
  id: string;
  name: string;
  type: string;
  url: string | null;
  file_path: string | null;
  status: string;
  error_message: string | null;
  supplier: string | null;
  chunks_count: number;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export function getSources(): Source[] {
  return getDb().prepare('SELECT * FROM sources ORDER BY created_at DESC').all() as Source[];
}

export function getSourceById(id: string): Source | undefined {
  return getDb().prepare('SELECT * FROM sources WHERE id = ?').get(id) as Source | undefined;
}

export function createSource(data: { name: string; type: string; url?: string; file_path?: string; supplier?: string }): Source {
  const id = uuid();
  getDb().prepare(
    'INSERT INTO sources (id, name, type, url, file_path, supplier) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, data.name, data.type, data.url || null, data.file_path || null, data.supplier || null);
  return getSourceById(id)!;
}

export function updateSourceStatus(id: string, status: string, error_message?: string) {
  getDb().prepare(
    "UPDATE sources SET status = ?, error_message = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, error_message || null, id);
}

export function updateSourceCounts(id: string, chunks_count: number, products_count: number) {
  getDb().prepare(
    "UPDATE sources SET chunks_count = ?, products_count = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(chunks_count, products_count, id);
}

export function deleteSource(id: string) {
  getDb().prepare('DELETE FROM sources WHERE id = ?').run(id);
}

// ============ PRODUCTS ============

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  supplier: string | null;
  category: string | null;
  subcategory: string | null;
  sku: string | null;
  description: string | null;
  technical_specs: string | null;
  image_urls: string | null;
  source_id: string | null;
  created_at: string;
  updated_at: string;
}

export function getProducts(filters?: { brand?: string; category?: string; supplier?: string; search?: string }): Product[] {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params: string[] = [];

  if (filters?.brand) {
    sql += ' AND brand = ?';
    params.push(filters.brand);
  }
  if (filters?.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters?.supplier) {
    sql += ' AND supplier = ?';
    params.push(filters.supplier);
  }
  if (filters?.search) {
    sql += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY name ASC';
  return getDb().prepare(sql).all(...params) as Product[];
}

export function getProductById(id: string): Product | undefined {
  return getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
}

export function createProduct(data: {
  name: string;
  brand?: string;
  supplier?: string;
  category?: string;
  subcategory?: string;
  sku?: string;
  description?: string;
  technical_specs?: string;
  image_urls?: string[];
  source_id?: string;
}): Product {
  const id = uuid();
  getDb().prepare(
    'INSERT INTO products (id, name, brand, supplier, category, subcategory, sku, description, technical_specs, image_urls, source_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id, data.name, data.brand || null, data.supplier || null, data.category || null,
    data.subcategory || null, data.sku || null, data.description || null,
    data.technical_specs || null, data.image_urls ? JSON.stringify(data.image_urls) : null,
    data.source_id || null
  );
  return getProductById(id)!;
}

export function getProductFilters() {
  const db = getDb();
  const brands = db.prepare("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand").all() as { brand: string }[];
  const categories = db.prepare("SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category").all() as { category: string }[];
  const suppliers = db.prepare("SELECT DISTINCT supplier FROM products WHERE supplier IS NOT NULL ORDER BY supplier").all() as { supplier: string }[];
  return {
    brands: brands.map(b => b.brand),
    categories: categories.map(c => c.category),
    suppliers: suppliers.map(s => s.supplier),
  };
}

// ============ DOCUMENT CHUNKS ============

export interface DocumentChunk {
  id: string;
  content: string;
  embedding: string | null;
  source_id: string;
  product_id: string | null;
  chunk_index: number;
  metadata: string | null;
  created_at: string;
}

export function createChunk(data: {
  content: string;
  embedding?: number[];
  source_id: string;
  product_id?: string;
  chunk_index?: number;
  metadata?: Record<string, unknown>;
}): string {
  const id = uuid();
  getDb().prepare(
    'INSERT INTO document_chunks (id, content, embedding, source_id, product_id, chunk_index, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id, data.content, data.embedding ? JSON.stringify(data.embedding) : null,
    data.source_id, data.product_id || null, data.chunk_index || 0,
    data.metadata ? JSON.stringify(data.metadata) : null
  );
  return id;
}

export function getChunksBySource(sourceId: string): DocumentChunk[] {
  return getDb().prepare('SELECT * FROM document_chunks WHERE source_id = ? ORDER BY chunk_index').all(sourceId) as DocumentChunk[];
}

export function getAllChunksWithEmbeddings(): DocumentChunk[] {
  return getDb().prepare('SELECT * FROM document_chunks WHERE embedding IS NOT NULL').all() as DocumentChunk[];
}

// ============ CHAT ============

export function createChatSession(userId: string, title?: string): string {
  const id = uuid();
  getDb().prepare(
    'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)'
  ).run(id, userId, title || 'Nueva consulta');
  return id;
}

export function getChatSessions(userId: string) {
  return getDb().prepare(
    'SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(userId);
}

export function addChatMessage(sessionId: string, role: string, content: string, sourcesUsed?: string[]) {
  const id = uuid();
  getDb().prepare(
    'INSERT INTO chat_messages (id, session_id, role, content, sources_used) VALUES (?, ?, ?, ?, ?)'
  ).run(id, sessionId, role, content, sourcesUsed ? JSON.stringify(sourcesUsed) : null);
  getDb().prepare("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?").run(sessionId);
  return id;
}

export function getChatMessages(sessionId: string) {
  return getDb().prepare(
    'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(sessionId);
}

// ============ USERS ============

export function getUserByEmail(email: string) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as {
    id: string; email: string; name: string; password_hash: string; role: string;
  } | undefined;
}
