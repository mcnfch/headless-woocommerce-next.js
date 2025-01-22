import { NextResponse } from 'next/server';

// We need to verify the session manually in middleware since iron-session doesn't work in edge runtime
export async function middleware(request) {
  // Protect /account routes
  if (request.nextUrl.pathname.startsWith('/account')) {
    const cookie = request.cookies.get('auth_session');
    
    if (!cookie?.value) {
      const response = NextResponse.redirect(new URL('/', request.url));
      // Clear any invalid session cookies
      response.cookies.delete('auth_session');
      return response;
    }

    // Cookie exists, allow access and let the API handle actual session validation
    return NextResponse.next({
      headers: {
        'x-middleware-cache': 'no-cache'
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*']
}
