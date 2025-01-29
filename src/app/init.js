import { Redis } from 'ioredis';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import fs from 'fs/promises';
import path from 'path';

let initializationPromise = null;

const WooCommerce = WooCommerceRestApi.default;

export async function initializeServer() {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (typeof window !== 'undefined') {
    return { status: 'skipped', message: 'Client-side initialization not needed' };
  }

  initializationPromise = new Promise(async (resolve) => {
    const api = new WooCommerce({
      url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL,
      consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
      consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
      version: 'wc/v3'
    });

    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');

    try {
      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }

      // Get current product count
      console.log('Checking product count...');
      const countResponse = await api.get('products', { per_page: 1 });
      const currentCount = parseInt(countResponse.headers['x-wp-total'], 10);

      let products = [];
      let shouldUpdateFile = true;

      try {
        const fileContent = await fs.readFile(PRODUCTS_FILE, 'utf-8');
        const savedProducts = JSON.parse(fileContent);
        if (savedProducts.length === currentCount) {
          console.log('Product count matches saved file, using cached data');
          products = savedProducts;
          shouldUpdateFile = false;
        }
      } catch (error) {
        console.log('No valid products file found or count mismatch, fetching fresh data');
      }

      if (shouldUpdateFile) {
        console.log('Fetching all products...');
        let page = 1;
        const perPage = 100;

        while (true) {
          const response = await api.get('products', {
            per_page: perPage,
            page: page
          });

          const pageProducts = response.data;
          if (pageProducts.length === 0) break;

          products = [...products, ...pageProducts];
          console.log(`Fetched page ${page} (${pageProducts.length} products)`);
          page++;
        }

        if (products.length > 0) {
          console.log('Saving products to file...');
          await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        }
      }

      console.log('Loading products into Redis...');
      let successCount = 0;
      let failCount = 0;

      for (const product of products) {
        try {
          await redis.set(`product:${product.id}`, JSON.stringify(product));
          await redis.set(`product_slug:${product.slug}`, JSON.stringify(product));
          
          for (const category of product.categories) {
            await redis.sadd(`category:${category.slug}`, product.id);
          }
          
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`Progress: ${successCount}/${products.length} products loaded`);
          }
        } catch (error) {
          console.error(`Error loading product ${product.id}:`, error);
          failCount++;
        }
      }

      console.log('\nDatabase initialization complete:');
      console.log(`Successfully loaded: ${successCount} products`);
      console.log(`Failed to load: ${failCount} products`);

      await redis.quit();
      resolve({
        status: 'success',
        results: {
          success: successCount,
          failed: failCount,
          total: products.length,
          usedCache: !shouldUpdateFile
        }
      });
    } catch (error) {
      console.error('Database initialization failed:', error);
      await redis.quit();
      resolve({ status: 'error', message: error.message });
    }
  });

  return initializationPromise;
}
