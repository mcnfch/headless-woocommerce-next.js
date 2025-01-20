/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['woo.groovygallerydesigns.com'],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3010', 'dev.groovygallerydesigns.com'],
      bodySizeLimit: '2mb'
    },
  },
}

module.exports = nextConfig
