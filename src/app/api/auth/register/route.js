import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const ADMIN_JWT_TOKEN = process.env.PRIVATE_WP_JWT_TOKEN;

export async function POST(request) {
  try {
    const { email, username, password, firstName, lastName } = await request.json();

    // Generate username from email if not provided
    const finalUsername = username || email.split('@')[0];

    // Create WooCommerce customer (this also creates WordPress user)
    const wcResponse = await fetch(`${WC_URL}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_JWT_TOKEN}`
      },
      body: JSON.stringify({
        email,
        username: finalUsername,
        password,
        first_name: firstName,
        last_name: lastName,
        billing: {
          first_name: firstName,
          last_name: lastName,
          email: email
        },
        shipping: {
          first_name: firstName,
          last_name: lastName
        }
      })
    });

    const wcData = await wcResponse.json();

    if (!wcResponse.ok) {
      return NextResponse.json(
        { message: wcData.message || 'Failed to create account' },
        { status: wcResponse.status }
      );
    }

    // Get JWT token for the new user
    const tokenResponse = await fetch(`${WC_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: email,
        password
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { message: tokenData.message || 'Failed to authenticate' },
        { status: tokenResponse.status }
      );
    }

    // Set JWT token in an HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('wp_token', tokenData.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Return success with user data
    return NextResponse.json({
      user: {
        id: wcData.id,
        username: wcData.username,
        email: wcData.email,
        firstName: wcData.first_name,
        lastName: wcData.last_name,
        roles: ['customer']
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
