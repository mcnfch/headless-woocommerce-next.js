# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
