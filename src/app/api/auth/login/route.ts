import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
  }

  const user = await createSession(email, password);

  if (!user) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
