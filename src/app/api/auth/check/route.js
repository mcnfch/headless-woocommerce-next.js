import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session-config';

export async function GET(request) {
  try {
    const session = await getIronSession(request.cookies, sessionOptions);

    if (!session.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/customers/${session.user.id}`, {
      headers: {
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ user: session.user });
    }

    const userData = await response.json();

    const updatedUser = {
      ...session.user,  
      firstName: userData.first_name || session.user.firstName || '',
      lastName: userData.last_name || session.user.lastName || '',
      avatar: userData.avatar_url || session.user.avatar || null,
      billing: userData.billing || {},
      shipping: userData.shipping || {}
    };

    session.user = updatedUser;
    await session.save();

    return NextResponse.json({ user: session.user });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
