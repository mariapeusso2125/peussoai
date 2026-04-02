import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db/schema';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const sources = db.prepare('SELECT COUNT(*) as count FROM sources').get() as { count: number };
  const sourcesCompleted = db.prepare("SELECT COUNT(*) as count FROM sources WHERE status = 'completed'").get() as { count: number };
  const products = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  const chunks = db.prepare('SELECT COUNT(*) as count FROM document_chunks').get() as { count: number };
  const chunksWithEmbeddings = db.prepare('SELECT COUNT(*) as count FROM document_chunks WHERE embedding IS NOT NULL').get() as { count: number };
  const suppliers = db.prepare('SELECT COUNT(DISTINCT supplier) as count FROM sources WHERE supplier IS NOT NULL').get() as { count: number };

  return NextResponse.json({
    sources: sources.count,
    sourcesCompleted: sourcesCompleted.count,
    products: products.count,
    chunks: chunks.count,
    chunksWithEmbeddings: chunksWithEmbeddings.count,
    suppliers: suppliers.count,
  });
}
