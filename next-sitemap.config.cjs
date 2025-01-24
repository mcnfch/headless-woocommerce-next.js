const { config } = require('dotenv');
const { resolve } = require('path');

// Load environment variables
const env = process.env.NODE_ENV || 'development';
config({ path: resolve(process.cwd(), `.env.${env}`) });
config({ path: resolve(process.cwd(), '.env') });

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Default to development URL, override in production
  siteUrl: `https://${process.env.PUBLIC_DOMAIN}`,
  generateRobotsTxt: true,
  exclude: [
    '/server-sitemap.xml', // Exclude server-side generated sitemap
    '/admin/*',
    '/api/*',
    '/debug/*'
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      // Add dynamic sitemap for products
      `https://${process.env.PUBLIC_DOMAIN}/server-sitemap.xml`,
    ],
  },
  // Only generate sitemap in production build
  outDir: process.env.NODE_ENV === 'production' ? 'public' : '.next/static',
}
