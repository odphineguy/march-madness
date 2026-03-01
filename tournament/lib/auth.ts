import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tonys-madness-2026-secret-change-me'
);

export interface SessionUser {
  id: string;
  displayName: string;
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ id: user.id, displayName: user.displayName })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      displayName: payload.displayName as string,
    };
  } catch {
    return null;
  }
}
