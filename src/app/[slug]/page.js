import { fetchFooterPages } from '@/utils/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    try {
        const pages = await fetchFooterPages();
        const page = pages[slug];

        if (!page) {
            return {
                title: 'Page Not Found | Groovy Gallery Designs',
            };
        }

        return {
            title: `${page.title} | Groovy Gallery Designs`,
            description: page.content.slice(0, 155).replace(/<[^>]*>/g, '')
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Error | Groovy Gallery Designs',
        };
    }
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    try {
        const pages = await fetchFooterPages();
        const page = pages[slug];

        if (!page || !Object.keys(pages).length) {
            return (
                <div className="min-h-screen bg-transparent">
                    <div className="container mx-auto px-4 py-16">
                        <div className="max-w-[800px] mx-auto bg-white/75 p-[25px]">
                            <h2 className="text-4xl font-bold mb-6 text-black">Page Not Found</h2>
                            <p className="text-black mb-4">Sorry, the page you're looking for doesn't exist or is temporarily unavailable.</p>
                            <a href="/" className="text-blue-600 hover:text-blue-800">Return to Home</a>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-transparent">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-[800px] mx-auto bg-white/75 p-[25px]">
                        <h2 className="text-4xl font-bold mb-12 text-black" 
                            dangerouslySetInnerHTML={{ __html: page.title }} />
                        <div 
                            className="prose max-w-none text-black
                                prose-headings:text-black prose-headings:font-bold
                                prose-h1:text-3xl prose-h1:mb-8 prose-h1:leading-tight
                                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-tight prose-h2:font-bold
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-bold
                                prose-p:text-base prose-p:leading-relaxed prose-p:mb-6
                                prose-li:text-base prose-li:leading-relaxed
                                prose-ul:my-6 prose-ol:my-6
                                prose-li:my-2 prose-li:pl-2
                                prose-strong:font-bold prose-strong:text-black
                                [&>*:first-child]:mt-0
                                [&>*:last-child]:mb-0
                                [&_strong:first-child]:block [&_strong:first-child]:text-xl [&_strong:first-child]:font-bold [&_strong:first-child]:mt-10 [&_strong:first-child]:mb-4"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error rendering page:', error);
        return (
            <div className="min-h-screen bg-transparent">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-[800px] mx-auto bg-white/75 p-[25px]">
                        <h2 className="text-4xl font-bold mb-6 text-black">Error Loading Page</h2>
                        <p className="text-black mb-4">Sorry, there was an error loading this page. Please try again later.</p>
                        <a href="/" className="text-blue-600 hover:text-blue-800">Return to Home</a>
                    </div>
                </div>
            </div>
        );
    }
}

export async function generateStaticParams() {
    try {
        const pages = await fetchFooterPages();
        return Object.keys(pages).map((slug) => ({ slug }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}
