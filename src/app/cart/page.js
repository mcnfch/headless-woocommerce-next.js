'use client';

import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/cart/CartItem';
import Link from 'next/link';

export default function CartPage() {
  const { cart, cartCount, loading } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-black mb-8">Shopping Cart</h1>

      {loading ? (
        <div className="text-black">Loading cart...</div>
      ) : cartCount === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-black mb-4">Your cart is empty</h2>
          <p className="text-black mb-8">Add some items to your cart to continue shopping.</p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ul className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <li key={item.key} className="py-6">
                  <CartItem item={item} />
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-8">
              <h2 className="text-lg font-medium text-black mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-black">
                  <span>Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-medium text-black pt-4 border-t">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 w-full inline-block bg-black text-white text-center px-6 py-3 rounded-md hover:bg-gray-800"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
