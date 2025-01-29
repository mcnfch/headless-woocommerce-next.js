'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';

export const CheckoutForm = ({ clientSecret, billingInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !billingInfo) {
      setErrorMessage('Payment system is not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: `${billingInfo.firstName} ${billingInfo.lastName}`,
              address: {
                city: billingInfo.city,
                country: billingInfo.country,
                line1: billingInfo.address1,
                postal_code: billingInfo.postcode,
                state: billingInfo.state
              }
            }
          }
        },
      });

      if (error) {
        let errorMsg = '';
        switch (error.type) {
          case 'card_error':
            errorMsg = error.message || 'Your card was declined.';
            break;
          case 'validation_error':
            errorMsg = 'Please check your payment details and try again.';
            break;
          case 'invalid_request_error':
            errorMsg = 'There was a problem processing your payment. Please try again.';
            console.error('Invalid request:', error);
            break;
          default:
            errorMsg = 'An unexpected error occurred. Please try again.';
            console.error('Payment error:', error);
        }
        setErrorMessage(errorMsg);
        setIsLoading(false);
        return;
      }

      // Create WooCommerce order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          paymentIntentId: paymentIntent.id,
          shipping: billingInfo
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      // Clear cart
      await clearCart();

      // Redirect to success page
      window.location.href = `/checkout/success?payment_intent=${paymentIntent.id}`;
      
    } catch (e) {
      console.error('Payment submission error:', e);
      setErrorMessage('Unable to process payment. Please try again or contact support.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          fields: {
            billingDetails: 'auto'
          }
        }}
      />
      
      {errorMessage && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
          <p className="font-medium">Payment Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full bg-black text-white py-2 px-4 rounded-md ${
          (!stripe || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
        }`}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
