import Link from 'next/link';
import Image from 'next/image';
import { fetchFooterPages } from '@/utils/api';

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
        {
            title: 'Connect',
            links: [
                { name: 'Instagram', href: 'https://instagram.com/groovygallerydesigns', external: true },
                { name: 'Facebook', href: 'https://facebook.com/groovygallerydesigns', external: true },
                { name: 'TikTok', href: 'https://tiktok.com/@groovygallerydesigns', external: true },
            ],
        },
    ];

    return (
        <footer className="bg-black text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-300 hover:text-white transition-colors"
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-gray-300 hover:text-white transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
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
