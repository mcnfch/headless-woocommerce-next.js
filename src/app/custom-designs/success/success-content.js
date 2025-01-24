'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <div className="mb-8">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You for Your Custom Design Request!</h2>
        <p className="text-lg text-gray-700 mb-4">
          Your order number is: <span className="font-semibold">#{orderId}</span>
        </p>
        <p className="text-gray-600 mb-6">
          Someone from our design team will contact you within 24 to 48 hours to discuss your design request and next steps.
        </p>
        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-600 mb-2">What happens next?</p>
          <ul className="text-left text-gray-600 space-y-2 mb-8">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              Our design team will review your request
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              We'll contact you to discuss details and pricing
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              Once approved, we'll begin working on your design
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              We'll send you proofs for review and approval
            </li>
          </ul>
        </div>
      </div>
      <div className="space-x-4">
        <Link 
          href="/"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
        >
          Return to Home
        </Link>
        <Link 
          href="/custom-designs"
          className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
        >
          Submit Another Design
        </Link>
      </div>
    </div>
  );
}
