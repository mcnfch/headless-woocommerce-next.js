import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

export async function POST(request) {
  try {
    const { amount, cartId, couponCode, shipping } = await request.json();

    if (!amount || amount < 50) { // Stripe minimum amount is 50 cents
      throw new Error('Order total must be at least $0.50');
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        cartId,
        couponCode,
        shipping: JSON.stringify(shipping)
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
