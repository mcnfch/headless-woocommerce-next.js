import { NextResponse } from 'next/server';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const ADMIN_JWT_TOKEN = process.env.PRIVATE_WP_JWT_TOKEN;

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const response = await fetch(`${WC_URL}/wp-json/wc/v3/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_JWT_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer data');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { message: 'Failed to fetch customer data' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const response = await fetch(`${WC_URL}/wp-json/wc/v3/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_JWT_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to update customer data');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { message: 'Failed to update customer data' },
      { status: 500 }
    );
  }
}
