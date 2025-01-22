import { NextResponse } from 'next/server';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const ADMIN_JWT_TOKEN = process.env.PRIVATE_WP_JWT_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Search for customer by email
    const response = await fetch(
      `${WC_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_JWT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search customers');
    }

    const customers = await response.json();
    
    // Return the first matching customer or empty object if none found
    return NextResponse.json(customers[0] || {});

  } catch (error) {
    console.error('Error searching customer:', error);
    return NextResponse.json(
      { message: 'Failed to search customer' },
      { status: 500 }
    );
  }
}
