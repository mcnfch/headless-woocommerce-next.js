import Link from 'next/link';
import Image from 'next/image';
import { fetchFooterPages } from '@/utils/api';
import BlogCarousel from '@/components/BlogCarousel';
import { FaFacebook, FaInstagram, FaTiktok, FaPinterest } from 'react-icons/fa';

export default async function Footer() {
    const footerPages = await fetchFooterPages();

    const footerLinks = [
        {
            title: 'Company',
            links: [
                { name: 'About Us', href: '/about-us', key: 'about-us' },
                { name: 'Shipping', href: '/shipping', key: 'shipping' },
                { name: 'Our Sustainability Practices', href: '/our-sustainability-practices', key: 'sustainability' },
                { name: 'Refunds and Returns', href: '/refunds-and-returns', key: 'refunds-and-returns' },
            ],
        },
    ];

    return (
        <footer className="bg-black text-white">
            <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                {/* Social Icons - Mobile First */}
                <div className="flex justify-center space-x-4 sm:space-x-6 py-4">
                    <Link href="https://www.facebook.com/groovygalleryd" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                        <FaFacebook className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="sr-only">Facebook</span>
                    </Link>
                    <Link href="https://www.instagram.com/groovygallerydesigns" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                        <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                    <Link href="https://www.tiktok.com/@groovygallerydesigns" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                        <FaTiktok className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="sr-only">TikTok</span>
                    </Link>
                    <Link href="https://www.pinterest.com/groovygallerydesigns" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                        <FaPinterest className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="sr-only">Pinterest</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and Description */}
                    <div>
                        <Link href="/" className="block mb-4 w-48">
                            <Image
                                src="/images/GGLogo2.0.png"
                                alt="Groovy Gallery Designs"
                                width={192}
                                height={48}
                                className="w-full h-auto"
                            />
                        </Link>
                        <p className="mt-4 text-sm text-gray-300">
                            Festival fashion and accessories for the free-spirited soul.
                        </p>
                    </div>

                    {/* Footer Links */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-300 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Blog Section - Replacing Connect section */}
                    <div>
                        <div className="text-white">
                            <Link href="/blog" className="text-lg font-semibold hover:text-purple-400 transition-colors">
                                Blog
                            </Link>
                        </div>
                        <BlogCarousel />
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 border-t border-gray-800 pt-8 text-center">
                    <p className="text-sm text-gray-400">
                        {new Date().getFullYear()} Groovy Gallery Designs. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
