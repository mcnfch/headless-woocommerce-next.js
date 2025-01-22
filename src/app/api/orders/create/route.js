import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';
import { parsePrice, formatWooCommercePrice, isValidPrice } from '@/utils/price';

export async function POST(request) {
  try {
    const session = await getIronSession(request.cookies, sessionOptions);
    const { shipping, items, paymentIntentId } = await request.json();

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

    console.log('Order total calculated:', orderTotal);
    console.log('Line items:', lineItems);

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
      total: formatWooCommercePrice(orderTotal),
      meta_data: [
        {
          key: 'stripe_payment_intent_id',
          value: paymentIntentId
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
    console.log('WooCommerce response:', responseText);

    if (!response.ok) {
      console.error('Failed to create WooCommerce order:', responseText);
      throw new Error('Failed to create order');
    }

    const order = JSON.parse(responseText);
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
