'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function AddToCartForm({ product }) {
  const { addItem } = useCart();
  const [selectedVariation, setSelectedVariation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVariationChange = (attributeName, value) => {
    setSelectedVariation(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const isFormValid = () => {
    if (!product.attributes || product.attributes.length === 0) return true;
    
    return product.attributes.every(attr => 
      !attr.variation || selectedVariation[attr.name]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Ensure price is a valid number
      const price = typeof product.price === 'string' 
        ? parseFloat(product.price.replace(/[^0-9.]/g, ''))
        : parseFloat(product.price) || 0;

      await addItem({
        id: product.id,
        name: product.name,
        price: price,
        variation: selectedVariation,
        images: product.images
      });
    } catch (err) {
      setError(err.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Variations */}
      {product.attributes?.map((attribute, attrIndex) => (
        <div key={`attr-${attribute.id || attribute.name}-${attrIndex}`} className="mb-4">
          <label className="block text-base text-black mb-2">
            {attribute.name}
          </label>
          <select
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-black"
            required={attribute.variation}
            value={selectedVariation[attribute.name] || ''}
            onChange={(e) => handleVariationChange(attribute.name, e.target.value)}
          >
            <option value="">Select {attribute.name}</option>
            {attribute.options.map((option, optIndex) => (
              <option 
                key={`opt-${attribute.id || attribute.name}-${option}-${optIndex}`} 
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        type="submit"
        disabled={!isFormValid() || loading}
        className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>

      {!isFormValid() && (
        <p className="text-red-500 text-sm mt-2">
          Please select all required options
        </p>
      )}
    </form>
  );
}
