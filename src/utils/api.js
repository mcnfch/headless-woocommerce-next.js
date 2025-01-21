import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL,
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: "wc/v3"
});

export const fetchMenu = async (menuId) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/menu-items?menus=${menuId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WP_JWT_TOKEN}`
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      console.error('Menu fetch error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
};

// Transform URLs to use local routing
function transformUrl(url) {
  // Handle product category URLs
  if (url.includes('/product-category/')) {
    return `/category/${url.split('/product-category/')[1].replace(/\/$/, '')}`;
  }
  
  // Handle woo.groovygallerydesigns.com URLs
  if (url.includes('woo.groovygallerydesigns.com')) {
    // Extract the path part of the URL
    const urlObj = new URL(url);
    return urlObj.pathname.replace(/\/$/, '');
  }
  
  return url;
}

export const organizeMenuItems = (items) => {
  if (!Array.isArray(items)) {
    console.error('Expected items to be an array, got:', typeof items);
    return [];
  }
  
  const topLevel = items.filter(item => !item.parent);
  const children = items.filter(item => item.parent);

  return topLevel.map(item => ({
    ...item,
    url: transformUrl(item.url),
    children: children
      .filter(child => child.parent === item.id)
      .map(child => ({
        ...child,
        url: transformUrl(child.url)
      }))
      .sort((a, b) => a.menu_order - b.menu_order)
  })).sort((a, b) => a.menu_order - b.menu_order);
};

export const fetchCategories = async () => {
  try {
    const response = await api.get("products/categories", {
      per_page: 100,
      parent: 0
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export async function fetchFooterPages() {
    const pageIds = {
        'about-us': 8380,
        'shipping': 8378,
        'our-sustainability-practices': 8376,
        'refunds-and-returns': 4203
    };

    const pages = {};
    const baseUrl = process.env.PUBLIC_HTTP_ENDPOINT;
    const headers = {
        'Authorization': `Bearer ${process.env.PRIVATE_WP_JWT_TOKEN}`
    };

    try {
        await Promise.all(
            Object.entries(pageIds).map(async ([key, id]) => {
                const response = await fetch(`${baseUrl}/wp-json/wp/v2/pages/${id}`, {
                    headers,
                    next: { revalidate: 3600 } // Cache for 1 hour
                });

                if (!response.ok) {
                    console.error(`Failed to fetch ${key} page:`, response.statusText);
                    return;
                }

                const data = await response.json();
                pages[key] = {
                    title: data.title.rendered,
                    content: data.content.rendered,
                    slug: data.slug
                };
            })
        );

        return pages;
    } catch (error) {
        console.error('Error fetching footer pages:', error);
        return {};
    }
}
