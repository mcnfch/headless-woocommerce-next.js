'use client';

import {useTransition} from "react";
import {Product} from "@/types/type";
import {useShoppingCart} from "use-shopping-cart";

type Props = {
    product: Product;
    quantity: number;
    isEnabled?: boolean;
    selectedOptions?: Record<string, string>;
    onAddToCart?: () => void;
}

export default function AddToCart({product, quantity, isEnabled = true, selectedOptions = {}, onAddToCart}: Props) {
    const [isPending, startTransition] = useTransition();
    const {addItem} = useShoppingCart();

    const handleAddToCart = () => {
        const cartItem = {
            ...product,
            selectedOptions,
            price: Math.round(parseFloat(product.price) * 100), // Convert to cents
            currency: 'USD'
        };
        addItem(cartItem, { count: quantity });
        onAddToCart?.();
    };
    
    return (
        <button 
            aria-label="Add item to cart" 
            title="Add Item to Cart" 
            disabled={!isEnabled || isPending}
            className={`w-full py-3 rounded-lg text-white transition-colors duration-200 ${
                !isEnabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800'
            }`}
            onClick={handleAddToCart}
        >
            <span>{isPending ? 'Adding...' : 'Add To Cart'}</span>
        </button>
    )
}
