import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { initializeServer } from './init';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Groovy Gallery Designs | Festival Fashion & Accessories",
  description: "Shop the latest festival fashion, rave wear, and accessories. Find unique styles for men and women, plus essential festival gear.",
};

export default async function RootLayout({ children }) {
  // Initialize database when app starts on server side
  const initResult = await initializeServer();
  console.log('Initialization result:', initResult);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow glass-background">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
