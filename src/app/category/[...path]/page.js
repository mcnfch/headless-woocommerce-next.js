import { Redis } from 'ioredis';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamic import of ProductCard component
const ProductCard = dynamic(() => import('../../../components/ProductCard'), {
  loading: () => <p>Loading...</p>
});

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

function formatCategoryTitle(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function CategoryPage(props) {
  // Await params in the main component
  const params = await props.params;
  const lastSlug = params.path[params.path.length - 1];
  
  // Fetch products for the category
  const products = await getProductsByCategory(lastSlug);
  
  const categoryTitle = products.length > 0 
    ? products[0].categories.find(cat => cat.slug === lastSlug)?.name || formatCategoryTitle(lastSlug)
    : formatCategoryTitle(lastSlug);

  // Generate structured data with awaited params
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": categoryTitle,
    "description": `Discover our collection of ${categoryTitle.toLowerCase()}`,
    "url": `https://woo.groovygallerydesigns.com/category/${params.path.join('/')}`,
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "Product",
      "position": index + 1,
      "name": product.name,
      "description": product.description.replace(/<[^>]*>/g, ''),
      "image": product.images[0]?.src || '',
      "url": product.permalink,
      "sku": product.sku,
      "brand": {
        "@type": "Brand",
        "name": "Groovy Gallery Designs"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 glass-title">
          {categoryTitle}
        </h1>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
