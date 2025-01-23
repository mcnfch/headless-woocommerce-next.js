import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const ADMIN_JWT_TOKEN = process.env.PRIVATE_WP_JWT_TOKEN;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Get user by username
    const userSearchResponse = await fetch(`${WC_URL}/wp-json/wp/v2/users?search=${username}&context=edit`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_JWT_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    const users = await userSearchResponse.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = users[0];

    // Create session with user data
    const session = await getIronSession(request.cookies, sessionOptions);
    
    // Clear any existing session data
    await session.destroy();
    
    // Set new session data
    session.user = {
      id: user.id,
      username: user.slug,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      displayName: user.name,
      roles: user.roles || ['customer'],
      token: ADMIN_JWT_TOKEN,
      avatar: user.avatar_urls?.['96'] || null,
      billing: user.billing || {},
      shipping: user.shipping || {}
    };
    
    // Save session
    await session.save();

    // Create response with session cookie
    const response = NextResponse.json({ 
      success: true,
      user: session.user
    });

    // Copy session cookie to response
    const sessionCookie = request.cookies.get(sessionOptions.cookieName);
    if (sessionCookie) {
      response.cookies.set(sessionOptions.cookieName, sessionCookie.value, sessionOptions.cookieOptions);
    }

    return response;
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Login failed',
      details: error.message
    }, { status: 500 });
  }
}
