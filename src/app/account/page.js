'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const TABS = {
  PROFILE: 'profile',
  BILLING: 'billing',
  ORDERS: 'orders'
};

const AddressForm = ({ type, data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label htmlFor={`${type}_address`} className="block text-black text-sm font-bold mb-2">Street Address</label>
      <input
        type="text"
        id={`${type}_address`}
        name={`${type}_address_1`}
        value={data?.address_1 || ''}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black text-black placeholder:text-black"
        placeholder="Enter street address"
      />
    </div>
    <div>
      <label htmlFor={`${type}_city`} className="block text-black text-sm font-bold mb-2">City</label>
      <input
        type="text"
        id={`${type}_city`}
        name={`${type}_city`}
        value={data?.city || ''}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black text-black placeholder:text-black"
        placeholder="Enter city"
      />
    </div>
    <div>
      <label htmlFor={`${type}_state`} className="block text-black text-sm font-bold mb-2">State/Province</label>
      <input
        type="text"
        id={`${type}_state`}
        name={`${type}_state`}
        value={data?.state || ''}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black text-black placeholder:text-black"
        placeholder="Enter state/province"
      />
    </div>
    <div>
      <label htmlFor={`${type}_postcode`} className="block text-black text-sm font-bold mb-2">ZIP/Postal Code</label>
      <input
        type="text"
        id={`${type}_postcode`}
        name={`${type}_postcode`}
        value={data?.postcode || ''}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black text-black placeholder:text-black"
        placeholder="Enter ZIP/postal code"
      />
    </div>
    <div>
      <label htmlFor={`${type}_country`} className="block text-black text-sm font-bold mb-2">Country</label>
      <input
        type="text"
        id={`${type}_country`}
        name={`${type}_country`}
        value={data?.country || ''}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black text-black placeholder:text-black"
        placeholder="Enter country"
      />
    </div>
  </div>
);

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);
  const [formData, setFormData] = useState({
    billing: {},
    shipping: {}
  });
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(false);

  // Load shipping preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('useShippingAsBilling');
    if (savedPreference !== null) {
      setUseShippingAsBilling(savedPreference === 'true');
    }
  }, []);

  // Save shipping preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('useShippingAsBilling', useShippingAsBilling.toString());
  }, [useShippingAsBilling]);

  useEffect(() => {
    if (user) {
      setFormData({
        billing: user.billing || {},
        shipping: user.shipping || {}
      });
      // Only set from user data if we don't have a local storage value
      if (localStorage.getItem('useShippingAsBilling') === null) {
        setUseShippingAsBilling(user.useShippingAsBilling || false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  const handleAddressChange = (e, type) => {
    const { name, value } = e.target;
    const addressType = name.startsWith('billing_') ? 'billing' : 'shipping';
    const field = name.replace(`${addressType}_`, '');
    
    setFormData(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/user/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing: formData.billing,
          shipping: useShippingAsBilling ? formData.billing : formData.shipping,
          useShippingAsBilling
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update addresses');
      }

      const { user } = await response.json();
      
      // Update form data with saved values
      setFormData({
        billing: user.billing || {},
        shipping: user.shipping || {}
      });

      alert('Address information updated successfully');
    } catch (error) {
      console.error('Error updating addresses:', error);
      alert('Failed to update address information. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black font-semibold">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-black font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-semibold rounded-t-lg ${
        activeTab === tab
          ? 'bg-white text-black border-t border-x border-gray-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.PROFILE:
        return (
          <div className="space-y-6">
            {user?.avatar && (
              <div className="flex justify-center mb-8">
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              </div>
            )}
            <div>
              <label className="block text-black text-sm font-bold mb-2">Username</label>
              <p className="text-black bg-gray-50 p-2 rounded">{user?.username || user?.email || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-black text-sm font-bold mb-2">Email</label>
              <p className="text-black bg-gray-50 p-2 rounded">{user?.email || user?.username || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-black text-sm font-bold mb-2">Display Name</label>
              <p className="text-black bg-gray-50 p-2 rounded">{user?.displayName || user?.email || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-black text-sm font-bold mb-2">Full Name</label>
              <p className="text-black bg-gray-50 p-2 rounded">
                {user?.firstName || user?.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`
                  : 'Not set'
                }
              </p>
            </div>
          </div>
        );
      
      case TABS.BILLING:
        return (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Billing Address</h3>
              <AddressForm 
                type="billing" 
                data={formData.billing}
                onChange={(e) => handleAddressChange(e, 'billing')}
              />
            </div>

            <div className="border-t pt-8">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="use_shipping_as_billing"
                  checked={useShippingAsBilling}
                  onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="use_shipping_as_billing" className="ml-2 block text-sm text-black">
                  Shipping address same as billing
                </label>
              </div>

              {!useShippingAsBilling && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-black">Shipping Address</h3>
                  <AddressForm 
                    type="shipping" 
                    data={formData.shipping}
                    onChange={(e) => handleAddressChange(e, 'shipping')}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Save Changes
              </button>
            </div>
          </form>
        );
      
      case TABS.ORDERS:
        return (
          <div className="space-y-6">
            <p className="text-gray-600 italic">No orders found.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-black">My Account</h2>
        <div className="space-x-4">
          <button
            onClick={handleLogout}
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
      
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex space-x-2 mb-6">
          <TabButton tab={TABS.PROFILE} label="Profile Information" />
          <TabButton tab={TABS.BILLING} label="Billing & Shipping" />
          <TabButton tab={TABS.ORDERS} label="Order History" />
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
