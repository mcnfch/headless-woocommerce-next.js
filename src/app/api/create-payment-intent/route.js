import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, cartId, couponCode } = await request.json();

    // Verify amount is valid
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create or retrieve PaymentIntent
    let paymentIntent;
    
    try {
      // Try to retrieve an existing PaymentIntent for this cart
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 1,
        metadata: { cartId: cartId }
      });
      
      if (paymentIntents.data.length > 0) {
        // Update existing PaymentIntent if amount changed
        paymentIntent = await stripe.paymentIntents.update(paymentIntents.data[0].id, {
          amount: amount,
          metadata: { 
            cartId: cartId,
            displayAmount: (amount / 100).toFixed(2),
            couponCode: couponCode || 'none'
          }
        });
      } else {
        // Create new PaymentIntent with idempotency key
        paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          metadata: { 
            cartId: cartId,
            displayAmount: (amount / 100).toFixed(2),
            couponCode: couponCode || 'none'
          },
          automatic_payment_methods: {
            enabled: true,
          }
        }, {
          idempotencyKey: cartId,
        });
      }

      return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        displayAmount: (amount / 100).toFixed(2)
      });
    } catch (e) {
      console.error('Error with PaymentIntent:', e);
      return NextResponse.json(
        { error: 'Error processing payment intent' },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error('Error parsing request:', e);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
