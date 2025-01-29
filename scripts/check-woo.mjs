import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi.default({
  url: 'https://woo.groovygallerydesigns.com',
  consumerKey: 'ck_90846993a7f31d0c512aee435ac278edd2b07a63',
  consumerSecret: 'cs_8cccc3b94095049498243682dc77f6f5bf502e84',
  version: 'wc/v3'
});

async function getProducts() {
  try {
    const response = await WooCommerce.get('products', {
      per_page: 10,  // Just get first 10 for now
      orderby: 'date',
      order: 'desc'
    });
    
    console.log('Latest 10 products from WooCommerce:');
    response.data.forEach(product => {
      console.log('\nProduct:', product.name);
      console.log('ID:', product.id);
      console.log('Stock Status:', product.stock_status);
      console.log('Manage Stock:', product.manage_stock);
      console.log('Stock Quantity:', product.stock_quantity);
      if (product.variations && product.variations.length > 0) {
        console.log('Has variations:', product.variations.length, 'variants');
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getProducts();
