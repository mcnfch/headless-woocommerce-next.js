'use client';

import { CartProvider } from '@/hooks/useCart';

export default function CartLayout({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
