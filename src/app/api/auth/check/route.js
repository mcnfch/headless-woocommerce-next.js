import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';

export async function GET(request) {
  console.log('Auth check API called');
  try {
    console.log('Getting iron session...');
    const session = await getIronSession(request.cookies, sessionOptions);
    console.log('Session retrieved:', {
      hasUser: !!session.user,
      sessionKeys: Object.keys(session)
    });
    
    if (!session.user) {
      console.log('No user in session, returning 401');
      return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log('Fetching WooCommerce user data...');
    // Get additional user data from WooCommerce
    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/customers/${session.user.id}`, {
      headers: {
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    console.log('WooCommerce API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch user data:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      // Return existing session user data if WooCommerce fetch fails
      return NextResponse.json({ user: session.user });
    }

    const userData = await response.json();
    console.log('WooCommerce user data:', userData);
    
    // Update user data with WooCommerce fields
    const updatedUser = {
      ...session.user,  // Keep all original login data
      firstName: userData.first_name || session.user.firstName || '',
      lastName: userData.last_name || session.user.lastName || '',
      avatar: userData.avatar_url || session.user.avatar || null,
      billing: userData.billing || {},
      shipping: userData.shipping || {}
    };
    console.log('Updated session user data:', updatedUser);

    session.user = updatedUser;
    await session.save();
    console.log('Session saved successfully');

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Auth check error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
