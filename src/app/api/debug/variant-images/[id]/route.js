import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const startTime = Date.now();
  const id = params.id;
  
  try {
    // First fetch to get variation IDs
    const productResponse = await fetch(
      `https://woo.groovygallerydesigns.com/wp-json/wc/v3/products/${id}`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`
          ).toString('base64'),
          'Content-Type': 'application/json'
        }
      }
    );

    const product = await productResponse.json();
    const variantImages = [];

    // Fetch all variations in parallel
    if (product.variations && product.variations.length > 0) {
      const variantPromises = product.variations.map(variantId => 
        fetch(
          `https://woo.groovygallerydesigns.com/wp-json/wc/v3/products/${id}/variations/${variantId}`,
          {
            headers: {
              'Authorization': 'Basic ' + Buffer.from(
                `${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`
              ).toString('base64'),
              'Content-Type': 'application/json'
            }
          }
        ).then(res => res.json())
      );

      const variants = await Promise.all(variantPromises);
      variants.forEach(variant => {
        if (variant.image) {
          variantImages.push({
            id: variant.id,
            image: variant.image,
            attributes: variant.attributes
          });
        }
      });
    }

    const endTime = Date.now();
    const timeTaken = endTime - startTime;

    return NextResponse.json({
      success: true,
      timeTaken,
      variantCount: variantImages.length,
      variantImages
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
