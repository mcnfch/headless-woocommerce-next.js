'use client'

import React from 'react'
import {CartProvider as USCProvider} from 'use-shopping-cart'

type Props = {
    children: React.ReactNode
}

export default function CartProvider({children}: Props) {
    return (
        <USCProvider
            mode="payment"
            cartMode="checkout-session"
            stripe={process.env.NEXT_PUBLIC_TEST_STRIPE_PUBLISHABLE_KEY as string}
            currency={'USD'}
            successUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/success`}
            cancelUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/cancel`}
            allowedCountries={['US', 'GB', 'CA']}
            billingAddressCollection={true}
        >
            {children}
        </USCProvider>
    )
}
