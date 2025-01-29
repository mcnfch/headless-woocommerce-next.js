import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';

const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const WC_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
const WC_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;

export async function GET(request) {
  try {
    const session = await getIronSession(request.cookies, sessionOptions);

    if (!session.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Create base64 encoded auth string
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

    const response = await fetch(`${WC_URL}/wp-json/wc/v3/customers/${session.user.id}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    // Get all orders and filter by user's email
    const ordersResponse = await fetch(`${WC_URL}/wp-json/wc/v3/orders`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ user: session.user });
    }

    const userData = await response.json();
    const allOrders = ordersResponse.ok ? await ordersResponse.json() : [];
    
    // Filter orders by user's email
    const userOrders = allOrders.filter(order => 
      order.billing.email === session.user.email || 
      (order.customer_id && order.customer_id === session.user.id)
    );

    const updatedUser = {
      ...session.user,  
      firstName: userData.first_name || session.user.firstName || '',
      lastName: userData.last_name || session.user.lastName || '',
      billing: userData.billing || {},
      shipping: userData.shipping || {},
      orders: userOrders
    };

    session.user = updatedUser;
    await session.save();

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error in check route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
