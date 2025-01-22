'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import CheckoutForm from '@/components/checkout/CheckoutForm';

// Initialize Stripe with test key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST);

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { cart, loading, getStripeTotalAmount } = useCart();
  const [clientSecret, setClientSecret] = useState("");

  // Create payment intent when cart changes
  useEffect(() => {
    // Wait for cart to load
    if (loading) {
      return;
    }

    // Only redirect if cart is definitely empty
    if (!loading && (!cart?.items || cart.items.length === 0)) {
      console.log('Redirecting to cart - empty cart detected');
      router.push('/cart');
      return;
    }

    const createIntent = async () => {
      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            items: cart.items,
            amount: getStripeTotalAmount()
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        alert('Failed to initialize payment. Please try again.');
        router.push('/cart');
      }
    };

    createIntent();
  }, [cart, loading, router, getStripeTotalAmount]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#000000',
    },
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;
  }

  if (!clientSecret || !cart?.items) {
    return <div className="min-h-screen flex items-center justify-center">Preparing checkout...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Order Summary</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            {cart.items.map((item) => (
              <div key={item.key} className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-black">{item.name}</h3>
                  <p className="text-sm text-black">Quantity: {item.quantity}</p>
                </div>
                <p className="text-black">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between">
                <span className="font-bold text-black">Total</span>
                <span className="font-bold text-black">
                  ${cart.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
