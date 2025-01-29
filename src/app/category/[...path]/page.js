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
    port: process.env.REDIS_PORT || 6310,
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

    // Filter out any null values, deduplicate by ID, and sort by date
    const productMap = new Map();
    products
      .filter(Boolean)
      .forEach(product => {
        if (!productMap.has(product.id)) {
          productMap.set(product.id, product);
        }
      });
    
    const validProducts = Array.from(productMap.values())
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
  
  // Only get products from the specific category
  const products = await getProductsByCategory(lastSlug);

  // Find the current category from the last product's categories
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
  const resolvedParams = await Promise.resolve(params);
  const { path } = resolvedParams;
  const { products, category } = await getProductsAndCategory(path);

  // Create schema markup for collection
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category?.name || 'Products',
    "description": `Collection of ${category?.name?.toLowerCase() || 'products'} from Groovy Gallery Designs`,
    "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/category/${path.join('/')}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": products?.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "description": product.description?.replace(/<[^>]*>/g, '') // Remove HTML tags
            ?.replace(/&amp;/g, '&')  // Convert &amp; to &
            ?.replace(/&lt;/g, '<')   // Convert &lt; to <
            ?.replace(/&gt;/g, '>')   // Convert &gt; to >
            ?.replace(/&quot;/g, '"') // Convert &quot; to "
            ?.replace(/&#039;/g, "'") // Convert &#039; to '
            ?.trim() || '',
          "image": product.images?.[0]?.src,
          "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/product/${product.slug}`,
          "brand": {
            "@type": "Brand",
            "name": "Groovy Gallery Designs"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": product.price || "0.00",
            "availability": product.stock_status === 'instock'
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock"
          }
        }
      }))
    }
  };

  return (
    <main className="container mx-auto px-4 py-8" role="main" aria-label={`${category?.name || 'Category'} page`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema)
        }}
      />
      <h2 className="text-white text-[1.4rem] mb-8">{decodeURIComponent(category?.name)}</h2>
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
