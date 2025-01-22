import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('wp_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(`${WC_URL}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('wp_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${WC_URL}/wp-json/wp/v2/users/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to update user data');
    }

    const userData = await response.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { message: 'Failed to update user data' },
      { status: 500 }
    );
  }
}
