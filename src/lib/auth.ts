import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcryptjs from 'bcryptjs';
import { getUserByEmail } from '@/lib/db/queries';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'iluminar-peusso-secret-key-change-me-in-production-2024');
const COOKIE_NAME = 'iluminar-session';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export async function createSession(email: string, password: string): Promise<SessionUser | null> {
  const user = getUserByEmail(email);
  if (!user) return null;

  const isValid = bcryptjs.compareSync(password, user.password_hash);
  if (!isValid) return null;

  const token = await new SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
