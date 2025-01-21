'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

function DebugPanel() {
  const { cart, loading } = useCart();
  const [debugInfo, setDebugInfo] = useState({
    cart: {},
    totalPrice: '0.00',
    cartCount: 0,
    isCartOpen: false,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (!loading) {
      // Ensure all data is serializable and format prices
      const serializableCartItems = (cart.items || []).reduce((acc, item) => {
        acc[item.key] = {
          id: item.id,
          name: item.name,
          price: item.price.toFixed(2),
          quantity: item.quantity,
          variation: item.variation || {},
          images: item.images || []
        };
        return acc;
      }, {});

      setDebugInfo({
        cart: serializableCartItems,
        totalPrice: cart.total.toFixed(2),
        cartCount: cart.items.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [cart, loading]);

  if (loading) {
    return <div className="p-8">Loading cart data...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cart Debug Panel</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Current Cart State</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[400px] text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}

export default function CartDebugPage() {
  return (
    <div>
      <DebugPanel />
    </div>
  );
}
