'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TABS = {
  PROFILE: 'profile',
  BILLING: 'billing',
  ORDERS: 'orders'
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);

  if (!user) {
    router.push('/login');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case TABS.PROFILE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
              <p className="text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <p className="text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
          </div>
        );
      case TABS.BILLING:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Billing Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
              <div className="space-y-2">
                <p>{user.billing?.first_name} {user.billing?.last_name}</p>
                {user.billing?.company && <p>{user.billing.company}</p>}
                <p>{user.billing?.address_1}</p>
                {user.billing?.address_2 && <p>{user.billing.address_2}</p>}
                <p>{user.billing?.city}, {user.billing?.state} {user.billing?.postcode}</p>
                <p>{user.billing?.country}</p>
                {user.billing?.phone && <p>{user.billing.phone}</p>}
                {user.billing?.email && <p>{user.billing.email}</p>}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="space-y-2">
                <p>{user.shipping?.first_name} {user.shipping?.last_name}</p>
                {user.shipping?.company && <p>{user.shipping.company}</p>}
                <p>{user.shipping?.address_1}</p>
                {user.shipping?.address_2 && <p>{user.shipping.address_2}</p>}
                <p>{user.shipping?.city}, {user.shipping?.state} {user.shipping?.postcode}</p>
                <p>{user.shipping?.country}</p>
                {user.shipping?.phone && <p>{user.shipping.phone}</p>}
              </div>
            </div>
          </div>
        );
      case TABS.ORDERS:
        return (
          <div className="py-4">
            <p className="text-gray-500 italic">This feature is coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">My Account</h2>
          <div className="space-x-4">
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab(TABS.PROFILE)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === TABS.PROFILE
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab(TABS.BILLING)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === TABS.BILLING
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Billing & Shipping
              </button>
              <button
                onClick={() => setActiveTab(TABS.ORDERS)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === TABS.ORDERS
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order History
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
