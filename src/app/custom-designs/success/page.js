'use server';

import { Suspense } from 'react';
import SuccessContent from './success-content';

export default async function CustomDesignSuccess() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FF6EC7] via-[#6A82FB] to-[#FFD200] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Order Submitted Successfully!</h2>
          </div>
        </div>
      </section>

      {/* Success Message */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Suspense fallback={
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="animate-pulse">
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          }>
            <SuccessContent />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
