'use client';

import ProductDetails from "@/components/ProductDetails";
import ProductGallery from "@/components/ProductGallery";
import CartModal from "@/components/cart/modal";
import { useState } from "react";

export default function ProductPageClient({ product }) {
    const [openCart, setOpenCart] = useState(false);

    return (
        <>
            <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 mb-8">
                <div className="h-full w-full basis-full lg:basis-4/6">
                    <ProductGallery
                        images={product.images.map((img, index) => ({
                            src: img.src,
                            alt: img.alt || product.name,
                            width: 1280,
                            height: 1280,
                            id: img.id || index
                        }))}
                    />
                </div>
                <ProductDetails 
                    product={product} 
                    onAddToCart={() => setOpenCart(true)}
                />
            </div>
            <CartModal open={openCart} onClose={() => setOpenCart(false)} />
        </>
    );
}
