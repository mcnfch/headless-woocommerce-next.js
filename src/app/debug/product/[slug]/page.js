import { Redis } from 'ioredis';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';

export const metadata = {
  title: 'Product Page',
  description: 'Product details page'
};

async function getProduct(slug) {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  });

  try {
    // Get all product keys
    const keys = await redis.keys('product:*');
    
    // Search through products to find the one with matching slug
    for (const key of keys) {
      const productData = await redis.get(key);
      if (productData) {
        const product = JSON.parse(productData);
        if (product.slug === slug) {
          // Get related products
          const relatedProducts = [];
          for (const relatedId of product.related_ids) {
            const relatedData = await redis.get(`product:${relatedId}`);
            if (relatedData) {
              relatedProducts.push(JSON.parse(relatedData));
            }
          }
          
          // Update metadata dynamically
          metadata.title = `${product.name} - Groovy Gallery Designs`;
          metadata.description = product.description.replace(/<[^>]*>/g, '');
          
          await redis.quit();
          return { product, relatedProducts };
        }
      }
    }
    
    await redis.quit();
    return { product: null, relatedProducts: [] };
  } catch (error) {
    console.error('Error fetching product:', error);
    await redis.quit();
    return { product: null, relatedProducts: [] };
  }
}

export default async function ProductPage({ params }) {
  const { product, relatedProducts } = await getProduct(params.slug);

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description.replace(/<[^>]*>/g, ''),
    "image": product.images.map(img => img.src),
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Groovy Gallery Designs"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://groovygallerydesigns.com/product/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.stock_status === 'instock' 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="relative aspect-square">
          <Image
            src={product.images[0]?.src || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-4 text-black">{product.name}</h1>
          <div 
            className="text-base text-gray-600 mb-6"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          
          <div className="mb-6">
            <p className="text-2xl font-bold text-black">
              ${parseFloat(product.price).toFixed(2)}
            </p>
            {product.regular_price && (
              <p className="text-gray-500 line-through">
                ${parseFloat(product.regular_price).toFixed(2)}
              </p>
            )}
          </div>

          {/* Variations */}
          {product.attributes?.map(attribute => (
            <div key={attribute.id || attribute.name} className="mb-4">
              <label className="block text-base text-black mb-2">
                {attribute.name}
              </label>
              <select
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-black"
                required={attribute.variation}
              >
                <option value="">Select {attribute.name}</option>
                {attribute.options.map((option, index) => (
                  <option key={`${attribute.id || attribute.name}-${option}-${index}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Add to Cart Button */}
          <button
            className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Often Bought Together Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Often Bought Together</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
