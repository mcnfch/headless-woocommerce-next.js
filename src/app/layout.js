import './globals.css'
import { Inter } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Suspense } from 'react'
import WooCommerceCartProvider from '../components/cart/CartProvider';
import { AuthProvider } from '../hooks/useAuth';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Groovy Gallery Designs',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script 
          async 
          src="https://ackee.info/tracker.js" 
          data-ackee-server="https://ackee.info" 
          data-ackee-domain-id="17d1733a-818c-4b79-b974-a885556b55d9"
        ></script>
        <AuthProvider>
          <WooCommerceCartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </WooCommerceCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
