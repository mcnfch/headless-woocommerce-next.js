import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const WC_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
const WC_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    console.log('Login attempt for:', username);

    // First authenticate with WordPress
    const loginResponse = await fetch(`${WC_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok || !loginData.token) {
      console.error('WordPress login failed:', loginData);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Now get the user's WooCommerce customer data
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
    const customerResponse = await fetch(`${WC_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(loginData.user_email)}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    const customers = await customerResponse.json();
    let customer = customers.length > 0 ? customers[0] : null;

    // If no customer record exists, create one
    if (!customer) {
      const createCustomerResponse = await fetch(`${WC_URL}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginData.user_email,
          first_name: loginData.user_nicename,
          username: loginData.user_nicename
        })
      });

      if (!createCustomerResponse.ok) {
        console.error('Failed to create customer:', await createCustomerResponse.text());
      } else {
        customer = await createCustomerResponse.json();
      }
    }

    // Create session with user data
    const session = await getIronSession(request.cookies, sessionOptions);
    await session.destroy();
    
    session.user = {
      id: customer?.id || loginData.user_id,
      username: loginData.user_nicename,
      email: loginData.user_email,
      firstName: customer?.first_name || '',
      lastName: customer?.last_name || '',
      displayName: loginData.user_display_name,
      roles: loginData.user_roles || ['customer'],
      token: loginData.token,
      billing: customer?.billing || {},
      shipping: customer?.shipping || {}
    };
    
    await session.save();

    // Create response with session cookie
    const response = NextResponse.json({ 
      user: session.user
    });

    // Copy session cookie to response
    const sessionCookie = request.cookies.get(sessionOptions.cookieName);
    if (sessionCookie) {
      response.cookies.set(sessionOptions.cookieName, sessionCookie.value, sessionOptions.cookieOptions);
    }

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
