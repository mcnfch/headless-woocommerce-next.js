'use client';

import { CartProvider } from '@/hooks/useCart';

export default function CheckoutLayout({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
