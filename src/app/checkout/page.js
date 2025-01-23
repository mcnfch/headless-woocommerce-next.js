'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import CheckoutForm from '@/components/checkout/CheckoutForm';

// Initialize Stripe with test key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST);

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { cart, loading, getStripeTotalAmount } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US'
  });

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateShippingInfo = () => {
    const errors = {};
    const requiredFields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'address1', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'postcode', label: 'Postal Code' }
    ];

    requiredFields.forEach(({ key, label }) => {
      if (!shippingInfo[key]?.trim()) {
        errors[key] = `${label} is required`;
      }
    });

    // Validate postal code format for US
    if (shippingInfo.country === 'US' && shippingInfo.postcode) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(shippingInfo.postcode)) {
        errors.postcode = 'Invalid ZIP code format';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createPaymentIntent = async () => {
    if (isProcessing) return;
    
    if (!validateShippingInfo()) {
      return;
    }

    if (!cart || loading) {
      alert('Please wait while your cart loads...');
      return;
    }

    if (!cart.items?.length) {
      alert('Your cart is empty');
      return;
    }

    // Calculate total in cents for Stripe
    const amountInCents = Math.round((cart.total - (discountAmount || 0)) * 100);
    if (amountInCents < 50) {
      alert('Order total must be at least $0.50');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          cartId: cart.id,
          couponCode: couponValid ? couponCode : null,
          shipping: shippingInfo
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      alert(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNowClick = async () => {
    await createPaymentIntent();
  };

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#000000',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  const validateCoupon = async () => {
    setCouponError(false);
    const response = await fetch(`https://woo.groovygallerydesigns.com/wp-json/wc/v3/coupons?code=${couponCode}`, {
      headers: {
        Authorization: `Basic ${btoa(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`)}`
      }
    });
    const data = await response.json();
    setCouponValid(data.length > 0);
    if (data.length === 0) {
      setCouponError(true);
      setDiscountAmount(0);
      setDiscountPercent(0);
    } else {
      const coupon = data[0];
      const percent = parseFloat(coupon.amount);
      setDiscountPercent(percent);
      const discount = (cart.total * percent) / 100;
      setDiscountAmount(discount);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponValid(false);
    setCouponError(false);
    setDiscountAmount(0);
    setDiscountPercent(0);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;
  }

  if (!cart?.items) {
    return <div className="min-h-screen flex items-center justify-center">Preparing checkout...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Order Summary</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex py-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                <img
                  src={cart.items[0].images?.[0]?.src || cart.items[0].images?.[0] || cart.items[0].images}
                  alt={cart.items[0].name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-primary">
                    <h3>{cart.items[0].name}</h3>
                    <p className="ml-4">${(cart.items[0].price * cart.items[0].quantity).toFixed(2)}</p>
                  </div>
                  {cart.items[0].variation && Object.keys(cart.items[0].variation).length > 0 && (
                    <p className="mt-1 text-sm text-primary">
                      {Object.entries(cart.items[0].variation)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-primary">Quantity: {cart.items[0].quantity}</p>
                </div>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between">
                <span className="font-bold text-black">Subtotal</span>
                <span className="font-bold text-black">${cart.total.toFixed(2)}</span>
              </div>
              {couponValid && (
                <div className="flex justify-between mt-2">
                  <span className="text-black">Discount ({discountPercent}%)</span>
                  <span className="text-black">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2">
                <span className="font-bold text-black">Total</span>
                <span className="font-bold text-black">
                  ${(cart.total - discountAmount).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError(false);
                }}
                className="border rounded px-2 py-1 text-black"
                placeholder="Discount code"
              />
              {!couponValid ? (
                <button
                  onClick={validateCoupon}
                  className="bg-black text-white px-4 py-1 rounded"
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={removeCoupon}
                  className="bg-black text-white px-4 py-1 rounded"
                >
                  Remove
                </button>
              )}
            </div>
            {couponValid && (
              <p className="text-green-600 mt-2">
                Discount code applied - You saved ${discountAmount.toFixed(2)}
              </p>
            )}
            {couponError && (
              <p className="text-red-600 mt-2">Invalid code</p>
            )}
          </div>
        </div>

        {/* Checkout Form */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Checkout</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            {!clientSecret ? (
              <>
                <h3 className="text-lg font-semibold mb-4 text-black">Shipping Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        className={`block w-full rounded-md border px-3 py-2 text-black ${
                          validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        className={`block w-full rounded-md border px-3 py-2 text-black ${
                          validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address1"
                      value={shippingInfo.address1}
                      onChange={handleShippingChange}
                      className={`block w-full rounded-md border px-3 py-2 text-black ${
                        validationErrors.address1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.address1 && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.address1}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className={`block w-full rounded-md border px-3 py-2 text-black ${
                          validationErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        className={`block w-full rounded-md border px-3 py-2 text-black ${
                          validationErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        name="postcode"
                        value={shippingInfo.postcode}
                        onChange={handleShippingChange}
                        className={`block w-full rounded-md border px-3 py-2 text-black ${
                          validationErrors.postcode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.postcode && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.postcode}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <select
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={createPaymentIntent}
                    disabled={isProcessing}
                    className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-900 disabled:bg-gray-400 mt-6"
                  >
                    {isProcessing ? "Processing..." : "Continue to Payment"}
                  </button>
                </div>
              </>
            ) : (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
