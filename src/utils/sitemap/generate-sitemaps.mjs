import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { create } from 'xmlbuilder2';
import { WooCommerceClient } from './woocommerce.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://groovygallerydesigns.com';
const PUBLIC_DIR = path.join(path.resolve(__dirname, '..', '..', '..'), 'public');

// Ensure the public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const formatDate = (date) => {
  return date ? new Date(date).toISOString() : new Date().toISOString();
};

const createSitemapXML = (items) => {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
                     'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1' });

  items.forEach(item => {
    const url = doc.ele('url');
    url.ele('loc').txt(item.loc);
    url.ele('lastmod').txt(formatDate(item.lastmod));
    url.ele('changefreq').txt(item.changefreq || 'daily');
    url.ele('priority').txt(item.priority.toString());

    // Add image data if present
    if (item.images && item.images.length > 0) {
      item.images.forEach(image => {
        const imageEle = url.ele('image:image');
        imageEle.ele('image:loc').txt(image.url);
        if (image.title) imageEle.ele('image:title').txt(image.title);
        if (image.caption) imageEle.ele('image:caption').txt(image.caption);
      });
    }
  });

  return doc.end({ prettyPrint: true });
};

const generateProductsSitemap = async () => {
  try {
    console.log('Fetching products from WooCommerce API...');
    const products = await WooCommerceClient.get('products', { 
      per_page: 100,
      status: 'publish'
    }).catch(error => {
      console.error('WooCommerce API Error:', error.response ? error.response.data : error.message);
      return { data: [] };
    });
    
    if (!products.data || products.data.length === 0) {
      console.log('No products found or error accessing WooCommerce API');
      return;
    }

    console.log(`Found ${products.data.length} products`);
    const items = products.data.map(product => ({
      loc: `${SITE_URL}/product/${product.slug}`,
      lastmod: product.modified,
      changefreq: 'daily',
      priority: 0.8,
      images: product.images.map(image => ({
        url: image.src,
        title: image.alt || product.name,
        caption: image.alt || product.name
      }))
    }));

    const xml = createSitemapXML(items);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-products.xml'), xml);
    console.log('Products sitemap generated successfully');
  } catch (error) {
    console.error('Error generating products sitemap:', error);
  }
};

const generateCategoriesSitemap = async () => {
  try {
    console.log('Fetching categories from WooCommerce API...');
    const categories = await WooCommerceClient.get('products/categories', { 
      per_page: 100,
      hide_empty: true 
    }).catch(error => {
      console.error('WooCommerce API Error:', error.response ? error.response.data : error.message);
      return { data: [] };
    });
    
    if (!categories.data || categories.data.length === 0) {
      console.log('No categories found or error accessing WooCommerce API');
      return;
    }

    console.log(`Found ${categories.data.length} categories`);
    const items = categories.data.map(category => ({
      loc: `${SITE_URL}/categories/${category.slug}`,
      lastmod: category.modified || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
      images: category.image ? [{
        url: category.image.src,
        title: category.name,
        caption: category.description
      }] : []
    }));

    const xml = createSitemapXML(items);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-categories.xml'), xml);
    console.log('Categories sitemap generated successfully');
  } catch (error) {
    console.error('Error generating categories sitemap:', error);
  }
};

const generateBlogSitemap = async () => {
  try {
    console.log('Fetching blog posts from WooCommerce API...');
    const posts = await WooCommerceClient.get('posts', { 
      per_page: 100,
      status: 'publish'
    }).catch(error => {
      console.error('WooCommerce API Error:', error.response ? error.response.data : error.message);
      return { data: [] };
    });
    
    if (!posts.data || posts.data.length === 0) {
      console.log('No blog posts found or error accessing WooCommerce API');
      return;
    }

    console.log(`Found ${posts.data.length} blog posts`);
    const items = posts.data.map(post => ({
      loc: `${SITE_URL}/blog/${post.slug}`,
      lastmod: post.modified,
      changefreq: 'weekly',
      priority: 0.6,
      images: post.featured_media ? [{
        url: post.featured_media,
        title: post.title.rendered,
        caption: post.excerpt.rendered
      }] : []
    }));

    const xml = createSitemapXML(items);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-blog.xml'), xml);
    console.log('Blog sitemap generated successfully');
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
  }
};

const generateImagesSitemap = async () => {
  try {
    const wooCommerce = WooCommerceClient;
    const products = await wooCommerce.get('products', { per_page: 100 });
    
    const items = [];
    products.data.forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.forEach(image => {
          items.push({
            loc: `${SITE_URL}/product/${product.slug}`,
            lastmod: product.modified,
            changefreq: 'weekly',
            priority: 0.6,
            images: [{
              url: image.src,
              title: image.alt || product.name,
              caption: image.alt || product.name
            }]
          });
        });
      }
    });

    const xml = createSitemapXML(items);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-images.xml'), xml);
    console.log('Images sitemap generated successfully');
  } catch (error) {
    console.error('Error generating images sitemap:', error);
  }
};

// Main function to generate all sitemaps
export const generateAllSitemaps = async () => {
  console.log('Starting sitemap generation...');
  console.log('Using WordPress URL:', process.env.NEXT_PUBLIC_WORDPRESS_URL);
  
  try {
    await Promise.all([
      generateProductsSitemap(),
      generateCategoriesSitemap(),
      generateBlogSitemap(),
      generateImagesSitemap()
    ]);
    console.log('All sitemaps generated successfully');
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    process.exit(1);
  }
};

// If running directly (not imported)
if (import.meta.url === `file://${__filename}`) {
  generateAllSitemaps().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
