import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const api = new WooCommerceRestApi({
  url: process.env.PUBLIC_HTTP_ENDPOINT,
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: "wc/v3",
});

const desiredCategories = [
  "new-arrivals",
  "accessories",
  "women",
  "men",
  "groovy-gear",
  "custom-designs"
];

export async function getTopLevelCategories() {
  try {
    const { data } = await api.get("products/categories", {
      per_page: 100,
      hide_empty: false
    });

    // Filter and sort categories according to our desired order
    const categories = desiredCategories
      .map(slug => data.find(cat => cat.slug === slug))
      .filter(Boolean);

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image ? {
        src: category.image.src,
        alt: category.image.alt || category.name,
      } : null,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}