'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';

export default function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address_1: '',
    city: '',
    state: '',
    postcode: '',
    country: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Cart state:', cart);
      
      // Check cart has items
      if (!cart?.items || cart.items.length === 0) {
        throw new Error('Cart is empty. Please add items before checking out.');
      }

      // Confirm payment with Stripe
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              address: {
                line1: shippingAddress.address_1,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.postcode,
                country: shippingAddress.country,
              }
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Create WooCommerce order
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shipping: shippingAddress,
            items: cart.items,
            paymentIntentId: paymentIntent.id
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create order');
        }

        // Clear cart and redirect to success page
        await clearCart();
        window.location.href = '/checkout/success';
      }
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-black">Shipping Address</h3>
        <div>
          <label htmlFor="address_1" className="block text-sm font-medium text-black">
            Street Address
          </label>
          <input
            type="text"
            id="address_1"
            name="address_1"
            value={shippingAddress.address_1}
            onChange={handleAddressChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-black shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-black">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={shippingAddress.city}
            onChange={handleAddressChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-black shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-black">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={shippingAddress.state}
            onChange={handleAddressChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-black shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-black">
            ZIP / Postal Code
          </label>
          <input
            type="text"
            id="postcode"
            name="postcode"
            value={shippingAddress.postcode}
            onChange={handleAddressChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-black shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-black">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={shippingAddress.country}
            onChange={handleAddressChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-black shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
      </div>

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
