import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';

export async function PUT(request) {
  try {
    const session = await getIronSession(request.cookies, sessionOptions);
    
    if (!session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { billing, shipping, useShippingAsBilling } = await request.json();

    // Update user data in WordPress
    const wpResponse = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/users/${session.user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`
      },
      body: JSON.stringify({
        meta: {
          billing_address_1: billing.address_1,
          billing_city: billing.city,
          billing_state: billing.state,
          billing_postcode: billing.postcode,
          billing_country: billing.country,
          shipping_address_1: useShippingAsBilling ? billing.address_1 : shipping.address_1,
          shipping_city: useShippingAsBilling ? billing.city : shipping.city,
          shipping_state: useShippingAsBilling ? billing.state : shipping.state,
          shipping_postcode: useShippingAsBilling ? billing.postcode : shipping.postcode,
          shipping_country: useShippingAsBilling ? billing.country : shipping.country,
          use_shipping_as_billing: useShippingAsBilling
        }
      })
    });

    if (!wpResponse.ok) {
      const error = await wpResponse.text();
      console.error('Failed to update user meta:', error);
      return NextResponse.json({ error: 'Failed to update addresses' }, { status: wpResponse.status });
    }

    // Now fetch the updated user data from WooCommerce to get the formatted data
    const wooResponse = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/customers/${session.user.id}`, {
      headers: {
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    if (!wooResponse.ok) {
      console.error('Failed to fetch updated user data');
      // Even if this fails, we'll return the data we have
      return NextResponse.json({ 
        success: true,
        user: {
          ...session.user,
          billing,
          shipping: useShippingAsBilling ? billing : shipping,
          useShippingAsBilling
        }
      });
    }

    const wooData = await wooResponse.json();
    
    // Update session with new address data
    const updatedUser = {
      ...session.user,
      billing: wooData.billing,
      shipping: wooData.shipping,
      useShippingAsBilling
    };
    
    session.user = updatedUser;
    await session.save();

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
