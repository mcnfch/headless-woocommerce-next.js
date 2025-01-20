# Groovy Gallery Designs - Next.js WooCommerce App

A Next.js application that integrates with WooCommerce and uses Redis for high-performance product caching.

## Features

- Next.js 13+ App Router
- WooCommerce Integration
- Redis Caching
- Product Category Navigation
- Fast Product Search
- Responsive Design

## Getting Started

First, set up your environment variables:

```bash
# WooCommerce API credentials
NEXT_PUBLIC_WORDPRESS_URL=your-woocommerce-site-url
NEXT_PUBLIC_WOOCOMMERCE_KEY=your-consumer-key
NEXT_PUBLIC_WOOCOMMERCE_SECRET=your-consumer-secret

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

The server will start on [http://localhost:3010](http://localhost:3010).

## Product Database Schema

### Data Storage

Products are stored in two locations:
1. JSON file cache (`/data/products.json`)
2. Redis database

### Redis Schema

Products are stored in Redis using the following key patterns:

1. Product by ID:
```
Key: product:{id}
Type: String (JSON)
Example: product:123 -> {"id": 123, "name": "Cool Shirt", ...}
```

2. Product by Slug:
```
Key: product_slug:{slug}
Type: String (JSON)
Example: product_slug:cool-shirt -> {"id": 123, "name": "Cool Shirt", ...}
```

3. Category Products:
```
Key: category:{slug}
Type: Set
Example: category:accessories -> [123, 456, 789]
```

### Product JSON Schema

Products are stored with the following structure:

```json
{
  "id": number,
  "name": string,
  "slug": string,
  "permalink": string,
  "date_created": string,
  "date_modified": string,
  "type": string,
  "status": string,
  "featured": boolean,
  "catalog_visibility": string,
  "description": string,
  "short_description": string,
  "sku": string,
  "price": string,
  "regular_price": string,
  "sale_price": string,
  "date_on_sale_from": string|null,
  "date_on_sale_to": string|null,
  "on_sale": boolean,
  "purchasable": boolean,
  "total_sales": number,
  "virtual": boolean,
  "downloadable": boolean,
  "downloads": Array<{
    "id": string,
    "name": string,
    "file": string
  }>,
  "download_limit": number,
  "download_expiry": number,
  "tax_status": string,
  "tax_class": string,
  "manage_stock": boolean,
  "stock_quantity": number|null,
  "stock_status": string,
  "backorders": string,
  "backorders_allowed": boolean,
  "backordered": boolean,
  "low_stock_amount": number|null,
  "sold_individually": boolean,
  "weight": string,
  "dimensions": {
    "length": string,
    "width": string,
    "height": string
  },
  "shipping_required": boolean,
  "shipping_taxable": boolean,
  "shipping_class": string,
  "shipping_class_id": number,
  "reviews_allowed": boolean,
  "average_rating": string,
  "rating_count": number,
  "images": Array<{
    "id": number,
    "date_created": string,
    "date_modified": string,
    "src": string,
    "name": string,
    "alt": string
  }>,
  "attributes": Array<{
    "id": number,
    "name": string,
    "position": number,
    "visible": boolean,
    "variation": boolean,
    "options": Array<string>
  }>,
  "categories": Array<{
    "id": number,
    "name": string,
    "slug": string
  }>,
  "tags": Array<{
    "id": number,
    "name": string,
    "slug": string
  }>,
  "variations": Array<number>,
  "related_ids": Array<number>
}
```

## Database Initialization

The application automatically initializes the product database on startup:

1. Checks if `/data/products.json` exists and is up-to-date
2. If needed, fetches fresh product data from WooCommerce
3. Stores products in both JSON file and Redis
4. Maintains indices for fast lookups by ID, slug, and category

### Cache Invalidation

The product cache is invalidated when:
- The total number of products in WooCommerce changes
- The server restarts with an empty Redis database

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Redis Documentation](https://redis.io/docs)

## Deploy

The application can be deployed to any platform that supports Next.js, such as:
- [Vercel](https://vercel.com)
- [AWS](https://aws.amazon.com)
- [DigitalOcean](https://www.digitalocean.com)

Make sure to configure environment variables and Redis connection on your chosen platform.
