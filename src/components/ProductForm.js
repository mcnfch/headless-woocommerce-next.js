'use client';

import { useState, useEffect } from 'react';

export default function ProductForm({ product, onOptionsChange }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [allOptionsSelected, setAllOptionsSelected] = useState(false);

  // Initialize options, auto-selecting single options
  useEffect(() => {
    if (product.attributes) {
      const initialOptions = {};
      product.attributes.forEach(attribute => {
        if (attribute.options.length === 1) {
          initialOptions[attribute.name] = attribute.options[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  // Check if all required options are selected
  useEffect(() => {
    if (!product.attributes) return;

    const requiredOptionsCount = product.attributes.length;
    const selectedOptionsCount = Object.keys(selectedOptions).length;
    const allSelected = selectedOptionsCount === requiredOptionsCount;

    setAllOptionsSelected(allSelected);
    onOptionsChange?.(allSelected, selectedOptions);
  }, [selectedOptions, product, onOptionsChange]);

  const handleOptionChange = (attributeName, value) => {
    if (!value) {
      const newOptions = { ...selectedOptions };
      delete newOptions[attributeName];
      setSelectedOptions(newOptions);
    } else {
      setSelectedOptions(prev => ({
        ...prev,
        [attributeName]: value
      }));
    }
  };

  return (
    <div>
      {/* Product Options */}
      {product.attributes && [...new Set(product.attributes)]
        .filter(attribute => attribute.options.length > 1) // Only show attributes with multiple options
        .map((attribute) => (
          <div key={attribute.name} className="mb-4">
            <label htmlFor={attribute.name} className="block text-sm font-medium text-black mb-2">
              {attribute.name}<span className="text-red-500">*</span>
            </label>
            <select
              id={attribute.name}
              name={attribute.name}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
              onChange={(e) => handleOptionChange(attribute.name, e.target.value)}
              required
            >
              <option value="" className="text-black">Select {attribute.name}</option>
              {[...new Set(attribute.options)].map((option) => (
                <option key={option} value={option} className="text-black">
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}

      {/* Hidden inputs for single-option attributes */}
      {product.attributes && [...new Set(product.attributes)]
        .filter(attribute => attribute.options.length === 1)
        .map((attribute) => (
          <input
            key={attribute.name}
            type="hidden"
            name={attribute.name}
            value={attribute.options[0]}
          />
        ))}
    </div>
  );
}
