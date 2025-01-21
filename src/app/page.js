import Image from "next/image";
import { getTopLevelCategories } from "@/lib/woocommerce";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const categories = await getTopLevelCategories();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 -mt-[40px]">
        <Image
          src="/images/gg_banner.png"
          alt="Groovy Gallery Designs Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center gap-6">
          <h1 className="text-4xl md:text-6xl font-bold text-black">
            Festival Fashion, Accessories & Groovy Gear
          </h1>
          <p className="text-xl md:text-2xl text-black">
            Express yourself with our unique collection of rave wear and festival gear
          </p>
          <p className="text-xl md:text-2xl text-black">
            Rizz up your campsite with our groovy gear
          </p>
          <a
            href="/category/new-arrivals"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors mt-4"
          >
            Shop New Arrivals
          </a>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-12">
            <h2 className="text-3xl font-bold text-black backdrop-blur-md bg-white/75 py-4 rounded-lg px-8">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative">
                  {category.image && (
                    <Image
                      src={category.image.src}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-semibold mb-2 text-black">{category.name}</h3>
                  <p className="text-black mb-4">{category.description || `Explore our ${category.name} collection`}</p>
                  <a href={`/category/${category.slug}`} className="text-black font-semibold hover:text-purple-700">
                    Shop {category.name} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8">
            Subscribe to get updates on new arrivals and special offers
          </p>
          <form className="max-w-md mx-auto flex gap-4 mb-12">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-full text-gray-900"
            />
            <button
              type="submit"
              className="bg-purple-600 px-8 py-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <div className="mt-8">
            <Image
              src="/images/badges.png"
              alt="Trust Badges"
              width={800}
              height={100}
              className="mx-auto"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
