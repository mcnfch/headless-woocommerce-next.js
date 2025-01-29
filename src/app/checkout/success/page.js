'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-4">
              Invalid Order
            </h1>
            <p className="text-lg text-red-600 mb-8">
              No payment information found
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">
            Thank you for your order!
          </h1>
          <p className="text-lg text-gray-900 mb-8">
            Your payment was successful and your order is being processed.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
