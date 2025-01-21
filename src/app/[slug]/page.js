import { fetchFooterPages } from '@/utils/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    const pages = await fetchFooterPages();
    const page = pages[slug];

    if (!page) {
        return {
            title: 'Page Not Found',
        };
    }

    return {
        title: `${page.title} | Groovy Gallery Designs`,
        description: page.content.slice(0, 155)
    };
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    const pages = await fetchFooterPages();
    const page = pages[slug];

    if (!page) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-[800px] mx-auto bg-white/75 p-[25px]">
                    <h1 className="text-4xl font-bold mb-12 text-black">{page.title}</h1>
                    <div 
                        className="prose max-w-none text-black
                            prose-headings:text-black prose-headings:font-bold
                            prose-h1:text-3xl prose-h1:mb-8 prose-h1:leading-tight
                            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:leading-tight
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:text-base prose-p:leading-relaxed prose-p:mb-6
                            prose-li:text-base prose-li:leading-relaxed
                            prose-ul:my-6 prose-ol:my-6
                            prose-li:my-2 prose-li:pl-2
                            prose-strong:font-bold
                            [&>*:first-child]:mt-0
                            [&>*:last-child]:mb-0
                            [&_ul]:space-y-2 [&_ol]:space-y-2
                            [&_ul>li]:relative [&_ol>li]:relative
                            [&_ul>li:before]:absolute [&_ol>li:before]:absolute
                            [&_ul>li:before]:-left-4 [&_ol>li:before]:-left-4"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </div>
        </div>
    );
}

// Generate static paths for footer pages
export async function generateStaticParams() {
    const pages = await fetchFooterPages();
    return Object.keys(pages).map((key) => ({
        slug: key,
    }));
}
