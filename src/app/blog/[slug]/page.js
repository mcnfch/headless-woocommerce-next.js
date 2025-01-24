import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButtons from '@/components/ShareButtons';

async function getBlogPost(slug) {
    if (!slug) {
        return null;
    }

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
            { 
                next: { revalidate: 3600 },
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch blog post');
        }
        
        const posts = await response.json();
        if (!posts || posts.length === 0) {
            return null;
        }
        return posts[0];
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

export default async function BlogPost(props) {
    const params = await Promise.resolve(props.params);
    const slug = params?.slug;

    if (!slug) {
        notFound();
    }

    const post = await getBlogPost(slug);
    
    if (!post) {
        notFound();
    }

    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
    const imageUrl = featuredMedia?.source_url || null;
    const date = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="bg-white py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back to Blog Link */}
                <Link 
                    href="/blog"
                    className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors mb-8"
                >
                    <svg 
                        className="mr-2 h-5 w-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                        />
                    </svg>
                    Back to Blog
                </Link>

                {/* Article Header */}
                <header className="mb-12 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 
                            className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                        <div className="flex justify-center items-center space-x-6 text-gray-600 mb-8">
                            <time className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {date}
                            </time>
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                5 min read
                            </span>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {imageUrl && (
                    <div className="relative aspect-[16/9] mb-12 rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={imageUrl}
                            alt={featuredMedia?.alt_text || post.title.rendered}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Social Share Buttons */}
                <ShareButtons 
                    title={post.title.rendered}
                    imageUrl={imageUrl}
                />

                {/* Article Content */}
                <div 
                    className="prose prose-lg max-w-none text-black
                        prose-headings:font-bold prose-headings:text-black
                        prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:mb-8 prose-h1:leading-tight
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-purple-100
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-800 hover:prose-a:underline
                        prose-strong:text-black prose-strong:font-semibold
                        prose-ul:my-6 prose-ul:list-none
                        prose-ol:my-6 prose-ol:pl-0
                        prose-li:mb-4 prose-li:leading-relaxed
                        prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                        prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-purple-50 prose-blockquote:py-2 prose-blockquote:rounded-r-lg"
                >
                    {/* Key Takeaways Section */}
                    <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-blue-50 rounded-xl p-8 my-12 shadow-md">
                        <h2 className="text-2xl font-bold mb-6 text-purple-900 flex items-center">
                            <span className="text-3xl mr-3">💫</span>
                            Key Takeaways for Hulaween 2024
                        </h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-900">
                            {[
                                ["🏕️", "Plan your arrival and camping strategy early"],
                                ["👗", "Express yourself with creative festival fashion"],
                                ["📱", "Download the official Hula app for updates"],
                                ["💧", "Stay hydrated and energized throughout"],
                                ["📜", "Know and follow festival policies"],
                                ["🎨", "Explore the art installations"],
                                ["🎵", "Experience diverse music lineup"],
                                ["🤝", "Connect with the Hula community"],
                                ["🌦️", "Prepare for Florida weather"],
                                ["♻️", "Practice Leave No Trace"]
                            ].map(([icon, text], index) => (
                                <li key={index} className="flex items-center bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
                                    <span className="font-medium">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Prohibited Items Section */}
                    <div className="bg-gradient-to-br from-red-50 via-red-100 to-orange-50 rounded-xl p-8 my-12 shadow-md">
                        <h3 className="text-xl font-bold mb-6 text-red-900 flex items-center">
                            <span className="text-3xl mr-3">⚠️</span>
                            Prohibited Items at Hulaween 2024
                        </h3>
                        <ul className="grid gap-3 text-red-900">
                            {[
                                ["🚫", "Weapons of any kind", "Strictly forbidden for safety"],
                                ["⛔", "Illegal substances", "Zero tolerance policy"],
                                ["🛸", "Drones and flying objects", "Including kites and balloons"],
                                ["🏊", "Inflatable pools", "Including slip n' slides"],
                                ["💡", "Lasers", "All types prohibited"],
                                ["🔥", "Fire spinning/twirling", "Unless contracted"],
                                ["🏮", "Floating lanterns", "Fire hazard"]
                            ].map(([icon, item, detail], index) => (
                                <li key={index} className="flex items-center bg-white/50 rounded-lg p-3 shadow-sm">
                                    <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
                                    <div>
                                        <span className="font-medium block">{item}</span>
                                        <span className="text-sm text-red-700/80">{detail}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div 
                        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                        className="mt-12 space-y-6 wordpress-content
                            [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-black [&>h2]:mt-12 [&>h2]:mb-6
                            [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-black [&>h3]:mt-8 [&>h3]:mb-4
                            [&>p]:text-gray-900 [&>p]:leading-relaxed [&>p]:mb-6
                            [&>ul]:list-none [&>ul]:space-y-2 [&>ul]:my-6
                            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>ol]:my-6
                            [&>li]:mb-2 [&>li]:pl-6
                            [&>a]:text-purple-600 [&>a]:no-underline hover:[&>a]:text-purple-800 hover:[&>a]:underline
                            [&>img]:rounded-xl [&>img]:shadow-md [&>img]:my-8"
                    />

                </div>

                {/* Author Bio */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <div className="flex items-center">
                        <Image
                            src="/images/GGLogo2.0.png"
                            alt="Author"
                            width={60}
                            height={60}
                            className="rounded-full"
                        />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-black">Groovy Gallery Designs</h3>
                            <p className="text-gray-600">Explore Groovy Gallery Designs for unique, festival-inspired fashion, bold rave gear, and vibrant campsite essentials. Perfect for self-expression, our psychedelic clothing, retro accessories, and trippy home decor bring the spirit of festivals into your everyday life</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

// Generate static params for static site generation
export async function generateStaticParams() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/posts?per_page=100`
        );
        const posts = await response.json();
        
        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}
