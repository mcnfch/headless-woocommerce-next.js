'use client';

import ProductGallery from '@/components/ProductGallery';
import CartControls from '@/components/cart/CartControls';
import ProductCard from '@/components/ProductCard';

export default function ProductDetails({ product, relatedProducts }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          })
        }}
      />

      {/* Mobile Title */}
      <div className="md:hidden mb-6">
        <h1 className="text-2xl font-bold text-black">{product.name}</h1>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-8 mb-16">
        {/* Product Gallery */}
        <div className="order-1">
          <ProductGallery images={product.images} />
        </div>

        {/* Product Info */}
        <div className="order-2 bg-white p-8 rounded-lg shadow-sm">
          {/* Desktop Title */}
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold text-black mb-4">{product.name}</h1>
          </div>

          {/* Price */}
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

          {/* Description */}
          <div 
            className="prose prose-sm max-w-none mb-8 text-primary"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          {/* Add to Cart */}
          <CartControls product={product} />
        </div>
      </div>

      {/* Often Bought Together Section */}
      {relatedProducts?.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-primary">Often Bought Together</h2>
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
