'use strict';

import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import Stripe from 'stripe';
import { api as WooCommerceAPI } from '@/lib/woocommerce';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    const { shipping, items, paymentIntentId } = await request.json();

    // Verify payment intent first
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Invalid payment intent' }, { status: 400 });
    }

    // Get the actual paid amount from Stripe
    const paidAmount = paymentIntent.amount / 100;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const pricePerItem = paidAmount / itemCount;

    // Create order in WooCommerce using the REST API client
    const orderData = {
      status: 'processing',
      payment_method: 'stripe',
      payment_method_title: 'Credit Card (Stripe)',
      set_paid: true,
      customer_id: session.user?.id || 0,
      billing: {
        first_name: shipping.firstName || '',
        last_name: shipping.lastName || '',
        email: shipping.email || '',
        address_1: shipping.address1 || '',
        city: shipping.city || '',
        state: shipping.state || '',
        postcode: shipping.postcode || '',
        country: shipping.country || 'US'
      },
      shipping: {
        first_name: shipping.firstName || '',
        last_name: shipping.lastName || '',
        address_1: shipping.address1 || '',
        city: shipping.city || '',
        state: shipping.state || '',
        postcode: shipping.postcode || '',
        country: shipping.country || 'US'
      },
      line_items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        total: (pricePerItem * item.quantity).toFixed(2)
      })),
      meta_data: [
        {
          key: '_stripe_payment_intent',
          value: paymentIntentId
        },
        {
          key: '_stripe_coupon',
          value: paymentIntent.metadata?.couponCode || 'none'
        }
      ]
    };

    const { data: order } = await WooCommerceAPI.post('orders', orderData);
    
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
