/**
 * Parses a price value to ensure consistent number format
 * @param {string|number} price - Price to parse
 * @returns {number} Parsed price as a number
 */
export const parsePrice = (price) => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price;
  }
  return typeof price === 'string'
    ? parseFloat(price.replace(/[^0-9.]/g, '')) || 0
    : 0;
};

/**
 * Formats a price for WooCommerce API
 * @param {number} price - Price to format
 * @returns {string} Formatted price as string with 2 decimal places
 */
export const formatWooCommercePrice = (price) => {
  const parsedPrice = parsePrice(price);
  return parsedPrice.toFixed(2);
};

/**
 * Validates if a price is in the correct format
 * @param {any} price - Price to validate
 * @returns {boolean} True if price is valid
 */
export const isValidPrice = (price) => {
  const parsedPrice = parsePrice(price);
  return typeof parsedPrice === 'number' && !isNaN(parsedPrice) && parsedPrice >= 0;
};
