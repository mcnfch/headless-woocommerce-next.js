import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import dotenv from 'dotenv';

dotenv.config();

export const WooCommerceClient = new WooCommerceRestApi.default({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL,
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: "wc/v3",
  queryStringAuth: true
});
