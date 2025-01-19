import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Festival Fashion & Accessories
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Express yourself with our unique collection of rave wear and festival gear
          </p>
          <a
            href="/product-category/new-arrivals"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop New Arrivals
          </a>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
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

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Product placeholders - will be replaced with actual products */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Festival Item {item}</h3>
                  <p className="text-gray-600 mb-2">$49.99</p>
                  <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors">
                    Add to Cart
                  </button>
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
