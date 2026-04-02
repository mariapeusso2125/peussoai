import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { SUPPLIERS } from '@/lib/suppliers';
import { getSources } from '@/lib/db/queries';
import { ingestUrl } from '@/lib/ingestion/ingest-pipeline';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const priority = body.priority || 'all'; // 'high', 'medium', 'all'

  const existingSources = getSources();
  const existingUrls = new Set(existingSources.map(s => s.url).filter(Boolean));

  const suppliers = priority === 'high'
    ? SUPPLIERS.filter(s => s.priority === 'high')
    : priority === 'medium'
      ? SUPPLIERS.filter(s => s.priority === 'medium')
      : SUPPLIERS;

  const results: { supplier: string; url: string; status: string; chunks: number; products: number; error?: string }[] = [];

  for (const supplier of suppliers) {
    for (const url of supplier.urls) {
      if (existingUrls.has(url)) {
        results.push({ supplier: supplier.name, url, status: 'skipped', chunks: 0, products: 0 });
        continue;
      }

      try {
        const result = await ingestUrl(url, `${supplier.name} - Catálogo`);
        results.push({
          supplier: supplier.name,
          url,
          status: 'completed',
          chunks: result.chunksCreated,
          products: result.productsCreated,
          error: result.errors.length > 0 ? result.errors[0] : undefined,
        });
      } catch (e) {
        results.push({
          supplier: supplier.name,
          url,
          status: 'error',
          chunks: 0,
          products: 0,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }

  return NextResponse.json({
    total: results.length,
    completed: results.filter(r => r.status === 'completed').length,
    errors: results.filter(r => r.status === 'error').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    results,
  });
}
