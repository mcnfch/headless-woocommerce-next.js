'use client';

import {formatCurrencyString, useShoppingCart} from "use-shopping-cart";
import {CartItem} from "@/types/type";
import {XMarkIcon} from "@heroicons/react/24/outline";
import Image from 'next/image';

type Props = {
    item: CartItem
}

export default function CartItem({item}: Props) {
    const {name, quantity, price, image} = item;
    const {removeItem} = useShoppingCart();

    const handleRemoveItem = () => {
        removeItem(item.id);
    };

    return (
        <div className="flex items-center gap-4 py-3 text-black">
            {image && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <Image
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover object-center"
                        width={64}
                        height={64}
                    />
                </div>
            )}
            <div className="flex flex-col flex-grow min-w-0">
                <div className="text-sm font-medium truncate">{name}</div>
                <div className="text-sm text-gray-500">Qty: {quantity}</div>
                {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, value]) => (
                    <div key={key} className="text-xs text-gray-500">
                        {key}: {value}
                    </div>
                ))}
            </div>
            <div className="text-sm font-medium whitespace-nowrap">
                {formatCurrencyString({value: price, currency: "USD"})}
            </div>
            <button
                onClick={() => handleRemoveItem()}
                className="hover:bg-gray-100 transition-colors rounded-full duration-500 p-1"
            >
                <XMarkIcon className="h-4 w-4 text-red-500" aria-hidden="true"/>
            </button>
        </div>
    )
}
