'use client';

import {ShoppingCartIcon} from '@heroicons/react/24/outline';
import {useShoppingCart} from 'use-shopping-cart';

export default function OpenCart() {
    const {cartCount} = useShoppingCart();

    return (
        <div className="relative flex h-11 w-11 items-center justify-center text-white transition-colors">
            <ShoppingCartIcon className="h-6 transition-all ease-in-out hover:text-gray-300"/>
            {cartCount ? (
                <div className="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded bg-sky-500 text-[11px] font-medium text-white flex items-center justify-center">
                    {cartCount}
                </div>
            ) : null}
        </div>
    );
}
