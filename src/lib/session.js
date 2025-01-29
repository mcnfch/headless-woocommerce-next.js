import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'auth_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  }
};

export async function getSession() {
  const session = await getIronSession(cookies(), sessionOptions);
  return session.user || null;
}

export async function setSession(userData) {
  const session = await getIronSession(cookies(), sessionOptions);
  session.user = userData;
  await session.save();
}

export async function clearSession() {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
}
