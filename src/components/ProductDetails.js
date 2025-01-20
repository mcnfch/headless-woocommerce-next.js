'use client';

import ProductForm from './ProductForm';
import AddToCart from './cart/add-to-cart';
import { useState } from 'react';

export default function ProductDetails({ product, onAddToCart }) {
    const [isValid, setIsValid] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="basis-full lg:basis-2/6">
            <h1 className="text-3xl font-bold mb-4 text-black">{product.name}</h1>

            <div className="mb-4">
                <p className="text-sm text-green-600">
                    {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                </p>
            </div>

            <div className="text-gray-600 mb-6" 
                dangerouslySetInnerHTML={{ __html: product.description }} 
            />

            <div className="mb-6">
                <p className="text-2xl font-bold text-black">${parseFloat(product.price).toFixed(2)}</p>
                {product.regular_price && product.regular_price !== product.price && (
                    <p className="text-gray-500 line-through">
                        ${parseFloat(product.regular_price).toFixed(2)}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        disabled={!product.stock_status === 'instock'}
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 text-black"
                        aria-label="Decrease quantity"
                    >
                        -
                    </button>
                    <span className="w-8 text-center text-black">{quantity}</span>
                    <button
                        onClick={() => quantity < 10 && setQuantity(quantity + 1)}
                        disabled={!product.stock_status === 'instock'}
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 text-black"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>
            </div>

            <ProductForm 
                product={product} 
                onOptionsChange={(valid, options) => {
                    setIsValid(valid);
                    setSelectedOptions(options);
                }} 
            />

            {!isValid && (
                <p className="text-red-500 text-sm mb-4">Please select all options before adding to cart</p>
            )}

            <AddToCart 
                product={product}
                quantity={quantity}
                isEnabled={isValid && product.stock_status === 'instock'} 
                selectedOptions={selectedOptions}
                onAddToCart={onAddToCart}
            />
        </div>
    );
}
