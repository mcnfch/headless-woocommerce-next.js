'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to subscribe. Please try again.');
        return;
      }
      
      setShowModal(true);
      e.target.reset();
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('Error subscribing to newsletter. Please try again later.');
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="text-xl mb-2">
          Subscribe to get updates on new arrivals and special offers
        </p>
        <p className="text-lg text-purple-300">
          Plus, get 10% off your next purchase!
        </p>
      </div>
      <form 
        className="max-w-[280px] mx-auto flex flex-col sm:flex-row gap-4 mb-12"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 rounded-full text-gray-900"
          required
        />
        <button
          type="submit"
          className="w-full sm:w-auto bg-purple-600 px-8 py-2 rounded-full hover:bg-purple-700 transition-colors whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>

      {/* Thank You Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 p-8 rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Thank You for Subscribing!</h3>
              <p className="mb-6">Use code</p>
              <div className="bg-purple-100 py-3 px-6 rounded-lg mb-6">
                <span className="text-2xl font-bold text-purple-600">SUB10</span>
              </div>
              <p className="text-gray-600">
                to save 10% on your next purchase
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
