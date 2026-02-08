# 🛒 AdonisCommerce

<p align="center">
  <strong>Modern, full-featured e-commerce framework built with AdonisJS 6 + InertiaJS + React 18</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AdonisJS-6.0-5A45FF?style=for-the-badge&logo=adonisjs" alt="AdonisJS 6" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

## ✨ Features

### 🏪 Storefront
- 🛍️ Product catalog with advanced filtering and search
- 🎨 Product variants (Shopify-style options: size, color, etc.)
- 🛒 Shopping cart with discount codes
- 💳 Multi-step checkout process
- 👤 Customer accounts & authentication
- 📦 Order history and tracking
- ❤️ Wishlist functionality
- ⭐ Product reviews and ratings
- 🔍 Full-text search with filters

### 🔧 Admin Panel
- 📊 Dashboard with real-time analytics
- 📦 Product management (CRUD, variants, images, bulk actions)
- 🧾 Order management (status, fulfillment, refunds, timeline)
- 👥 Customer management with order history
- 📁 Category management (hierarchical tree)
- 🏷️ Discount code management (percentage, fixed, free shipping)
- 📈 Inventory tracking with low stock alerts
- ⚙️ Store settings (general, tax, shipping, SEO)

### 🛠 Technical Features
- ⚡ **AdonisJS 6** with TypeScript - Full-featured backend framework
- ⚛️ **React 18 + InertiaJS** - SPA experience with SSR support
- 🎨 **Tailwind CSS v4** - Modern utility-first styling
- 🗄️ **PostgreSQL 16** - Robust database with JSONB support
- ⚡ **Redis 7** - Caching, sessions, and queue backend
- 🐳 **Docker** - Development and production ready
- 🧪 **Puppeteer** - Comprehensive E2E test suite
- 🌐 **Multi-tenant** - Multiple stores on single installation
- 🌍 **Multi-language** - i18n with locale detection
- 💱 **Multi-currency** - Currency conversion with exchange rates
- 📡 **Event-driven** - Async event processing for side effects

---

## 🚀 Quick Start

### Create a New Project

```bash
# Using npx (recommended)
npx create-adoniscommerce my-store

# Using pnpm
pnpm create adoniscommerce my-store

# Using yarn
yarn create adoniscommerce my-store
```

### CLI Options

```bash
npx create-adoniscommerce my-store --docker    # Include Docker setup
npx create-adoniscommerce my-store --pnpm      # Use pnpm (default)
npx create-adoniscommerce my-store --npm       # Use npm
npx create-adoniscommerce my-store --no-git    # Skip git init
npx create-adoniscommerce my-store --no-install # Skip dependency installation
```

### Start Development

```bash
cd my-store

# With Docker (recommended)
make docker-dev
make docker-db-reset

# Without Docker
pnpm install
pnpm dev
```

### Access URLs

| Service | URL |
|---------|-----|
| **Storefront** | http://localhost:3333 |
| **Admin Panel** | http://localhost:3333/admin |
| **Adminer (DB)** | http://localhost:8080 |
| **Redis Commander** | http://localhost:8081 |
| **MailHog** | http://localhost:8025 |

---

## 🔐 Default Credentials

### Admin Panel
- **Email:** admin@example.com
- **Password:** admin123

### Test Customers
- john.doe@example.com / password123
- jane.smith@example.com / password123
- bob.wilson@example.com / password123

### Discount Codes
- `WELCOME10` - 10% off (min $50)
- `SAVE20` - $20 off (min $100)
- `FREESHIP` - Free shipping (min $75)

---

## 📁 Project Structure

```
my-store/
├── app/
│   ├── controllers/
│   │   ├── admin/           # Admin panel controllers (10)
│   │   └── storefront/      # Storefront controllers (5)
│   ├── models/              # Lucid ORM models (40+)
│   ├── services/            # Business logic layer (11)
│   ├── validators/          # VineJS validators (8)
│   ├── middleware/          # HTTP middleware (7)
│   ├── events/              # Event definitions
│   └── listeners/           # Event listeners
├── config/                  # AdonisJS configuration
│   ├── commerce.ts          # E-commerce settings
│   ├── database.ts
│   └── redis.ts
├── database/
│   ├── migrations/          # 55 database migrations
│   └── seeders/             # Database seeders
├── docker/                  # Docker configuration
├── inertia/
│   ├── components/          # React components
│   │   ├── admin/           # Admin UI components
│   │   ├── storefront/      # Storefront UI components
│   │   └── shared/          # Shared components
│   ├── lib/                 # Utilities
│   └── pages/               # React pages
│       ├── admin/           # Admin panel (10+ pages)
│       └── storefront/      # Storefront (10+ pages)
├── tests/
│   └── e2e/                 # Puppeteer E2E tests (6 suites)
├── docker-compose.yml       # Docker development stack
├── Dockerfile               # Production build
└── Makefile                 # Convenience commands
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Backend** | AdonisJS 6 (Node.js) |
| **Frontend** | React 18 + InertiaJS |
| **Database** | PostgreSQL 16 |
| **Cache/Session** | Redis 7 |
| **Styling** | Tailwind CSS v4 |
| **ORM** | Lucid ORM |
| **Validation** | VineJS |
| **Testing** | Japa + Puppeteer |
| **Package Manager** | pnpm |

---

## 🐳 Docker Commands

```bash
# Development
make docker-dev           # Start development environment
make docker-dev-tools     # Start with admin tools
make docker-stop          # Stop all containers
make docker-logs          # View app logs
make docker-shell         # Open shell in container

# Database
make docker-db-migrate    # Run migrations
make docker-db-seed       # Seed database
make docker-db-reset      # Fresh database with seeds

# Cleanup
make docker-clean         # Remove all containers and volumes
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests (headless)
pnpm test:e2e

# E2E tests (with browser)
pnpm test:e2e:headed

# E2E tests (debug mode - slow motion)
pnpm test:e2e:debug
```

---

## 📊 Database Schema

55+ tables organized by domain:

- **Core:** stores, settings, admins, roles, permissions
- **Catalog:** products, variants, categories, tags, attributes, collections
- **Sales:** carts, orders, order_items, transactions, fulfillments, refunds
- **Customers:** customers, addresses, wishlists, reviews
- **Pricing:** discounts, tax_rates, tax_classes
- **Shipping:** shipping_zones, shipping_methods
- **Content:** pages, menus, banners
- **System:** notifications, webhooks, analytics, locales, currencies

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/haliltoma/adonisjs-ecommerce-core.git
cd adonisjs-ecommerce-core

# Install dependencies
pnpm install

# Build CLI
pnpm build:cli

# Run template in development
pnpm dev
```

### Publishing CLI

```bash
# Build and publish
pnpm publish:cli

# Version bump
pnpm version:patch  # 1.0.0 -> 1.0.1
pnpm version:minor  # 1.0.0 -> 1.1.0
pnpm version:major  # 1.0.0 -> 2.0.0
```

---

## 📦 Monorepo Structure

```
adonisjs-ecommerce-core/
├── packages/
│   └── create-adoniscommerce/  # CLI tool (npm package)
├── templates/
│   └── default/                # Default project template
├── docs/                       # Documentation
├── package.json                # Root workspace
└── pnpm-workspace.yaml
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Inspired by:
- [MedusaJS](https://medusajs.com/) - Modular backend architecture
- [Shopify](https://shopify.com/) - Product variant structure, admin UX
- [Bagisto](https://bagisto.com/) - Open-source e-commerce features

---

<p align="center">
  Made with ❤️ by the AdonisCommerce Team
</p>
