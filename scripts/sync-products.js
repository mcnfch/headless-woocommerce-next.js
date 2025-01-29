import { exec } from 'child_process';
import { promisify } from 'util';
import Redis from 'ioredis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6310,
});

async function syncProducts() {
  console.log('Starting product synchronization...');
  
  try {
    // Run MySQL fetch script
    const mysqlFetchScript = join(__dirname, 'time-mysql-fetch.mjs');
    const { stdout, stderr } = await execAsync(`node ${mysqlFetchScript}`);
    
    if (stderr) {
      console.error('Error during MySQL fetch:', stderr);
      return;
    }
    
    // Extract the JSON from the output
    const jsonMatch = stdout.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('No JSON data found in MySQL fetch output');
    }
    
    // Parse the products JSON
    const products = JSON.parse(jsonMatch[0]);
    
    // Clear existing product data in Redis
    let cursor = '0';
    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'product:*');
      cursor = newCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');

    cursor = '0';
    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'product_slug:*');
      cursor = newCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');

    cursor = '0';
    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'category:*');
      cursor = newCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
    
    // Store new product data in Redis
    for (const product of products) {
      await redis.set(`product:${product.id}`, JSON.stringify(product));
      await redis.set(`product_slug:${product.slug}`, JSON.stringify(product));
      
      // Handle categories
      if (product.categories) {
        for (const category of product.categories) {
          await redis.sadd(`category:${category.slug}`, product.id);
        }
      }
    }
    
    console.log('Product synchronization completed successfully');
    console.log(`Synced ${products.length} products to Redis`);
  } catch (error) {
    console.error('Error during product synchronization:', error);
  } finally {
    redis.quit();
  }
}

// Run immediately on script execution
syncProducts();
