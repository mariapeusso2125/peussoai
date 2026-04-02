import { NextResponse } from 'next/server';
import { ingestUrl, ingestText } from '@/lib/ingestion/ingest-pipeline';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  if (body.type === 'url') {
    const { url, name } = body;
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      const result = await ingestUrl(url, name);
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Error processing URL' },
        { status: 500 }
      );
    }
  }

  if (body.type === 'text') {
    const { text, name, supplier } = body;
    if (!text || !name) {
      return NextResponse.json({ error: 'Text and name are required' }, { status: 400 });
    }

    try {
      const result = await ingestText(text, name, supplier);
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Error processing text' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Invalid type. Use "url" or "text"' }, { status: 400 });
}
