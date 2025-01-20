import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20">
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Women's Category */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-purple-100"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Women's Collection</h3>
                <p className="text-gray-600 mb-4">
                  Discover stunning rave wear and festival fashion for women
                </p>
                <a
                  href="/product-category/women"
                  className="text-purple-600 font-semibold hover:text-purple-700"
                >
                  Shop Women's →
                </a>
              </div>
            </div>

            {/* Men's Category */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-blue-100"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Men's Collection</h3>
                <p className="text-gray-600 mb-4">
                  Find comfortable and stylish festival wear for men
                </p>
                <a
                  href="/product-category/men"
                  className="text-purple-600 font-semibold hover:text-purple-700"
                >
                  Shop Men's →
                </a>
              </div>
            </div>

            {/* Accessories Category */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-pink-100"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Accessories</h3>
                <p className="text-gray-600 mb-4">
                  Complete your look with our festival accessories
                </p>
                <a
                  href="/product-category/accessories"
                  className="text-purple-600 font-semibold hover:text-purple-700"
                >
                  Shop Accessories →
                </a>
              </div>
            </div>
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
          <form className="max-w-md mx-auto flex gap-4">
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
        </div>
      </section>
    </div>
  );
}
