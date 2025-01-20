'use client';

import {Fragment, useState} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {XMarkIcon, ShoppingCartIcon} from "@heroicons/react/24/outline";
import {useShoppingCart, formatCurrencyString} from 'use-shopping-cart';
import CartItem from './cart-item';
import OpenCart from "./open-cart";

type Props = {
    open?: boolean;
    onClose?: () => void;
}

export default function CartModal({ open: controlledOpen, onClose }: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const {cartCount, cartDetails, totalPrice} = useShoppingCart();
    const [isLoading, setIsLoading] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const handleClose = isControlled ? onClose : () => setInternalOpen(false);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cartDetails }),
            });

            const data = await response.json();
            
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }

            window.location.href = data.url;
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {!isControlled && (
                <button aria-label="Open cart" onClick={() => setInternalOpen(true)}>
                    <OpenCart/>
                </button>
            )}
            <Transition.Root show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                                <div className="flex items-start justify-between">
                                                    <Dialog.Title className="text-lg font-medium text-black">
                                                        Shopping cart
                                                    </Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="relative -m-2 p-2 text-black hover:text-gray-500"
                                                            onClick={handleClose}
                                                        >
                                                            <span className="absolute -inset-0.5"/>
                                                            <span className="sr-only">Close panel</span>
                                                            <XMarkIcon className="h-6 w-6" aria-hidden="true"/>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    <div className="flow-root">
                                                        <ul role="list" className="grid grid-cols-1 divide-y divide-gray-200">
                                                            {cartCount && cartCount > 0
                                                                ? Object.values(cartDetails ?? {}).map((item) => (
                                                                    <CartItem key={item.id} item={item}/>
                                                                ))
                                                                : <div
                                                                    className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                                                                    <ShoppingCartIcon className="h-16 text-black"/>
                                                                    <p className="mt-6 text-center text-2xl font-bold text-black">Your
                                                                        cart is empty.</p>
                                                                </div>
                                                            }
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                                <div className="flex justify-between text-base font-medium text-black">
                                                    <p>Subtotal</p>
                                                    <p>{formatCurrencyString({
                                                        value: totalPrice || 0,
                                                        currency: "USD"
                                                    })}</p>
                                                </div>
                                                <p className="mt-0.5 text-sm text-black">Shipping and taxes calculated at
                                                    checkout.</p>
                                                <div className="mt-6">
                                                    <button
                                                        onClick={handleCheckout}
                                                        disabled={!cartCount || isLoading}
                                                        className={`w-full flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm ${
                                                            !cartCount
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : isLoading
                                                                    ? 'bg-gray-700 cursor-wait'
                                                                    : 'bg-black hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {isLoading ? 'Loading...' : 'Checkout'}
                                                    </button>
                                                </div>
                                                <div
                                                    className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                                    <p>
                                                        or
                                                        <button
                                                            type="button"
                                                            className="font-medium text-black hover:text-gray-700 px-2"
                                                            onClick={handleClose}
                                                        >
                                                            Continue Shopping
                                                            <span aria-hidden="true"> &rarr;</span>
                                                        </button>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    );
}
