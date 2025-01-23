// Next.js automatically loads environment variables
const sessionPassword = process.env.SESSION_PASSWORD;

if (!sessionPassword) {
  console.error('Session password is missing!');
  throw new Error('SESSION_PASSWORD environment variable must be set');
}

export const cookieName = 'auth_session';

export const sessionOptions = {
  password: sessionPassword,
  cookieName,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  }
};
