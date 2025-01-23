import { Redis } from 'ioredis';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import ProductCardSimple from '@/components/ProductCardSimple';

// Dynamic import of ProductCard component
// const ProductCard = dynamic(() => import('../../../components/ProductCard'), {
//   loading: () => <p>Loading...</p>
// });

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300;

export async function generateMetadata(props) {
  // Await params in metadata generation
  const params = await props.params;
  const lastSlug = params.path[params.path.length - 1];
  
  const title = lastSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} - Groovy Gallery Designs`,
    description: `Discover our collection of ${title.toLowerCase()} at Groovy Gallery Designs`,
    // Add OpenGraph metadata for better social sharing
    openGraph: {
      title: `${title} - Groovy Gallery Designs`,
      description: `Discover our collection of ${title.toLowerCase()} at Groovy Gallery Designs`,
      type: 'website'
    }
  };
}

async function getProductsByCategory(slug) {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  });

  try {
    // Try to get from cache first
    const cacheKey = `category_products:${slug}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // If no cache, get fresh data
    const productIds = await redis.smembers(`category:${slug}`);
    const products = await Promise.all(
      productIds.map(async (id) => {
        const productData = await redis.get(`product:${id}`);
        return productData ? JSON.parse(productData) : null;
      })
    );

    // Filter out any null values and sort by date
    const validProducts = products
      .filter(Boolean)
      .sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

    // Cache the result
    await redis.setex(
      cacheKey,
      CACHE_TTL,
      JSON.stringify(validProducts)
    );

    return validProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  } finally {
    await redis.quit();
  }
}

async function getProductsAndCategory(path) {
  const lastSlug = path[path.length - 1];
  const products = await getProductsByCategory(lastSlug);
  const category = products.length > 0 
    ? products[0].categories.find(cat => cat.slug === lastSlug) 
    : null;

  return { products, category };
}

function formatCategoryTitle(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function CategoryPage({ params }) {
  const { path } = params;
  const { products, category } = await getProductsAndCategory(path);

  return (
    <main className="container mx-auto px-4 py-8" role="main" aria-label={`${category?.name || 'Category'} page`}>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">{category?.name || 'Products'}</h1>
      <div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        role="region" 
        aria-label={`${category?.name || 'Product'} grid`}
      >
        {products?.map((product) => (
          <ProductCardSimple key={product.id} product={product} />
        ))}
      </div>
      {products?.length === 0 && (
        <p className="text-center text-gray-900" role="alert">No products found in this category.</p>
      )}
    </main>
  );
}
