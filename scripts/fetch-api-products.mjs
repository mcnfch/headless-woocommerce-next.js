import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import fs from 'fs/promises';
import path from 'path';

const api = new WooCommerceRestApi.default({
  url: 'https://woo.groovygallerydesigns.com',
  consumerKey: 'ck_90846993a7f31d0c512aee435ac278edd2b07a63',
  consumerSecret: 'cs_8cccc3b94095049498243682dc77f6f5bf502e84',
  version: "wc/v3",
  queryStringAuth: true
});

async function fetchAllProducts() {
  let page = 1;
  let allProducts = [];
  
  while (true) {
    try {
      const response = await api.get("products", {
        per_page: 100,
        page: page
      });
      
      if (response.data.length === 0) break;
      
      allProducts = [...allProducts, ...response.data];
      page++;
      
    } catch (error) {
      console.error('Error fetching products:', error);
      break;
    }
  }
  
  return allProducts;
}

async function main() {
  console.log('Starting API fetch...');
  const startTime = process.hrtime();
  
  try {
    const products = await fetchAllProducts();
    await fs.writeFile(
      path.join(process.cwd(), 'data1.json'), 
      JSON.stringify(products, null, 2)
    );
    
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    
    console.log(`Successfully wrote ${products.length} products to data1.json`);
    console.log(`Total execution time: ${executionTime}ms`);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();
