import { Redis } from 'ioredis';
import { initializeProductDatabase } from '../src/utils/initializeServer.js';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

async function clearRedis() {
  console.log('Clearing existing Redis data...');
  
  // Clear all product keys
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'product:*');
    if (keys.length > 0) {
      console.log(`Deleting ${keys.length} product keys...`);
      await redis.del(...keys);
    }
    cursor = newCursor;
  } while (cursor !== '0');

  // Clear all product_slug keys
  cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'product_slug:*');
    if (keys.length > 0) {
      console.log(`Deleting ${keys.length} product_slug keys...`);
      await redis.del(...keys);
    }
    cursor = newCursor;
  } while (cursor !== '0');

  // Clear all category keys
  cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'category:*');
    if (keys.length > 0) {
      console.log(`Deleting ${keys.length} category keys...`);
      await redis.del(...keys);
    }
    cursor = newCursor;
  } while (cursor !== '0');
}

console.log('Starting database initialization...');

// First clear Redis, then initialize with fresh data
clearRedis()
  .then(() => initializeProductDatabase())
  .then(result => {
    console.log('Database initialization complete:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error initializing database:', error);
    process.exit(1);
  });
