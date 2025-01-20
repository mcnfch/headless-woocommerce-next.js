import { Redis } from 'ioredis';
import {notFound} from 'next/navigation';
import ProductCardSimple from '@/components/ProductCardSimple';
import Script from 'next/script';
import ProductPageClient from '@/components/ProductPageClient';

export const metadata = {
    title: 'Product Page',
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
                    await redis.quit();
                    return product;
                }
            }
        }
        
        await redis.quit();
        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        await redis.quit();
        return null;
    }
}

async function getRelatedProducts(productId) {
    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    });

    try {
        const productData = await redis.get(`product:${productId}`);
        if (!productData) {
            await redis.quit();
            return [];
        }

        const product = JSON.parse(productData);
        const relatedProducts = [];

        for (const relatedId of product.related_ids || []) {
            const relatedData = await redis.get(`product:${relatedId}`);
            if (relatedData) {
                relatedProducts.push(JSON.parse(relatedData));
            }
        }

        await redis.quit();
        return relatedProducts;
    } catch (error) {
        console.error('Error fetching related products:', error);
        await redis.quit();
        return [];
    }
}

export default async function ProductPage({params}) {
    const resolvedParams = await params;
    const {slug} = resolvedParams;
    
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.id);

    // Structured data for SEO
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.[0]?.src || '',
        sku: product.sku,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.stock_status === 'instock'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <>
            <Script id="product-structured-data" type="application/ld+json">
                {JSON.stringify(structuredData)}
            </Script>

            <div className="mx-auto max-w-screen-2xl px-4">
                <ProductPageClient product={product} />

                {/* Frequently Bought Together Section */}
                {relatedProducts?.length > 0 && (
                    <div className="py-8">
                        <h2 className="mb-4 text-2xl font-bold">Frequently Bought Together</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map(product => <ProductCardSimple key={product.id} product={product}/>)}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
