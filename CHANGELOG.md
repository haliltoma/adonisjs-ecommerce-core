# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-10

### Added
- Plugin/extension system with lifecycle hooks and admin menu integration
- Import/Export module for bulk inventory, products, customers, and orders
- ACE CLI commands (12 commands: install, create-admin, reset, cache:clear, etc.)
- i18n and multi-currency system with translation service and frontend utility
- SEO service with JSON-LD schemas, canonical URLs, and breadcrumbs
- Security layer: rate limiting middleware, HTML sanitizer, CSP configuration
- Integration module with abstract provider pattern and settings-based config
- Performance optimization helpers (cursor pagination, batch processing)
- Theme and layout system with CSS variable generation
- Zustand stores for cart, wishlist, compare, auth, UI, and recently viewed
- 17 admin shared components (DataTable, PageHeader, Chart, Timeline, etc.)
- 12 admin panel pages (reviews, marketing, webhooks, roles, attributes, etc.)
- Storefront components (QuickView, CartDrawer, FilterSidebar, Newsletter, etc.)
- Compare products page and order tracking page
- Guest-to-registered user conversion component
- Model and service override system in commerce config
- CHANGELOG.md

### Changed
- Enhanced commerce.ts config with modelOverrides and serviceOverrides sections
- Enabled CSP in shield configuration
- Added rate limiting to auth routes

## [1.0.2] - 2026-02-09

### Changed
- Renamed CLI package to @adonisjs-ecommerce-core/create

## [1.0.1] - 2026-02-09

### Added
- Database seeders and factories for all models
- Event system with listeners for orders, inventory, payments
- Exception handling with custom error classes
- RBAC implementation with bouncer policies
- Docker and DevOps infrastructure (Dockerfile, docker-compose, nginx)

## [1.0.0] - 2026-02-09

### Added
- Initial release
- AdonisJS 6 + React + Inertia.js stack
- Full admin panel with dashboard, products, orders, customers, inventory
- Storefront with product listing, cart, checkout, account management
- Payment service abstraction (Stripe, PayPal providers)
- Shipping service with rate calculation
- Notification service (email, in-app, SMS)
- Search service with full-text search and Elasticsearch support
- Webhook service for external integrations
- Queue system with BullMQ background jobs
- Redis cache strategy
- Media service for file upload and image resizing
- Analytics service with dashboard metrics
- 24+ shadcn/ui components
- CLI scaffolding tool (npx @adonisjs-ecommerce-core/create)
