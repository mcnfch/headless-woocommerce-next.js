import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

export async function POST(request) {
  try {
    const { items } = await request.json();

    // Calculate total amount from items (convert to cents for Stripe)
    const amount = Math.round(items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0) * 100); // Convert to cents

    if (amount < 50) { // Stripe minimum amount is 50 cents
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
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })))
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { 
      status: error.message.includes('must be at least') ? 400 : 500 
    });
  }
}
