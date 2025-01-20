import { Redis } from 'ioredis';
import Image from 'next/image';
import ProductGallery from '@/components/ProductGallery';
import ProductCardSimple from '@/components/ProductCardSimple';
import ProductForm from '@/components/ProductForm';
import Script from 'next/script';

export const metadata = {
  title: 'Product Page',
  description: 'Product details page'
};

// This ensures params are properly handled
export async function generateStaticParams() {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  });

  try {
    const keys = await redis.keys('product:*');
    const slugs = [];
    
    for (const key of keys) {
      const productData = await redis.get(key);
      if (productData) {
        const product = JSON.parse(productData);
        slugs.push({ slug: product.slug });
      }
    }
    
    await redis.quit();
    return slugs;
  } catch (error) {
    console.error('Error generating static params:', error);
    await redis.quit();
    return [];
  }
}

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

export default async function ProductPage(context) {
  const resolvedParams = await context.params;

  if (!resolvedParams || !resolvedParams.slug) {
    console.error('Params are missing or incomplete:', resolvedParams);
    return <div className="container mx-auto px-4 py-8">Invalid product slug</div>;
  }

  const slug = resolvedParams.slug;
  console.log('Processing product with slug:', slug);

  try {
    const { product, relatedProducts } = await getProduct(slug);

    if (!product) {
      return <div className="container mx-auto px-4 py-8">Product not found</div>;
    }

    // Prepare structured data for the main product
    const productSchema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description.replace(/<[^>]*>/g, ''),
      image: product.images?.[0]?.src || '',
      sku: product.sku,
      mpn: product.id.toString(),
      brand: {
        '@type': 'Brand',
        name: 'Groovy Gallery Designs'
      },
      offers: {
        '@type': 'Offer',
        url: `https://groovygallerydesigns.com/product/${product.slug}`,
        priceCurrency: 'USD',
        price: product.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stock_status === 'instock' 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock'
      }
    };

    // Prepare structured data for related products
    const relatedProductsSchema = {
      '@context': 'https://schema.org/',
      '@type': 'ItemList',
      name: 'Frequently Bought Together',
      itemListElement: relatedProducts.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: item.name,
          description: item.description.replace(/<[^>]*>/g, ''),
          image: item.images?.[0]?.src || '',
          sku: item.sku,
          mpn: item.id.toString(),
          brand: {
            '@type': 'Brand',
            name: 'Groovy Gallery Designs'
          },
          offers: {
            '@type': 'Offer',
            url: `https://groovygallerydesigns.com/product/${item.slug}`,
            priceCurrency: 'USD',
            price: item.price,
            itemCondition: 'https://schema.org/NewCondition',
            availability: item.stock_status === 'instock' 
              ? 'https://schema.org/InStock' 
              : 'https://schema.org/OutOfStock'
          }
        }
      }))
    };

    return (
      <>
        <Script id="product-structured-data" type="application/ld+json">
          {JSON.stringify(productSchema)}
        </Script>
        <Script id="related-products-structured-data" type="application/ld+json">
          {JSON.stringify(relatedProductsSchema)}
        </Script>

        <main className="flex-grow glass-background">
          <div className="container mx-auto px-4 py-8">
            {/* Main Product Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-16">
              <div className="flex flex-col md:grid md:grid-cols-2 gap-8 p-8">
                {/* Product Gallery */}
                <ProductGallery
                  images={product.images.map((img, index) => ({
                    src: img.src,
                    alt: img.alt || '',
                    width: 1280,  
                    height: 1280, 
                    id: img.id || index, 
                  }))}
                />

                {/* Product Info */}
                <div>
                  <h1 className="text-3xl font-bold mb-4 text-black">{product.name}</h1>
                  <div className="text-gray-600 mb-6" 
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                  />
                  
                  <ProductForm product={product} />
                </div>
              </div>
            </div>

            {/* Often Bought Together Section */}
            {relatedProducts.length > 0 && (
              <section className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-8 text-black">Often Bought Together</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {relatedProducts.map((relatedProduct, index) => (
                    <ProductCardSimple
                      key={`${relatedProduct.id}-${index}`}
                      product={relatedProduct}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error('Error processing product page:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        An error occurred while loading the product page.
      </div>
    );
  }
}
