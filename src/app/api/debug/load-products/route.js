import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

export async function POST(request) {
  try {
    const { productIds } = await request.json();
    const startTime = Date.now();
    const results = [];

    for (const id of productIds) {
      try {
        const response = await fetch(
          `https://woo.groovygallerydesigns.com/wp-json/wc/v3/products/${id}`,
          {
            headers: {
              'Authorization': 'Basic ' + Buffer.from(
                `${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`
              ).toString('base64'),
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const product = await response.json();
        
        // Store by category
        if (product.categories && product.categories.length > 0) {
          for (const category of product.categories) {
            await redis.hset(
              `category:${category.id}`,
              product.slug,
              JSON.stringify(product)
            );
          }
        }

        // Also store by product ID for direct access
        await redis.set(`product:${id}`, JSON.stringify(product));
        
        results.push({
          id,
          status: 'success',
          categories: product.categories.map(c => c.name)
        });
      } catch (error) {
        console.error(`Error processing product ${id}:`, error);
        results.push({
          id,
          status: 'error',
          error: error.message
        });
      }
    }

    const endTime = Date.now();
    const timeTaken = endTime - startTime;

    return NextResponse.json({
      success: true,
      timeTaken,
      results
    });
  } catch (error) {
    console.error('Error in load-products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
