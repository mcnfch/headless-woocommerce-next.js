'use client';

import { CartProvider } from 'use-shopping-cart';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;

export default function CheckoutSuccessLayout({ children }) {
  return (
    <CartProvider
      mode="payment"
      cartMode="client-only"
      stripe={stripeKey}
      currency="USD"
      allowedCountries={['US']}
      billingAddressCollection={true}
    >
      {children}
    </CartProvider>
  );
}
