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

export const organizeMenuItems = (items) => {
  if (!Array.isArray(items)) {
    console.error('Expected items to be an array, got:', typeof items);
    return [];
  }
  
  const topLevel = items.filter(item => !item.parent);
  const children = items.filter(item => item.parent);

  return topLevel.map(item => ({
    ...item,
    children: children.filter(child => child.parent === item.id)
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
