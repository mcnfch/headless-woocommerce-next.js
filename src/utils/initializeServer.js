import dotenv from 'dotenv';
import { Redis } from 'ioredis';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { decode } from 'html-entities';

// Load environment variables
dotenv.config();

const WooCommerce = WooCommerceRestApi.default;
const api = new WooCommerce({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.groovygallerydesigns.com',
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: 'wc/v3'
});

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

async function getAllProductIds() {
  let page = 1;
  const perPage = 100;
  let allProducts = [];
  
  try {
    while (true) {
      const response = await api.get('products', {
        per_page: perPage,
        page: page,
        _fields: 'id'
      });
      
      const products = response.data;
      if (products.length === 0) break;
      
      allProducts = [...allProducts, ...products];
      page++;
    }
    
    return allProducts.map(product => product.id);
  } catch (error) {
    console.error('Error fetching product IDs:', error);
    return [];
  }
}

async function loadProductDetails(productId) {
  try {
    const response = await api.get(`products/${productId}`);
    const product = response.data;
    
    // Split attributes into single-option and multi-option
    const defaultAttributes = {};
    const multiOptionAttributes = [];
    
    if (product.attributes) {
      product.attributes.forEach(attr => {
        if (attr.options.length === 1) {
          defaultAttributes[attr.name] = attr.options[0];
        } else {
          multiOptionAttributes.push(attr);
        }
      });
    }
    
    // Decode HTML entities in text fields and create processed product
    const processedProduct = {
      ...product,
      name: decode(product.name),
      description: decode(product.description),
      short_description: decode(product.short_description),
      categories: product.categories.map(cat => ({
        ...cat,
        name: decode(cat.name),
        description: decode(cat.description || '')
      })),
      attributes: multiOptionAttributes,
      defaultAttributes
    };
    
    // Store by product ID
    await redis.set(`product:${processedProduct.id}`, JSON.stringify(processedProduct));
    
    // Store by slug for URL lookups
    await redis.set(`product_slug:${processedProduct.slug}`, JSON.stringify(processedProduct));
    
    // Store in category indexes
    for (const category of processedProduct.categories) {
      await redis.sadd(`category:${category.slug}`, processedProduct.id);
    }
    
    return true;
  } catch (error) {
    console.error(`Error loading product ${productId}:`, error);
    return false;
  }
}

export async function initializeProductDatabase() {
  console.log('Starting server initialization...');
  console.log('Fetching product IDs...');
  
  const productIds = await getAllProductIds();
  console.log(`Found ${productIds.length} products to load`);
  
  let successCount = 0;
  let failCount = 0;
  
  console.log('Loading product details into database...');
  for (const productId of productIds) {
    const success = await loadProductDetails(productId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Log progress every 10 products
    if ((successCount + failCount) % 10 === 0) {
      console.log(`Progress: ${successCount + failCount}/${productIds.length} products processed`);
    }
  }
  
  console.log('\nServer initialization complete:');
  console.log(`Successfully loaded: ${successCount} products`);
  console.log(`Failed to load: ${failCount} products`);
  
  return {
    success: successCount,
    failed: failCount,
    total: productIds.length
  };
}
