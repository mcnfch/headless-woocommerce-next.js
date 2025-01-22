'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('wp_token')?.value;

  if (!token) {
    redirect('/');
  }

  const WC_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
  
  try {
    // Validate token
    const validationResponse = await fetch(`${WC_URL}/wp-json/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!validationResponse.ok) {
      redirect('/');
    }

    // Get user data
    const userResponse = await fetch(`${WC_URL}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      redirect('/');
    }

    return userResponse.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    redirect('/');
  }
}
