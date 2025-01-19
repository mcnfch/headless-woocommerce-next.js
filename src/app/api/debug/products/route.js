import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let allProducts = [];
    let page = 1;
    const perPage = 100;

    // Fetch first page to get total
    const firstResponse = await fetch(
      'https://woo.groovygallerydesigns.com/wp-json/wc/v3/products?_fields=id&per_page=1',
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`
          ).toString('base64'),
          'Content-Type': 'application/json'
        }
      }
    );

    const totalProducts = parseInt(firstResponse.headers.get('X-WP-Total'));
    const totalPages = Math.ceil(totalProducts / perPage);

    // Fetch all pages
    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      const response = await fetch(
        `https://woo.groovygallerydesigns.com/wp-json/wc/v3/products?_fields=id&per_page=${perPage}&page=${currentPage}`,
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              `${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`
            ).toString('base64'),
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      allProducts = [...allProducts, ...products];
    }

    return NextResponse.json({ 
      products: allProducts,
      total: totalProducts 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
