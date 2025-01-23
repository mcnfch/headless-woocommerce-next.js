import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';
import { parsePrice, formatWooCommercePrice, isValidPrice } from '@/utils/price';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

export async function POST(request) {
  try {
    const session = await getIronSession(request.cookies, sessionOptions);
    const { shipping, items, paymentIntentId } = await request.json();

    // Verify payment intent first
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      throw new Error('Invalid or incomplete payment');
    }

    console.log('Received request data:', {
      shipping,
      items,
      paymentIntentId,
      sessionUser: session.user
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('No items provided in order');
    }

    // Format line items with prices
    const lineItems = items.map(item => {
      console.log('Processing item:', item);

      // Validate price
      if (!isValidPrice(item.price)) {
        throw new Error(`Invalid price format for item ${item.id}`);
      }

      const price = parsePrice(item.price);
      const quantity = parseInt(item.quantity) || 1;
      const total = price * quantity;

      console.log(`Processed item ${item.id}:`, {
        price,
        quantity,
        total
      });

      return {
        product_id: item.id,
        quantity: quantity,
        subtotal: formatWooCommercePrice(total),
        total: formatWooCommercePrice(total),
        price: formatWooCommercePrice(price)
      };
    });

    // Calculate order total
    const orderTotal = lineItems.reduce((sum, item) => 
      sum + parsePrice(item.total), 0
    );

    // Verify the order total matches the payment intent amount
    const stripeAmount = paymentIntent.amount;
    const stripeTotal = stripeAmount / 100; // Convert from cents
    
    // Get any discount from payment intent metadata
    const couponCode = paymentIntent.metadata.couponCode;
    const displayAmount = parseFloat(paymentIntent.metadata.displayAmount);

    // Verify amounts match
    if (Math.abs(displayAmount - stripeTotal) > 0.01) { // Allow for small rounding differences
      throw new Error(`Payment amount mismatch. Expected: ${displayAmount}, Got: ${stripeTotal}`);
    }

    console.log('Amount verification passed:', {
      orderTotal: orderTotal,
      stripeAmount: stripeAmount,
      stripeTotal: stripeTotal,
      displayAmount: displayAmount
    });

    const orderData = {
      status: 'processing',
      payment_method: 'stripe',
      payment_method_title: 'Credit Card (Stripe)',
      set_paid: true,
      customer_id: session.user?.id || 0,
      shipping: {
        first_name: session.user?.first_name || '',
        last_name: session.user?.last_name || '',
        address_1: shipping.address_1,
        city: shipping.city,
        state: shipping.state,
        postcode: shipping.postcode,
        country: shipping.country
      },
      line_items: lineItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        subtotal: item.subtotal,
        total: item.total,
        price: item.price
      })),
      total: formatWooCommercePrice(stripeTotal), // Use the verified Stripe amount
      meta_data: [
        {
          key: 'stripe_payment_intent_id',
          value: paymentIntentId
        },
        {
          key: 'coupon_code',
          value: couponCode
        }
      ]
    };

    console.log('Sending order to WooCommerce:', JSON.stringify(orderData, null, 2));

    // Create order in WooCommerce
    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify(orderData)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('WooCommerce API error:', responseText);
      throw new Error('Failed to create order in WooCommerce');
    }

    const order = JSON.parse(responseText);
    return NextResponse.json({ orderId: order.id });

  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
