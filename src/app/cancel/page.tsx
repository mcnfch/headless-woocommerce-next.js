'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Order Cancelled
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Your order has been cancelled. No charges have been made to your card.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-sky-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
