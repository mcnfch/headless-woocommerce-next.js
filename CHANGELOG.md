# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.22] - 2024-01-09
### Fixed
- Fixed Redis port in category page to use port 6310 for development environment
- Fixed MySQL fetch script to properly include categories in product data
- Fixed MySQL fetch script to include both featured images and gallery images
- Fixed attribute query in MySQL fetch script to properly handle product attributes and options
- Modified MySQL fetch script to output clean JSON for better sync integration
- Updated sync script to handle MySQL fetch output and properly clear all Redis keys
- Added product slug and category indexing in Redis for faster lookups

### Changed
- Improved Redis key cleanup to include product slugs and category indices
- Added product count logging to sync script for better monitoring

## [0.0.21] - 2025-01-29
### Added
- Independent Redis instance for development environment on port 6310
- Redis data cloning script for syncing from production
- New MySQL-based product synchronization script

### Changed
- Product data pipeline changed from WooCommerce API → products.json → Redis to direct MySQL → Redis sync
- Redis configuration moved to environment-specific setup (production: 6379, development: 6310)

### Backup Points
#### Pre-MySQL Integration (Version 0.0.20)
- Redis port: 6379
- Product sync: WooCommerce API → products.json → Redis
- Files to restore:
  - src/utils/initializeServer.js (WooCommerce API integration)
  - products.json (cached product data)
  - Original Redis configuration

#### Current Version (0.0.21)
- Redis port: 6310 (development)
- Product sync: MySQL → Redis
- Key files:
  - scripts/time-mysql-fetch.mjs (MySQL integration)
  - redis.conf (development Redis config)
  - scripts/clone-redis.js (Redis data migration)

## [0.0.20] - 2025-01-22
### Fixed
- Category image display on homepage
- Added Next.js image domain configuration for woo.groovygallerydesigns.com
- Fixed Image component configuration in homepage category cards
- Added proper container sizing for category images

### Added
- Cart API routes for managing shopping cart
- Orders API route for order creation
- Payments API route for payment intent creation
- Cart page layout and functionality
- Checkout page with payment form
- Success page for completed orders
- CheckoutForm component
- Price utility functions

### Changed
- Renamed ecosystem.config.js to ecosystem.config.cjs for better module compatibility

## [0.0.19] - 2025-01-22
### Added
- Initial implementation of category display on homepage
- WooCommerce integration for fetching categories
- JWT authentication for API requests
- Basic page layouts and routing
- Hero section on homepage
- Newsletter signup section
- Category grid display

### Fixed
- Authentication issues with WooCommerce API
- Category ordering and filtering
