import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

const WooCommerce = WooCommerceRestApi.default;
const api = new WooCommerce({
  url: WOOCOMMERCE_URL,
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: "wc/v3",
});

const desiredCategories = [
  "new-arrivals",
  "accessories",
  "women",
  "men",
  "groovy-gear",
  "custom-designs"
];

export async function getTopLevelCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/products/categories?parent=0&per_page=100`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY + ':' + 
            process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET
          ).toString('base64')
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Create a mapping of slugs to their desired order
    const orderMap = Object.fromEntries(
      desiredCategories.map((slug, index) => [slug, index])
    );

    // Filter and sort categories according to desiredCategories
    const sortedCategories = data
      .filter(category => 
        category.slug !== 'uncategorized' &&
        desiredCategories.includes(category.slug)
      )
      .sort((a, b) => orderMap[a.slug] - orderMap[b.slug]);

    // If any desired category is missing, create a placeholder for it
    const finalCategories = desiredCategories.map(slug => {
      const existingCategory = sortedCategories.find(cat => cat.slug === slug);
      if (existingCategory) return existingCategory;

      // Create placeholder for missing categories
      return {
        id: `placeholder-${slug}`,
        name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        slug: slug,
        description: `Explore our ${slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} collection`,
        image: null
      };
    });

    return finalCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Cart-related functions using Store API through Next.js API routes
const storeApi = {
  async fetchWithError(method, action = null, data = null) {
    try {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      };

      if (data) {
        options.body = JSON.stringify({ action, ...data });
      }

      const response = await fetch('/api/cart', options);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getCart() {
    return this.fetchWithError('GET');
  },

  async addToCart(productId, quantity = 1, variation = {}) {
    return this.fetchWithError('POST', 'add-item', {
      id: productId,
      quantity,
      variation,
    });
  },

  async updateCartItem(key, quantity) {
    return this.fetchWithError('POST', 'update-item', {
      key,
      quantity,
    });
  },

  async removeCartItem(key) {
    return this.fetchWithError('POST', 'remove-item', {
      key,
    });
  },
};

export { api, storeApi };