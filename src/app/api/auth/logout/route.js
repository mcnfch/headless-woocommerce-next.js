import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, cookieName } from '@/lib/session-config';

export async function POST(request) {
  try {
    const session = await getIronSession(request.cookies, sessionOptions);
    await session.destroy();
    
    // Create response with success message
    const response = NextResponse.json({ success: true });
    
    // Clear the session cookie
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // Set cookie to expire immediately
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
