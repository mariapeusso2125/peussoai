import Database from 'better-sqlite3';
import path from 'path';
import bcryptjs from 'bcryptjs';

const DB_PATH = process.env.DATABASE_PATH || './data/iluminar.db';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(path.resolve(DB_PATH));
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initializeDb(_db);
  }
  return _db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'seller',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('pdf', 'csv', 'xlsx', 'url', 'image', 'manual')),
      url TEXT,
      file_path TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'error')),
      error_message TEXT,
      supplier TEXT,
      chunks_count INTEGER DEFAULT 0,
      products_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      supplier TEXT,
      category TEXT,
      subcategory TEXT,
      sku TEXT,
      description TEXT,
      technical_specs TEXT,
      image_urls TEXT,
      source_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      embedding TEXT,
      source_id TEXT NOT NULL,
      product_id TEXT,
      chunk_index INTEGER DEFAULT 0,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      sources_used TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
    CREATE INDEX IF NOT EXISTS idx_chunks_source ON document_chunks(source_id);
    CREATE INDEX IF NOT EXISTS idx_chunks_product ON document_chunks(product_id);
    CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_id);
  `);

  // Seed default admin user if none exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const hash = bcryptjs.hashSync('iluminar2024', 10);
    db.prepare(
      'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run('admin-001', 'admin@iluminarpeusso.com', 'Administrador', hash, 'admin');
  }
}
