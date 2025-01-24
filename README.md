# Groovy Gallery Designs - Next.js E-commerce Platform

A modern, feature-rich e-commerce platform built with Next.js 15, WooCommerce integration, and Stripe payments.

## Features

### 🛍️ Shopping Experience
- **Product Catalog**
  - Dynamic product listings with categories
  - Advanced product filtering and search
  - Product image galleries with zoom functionality
  - Detailed product descriptions and variants
  - Related products suggestions

- **Shopping Cart**
  - Real-time cart updates
  - Persistent cart storage using Redis
  - Multiple product variants support
  - Quantity adjustments
  - Cart summary with totals

- **Checkout Process**
  - Secure Stripe payment integration
  - Guest checkout support
  - Order summary review
  - Success/Cancel order handling
  - Free shipping thresholds

### 👤 User Features
- **Account Management**
  - User registration and login
  - Order history
  - Account details management
  - Saved shipping addresses

- **Custom Designs**
  - Custom design request system
  - Project requirements submission
  - Design consultation booking

### 📱 User Interface
- **Responsive Design**
  - Mobile-first approach
  - Tailwind CSS styling
  - Optimized for all screen sizes
  - Modern UI components using HeadlessUI

- **Enhanced UX**
  - Newsletter subscription with Mailchimp
  - Social sharing buttons
  - Blog carousel for content
  - Loading states and animations

### 🔧 Technical Features
- **Performance**
  - Server-side rendering
  - Image optimization
  - Redis caching
  - Sitemap generation

  ![Performance Metrics](public/images/Screenshot%202025-01-24%20at%206.36.36%20PM.png)
  *Lighthouse performance score showing optimal loading and rendering metrics*

- **Security**
  - Iron Session management
  - Secure payment processing
  - Rate limiting on API routes
  - CORS protection

- **Integration**
  - WooCommerce REST API
  - Stripe Payment Gateway
  - Mailchimp Marketing
  - Social media sharing

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- Redis 6.x or higher (Memory Database)
- PM2 for production deployment
- HTTPS for production environment
- Git for version control
- npm or yarn package manager

### WordPress Requirements
#### Core Setup
- WordPress 6.x or higher
- WooCommerce 8.x or higher
- PHP 8.1 or higher
- MySQL 8.0 or higher

#### Required API Access
1. **WordPress REST API**
   - User management endpoints enabled
   - Posts and pages endpoints enabled
   - Basic Authentication enabled

2. **WooCommerce REST API**
   - Products and categories endpoints
   - Customers endpoints
   - Orders endpoints
   - Coupons endpoints
   - Store API enabled for cart operations

#### Required WordPress Plugins
1. **WooCommerce**
   - WooCommerce REST API enabled
   - WooCommerce Store API enabled
   - Basic Authentication enabled for REST API

2. **Additional Plugins**
   - Advanced Custom Fields (ACF) Pro
   - WooCommerce Stripe Gateway
   - WP REST Cache (recommended for performance)
   - Yoast SEO
   - WP-Optimize (recommended for performance)

### Development Tools
- Visual Studio Code or similar IDE
- Redis Commander (optional, for Redis management)
- Postman or similar (for API testing)
- Chrome DevTools or similar browser tools

### Cloud Services Accounts
1. **WooCommerce**
   - WordPress hosting account
   - WooCommerce store setup
   - REST API consumer key and secret
   - CORS configured for your domain

2. **Stripe**
   - Stripe account
   - API keys (publishable and secret)
   - Webhook secret for order processing
   - Stripe CLI for local testing

3. **Mailchimp**
   - Mailchimp account
   - API key
   - Audience ID
   - Server prefix

4. **Redis**
   - Local Redis server for development
   - Production Redis server with sufficient memory for cart data
   - Basic Redis security configuration

### Environment Variables
Create `.env.development` and `.env.production` with:
```env
# WooCommerce
PUBLIC_API_PROVIDER=Woocommerce
PUBLIC_DOMAIN=your-domain.com
PUBLIC_HTTP_ENDPOINT=https://your-woo-endpoint.com

# Stripe
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx

# Redis
REDIS_URL=redis://localhost:6379

# Session
SESSION_PASSWORD=your-secure-password

# Mailchimp
MAILCHIMP_API_KEY=xxx
MAILCHIMP_SERVER_PREFIX=xxx
MAILCHIMP_AUDIENCE_ID=xxx
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ggd-next-woo.git
cd ggd-next-woo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start Redis server:
```bash
redis-server
```

5. Run development server:
```bash
npm run dev
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server with PM2
- `npm run stop` - Stop PM2 server
- `npm run generate-sitemaps` - Generate sitemaps

## Production Deployment

1. Set up production environment variables
2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm run start
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **State Management**: React Hooks, Context API
- **Payment**: Stripe
- **Caching**: Redis
- **CMS**: WooCommerce
- **Email Marketing**: Mailchimp
- **Deployment**: PM2

## Support

For support, email support@groovygallerydesigns.com or open an issue in the repository.

## License

Proprietary - All Rights Reserved
