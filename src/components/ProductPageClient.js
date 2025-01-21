'use client';

import { useState } from 'react';
import ProductGallery from '@/components/ProductGallery';
import ProductDetails from '@/components/ProductDetails';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function ProductPageClient({ product }) {
    // Ensure product images have unique IDs
    const imagesWithIds = product.images.map((image, index) => ({
        ...image,
        id: image.id || `img-${index}`
    }));

    return (
        <div className="flex flex-col lg:flex-row gap-8 container mx-auto px-4 py-8">
            <div className="basis-full lg:basis-4/6">
                <ErrorBoundary>
                    <ProductGallery images={imagesWithIds} />
                </ErrorBoundary>
            </div>
            <div className="basis-full lg:basis-2/6">
                <ErrorBoundary>
                    <ProductDetails product={{...product, images: imagesWithIds}} />
                </ErrorBoundary>
            </div>
        </div>
    );
}
