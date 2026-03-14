# AdonisCommerce E-Commerce Platform

A modern, full-featured e-commerce platform built with AdonisJS 7, React 19, and InertiaJS.

## Quick Start with npx

```bash
# Create new project
npx create-adoniscommerce my-store

# Or with pnpm
pnpm create adoniscommerce my-store

# Navigate to project
cd my-store

# Follow installation prompts
# See INSTALL.md for detailed steps
```

## What's Included?

- 🛒 Full e-commerce platform with product management
- 👥 Customer accounts and segmentation
- 🎯 Personalization engine
- 🔍 Advanced search (MeiliSearch integration)
- 🌍 Multi-currency support
- 🔙 Returns & refunds (RMA)
- 📦 Advanced inventory management
- 💰 Discount system with coupons
- 📊 Analytics and reporting

## Installation

After creating your project, follow the installation guide:

```bash
cat INSTALL.md
```

Or visit: https://github.com/haliltoma/adonisjs-ecommerce-core#installation

## Features Overview

### For Store Owners
- Intuitive admin panel
- Product and inventory management
- Order management and fulfillment
- Customer segmentation and personalization
- Advanced analytics and reporting
- Multi-currency and multi-language ready

### For Developers
- Modern tech stack (AdonisJS 7, React 19, InertiaJS)
- Type-safe with TypeScript
- Comprehensive API endpoints
- Easy customization
- Well-documented codebase
- Extensive test coverage

### For Customers
- Fast and intuitive shopping experience
- Advanced product search and filtering
- Wishlist and order tracking
- Multiple payment options
- Self-service account management

## Tech Stack

- **Backend:** AdonisJS 7 (Node.js 24+)
- **Frontend:** React 19 + InertiaJS + Vite
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Search:** MeiliSearch (optional)
- **Styling:** Tailwind CSS v4

## Documentation

- **Installation Guide:** [INSTALL.md](./INSTALL.md)
- **README:** [README.md](./templates/default/README.md)
- **API Documentation:** https://github.com/haliltoma/adonisjs-ecommerce-core
- **AdonisJS Docs:** https://docs.adonisjs.com

## Project Structure

```
my-store/
├── app/                    # Application code
│   ├── controllers/       # HTTP controllers
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   └── validators/       # Input validation
├── config/               # Configuration files
├── database/             # Migrations and seeders
├── inertia/              # React components
├── public/               # Static assets
├── resources/            # Views and assets
├── start/                # Boot files
└── tests/                # Test files
```

## Getting Started

After installation:

```bash
# Start development server
pnpm dev

# Access admin panel
open http://localhost:3333/admin

# Default credentials
# Email: admin@example.com
# Password: admin123
```

## Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database
pnpm db:reset         # Reset database
```

## Support

- **Issues:** https://github.com/haliltoma/adonisjs-ecommerce-core/issues
- **Documentation:** https://github.com/haliltoma/adonisjs-ecommerce-core
- **Discord:** AdonisJS Community

## License

MIT

---

**Built with ❤️ by the AdonisCommerce community**
