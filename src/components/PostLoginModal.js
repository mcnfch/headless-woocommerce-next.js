'use client';

import { useRouter } from 'next/navigation';

export default function PostLoginModal({ onClose }) {
  const router = useRouter();

  const handleContinueShopping = () => {
    onClose();
    router.push('/');
  };

  const handleViewProfile = () => {
    onClose();
    router.push('/account');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>
        <div className="space-y-4">
          <button
            onClick={handleContinueShopping}
            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleViewProfile}
            className="w-full py-3 px-4 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
