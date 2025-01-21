import './globals.css'
import { Inter } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Suspense } from 'react'
import WooCommerceCartProvider from '../components/cart/CartProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Groovy Gallery Designs',
  description: 'Festival and Rave Fashion',
  icons: {
    icon: '/images/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WooCommerceCartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </WooCommerceCartProvider>
      </body>
    </html>
  );
}
