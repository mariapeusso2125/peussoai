import { NextResponse } from 'next/server';
import { getSources, deleteSource } from '@/lib/db/queries';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sources = getSources();
  return NextResponse.json(sources);
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  deleteSource(id);
  return NextResponse.json({ success: true });
}
