# AdonisCommerce

Modern, full-featured e-commerce platform built with AdonisJS 6, InertiaJS, and React 18.

## Tech Stack

- **Backend:** AdonisJS 6 (Node.js)
- **Frontend:** React 18 + InertiaJS
- **Database:** PostgreSQL 16
- **Cache/Session:** Redis 7
- **Styling:** Tailwind CSS v4
- **Testing:** Japa (Unit) + Puppeteer (E2E)

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Copy environment file
cp .env.docker .env

# Start with Docker
make docker-dev

# Or with additional tools (Adminer, Redis Commander, MailHog)
make docker-dev-tools

# Run migrations and seed
make docker-db-reset
```

Access the application:
- **App:** http://localhost:3333
- **Adminer (DB UI):** http://localhost:8080
- **Redis Commander:** http://localhost:8081
- **MailHog:** http://localhost:8025

### Option 2: Manual Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
node ace migration:run

# Seed database
node ace db:seed

# Start development server
pnpm dev
```

## Docker Commands

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

## Default Credentials

### Admin Panel
- **URL:** http://localhost:3333/admin
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

## Project Structure

```
my-store/
├── app/
│   ├── controllers/
│   │   ├── admin/           # Admin panel controllers
│   │   └── storefront/      # Storefront controllers
│   ├── models/              # Lucid ORM models
│   ├── services/            # Business logic
│   └── validators/          # VineJS validators
├── config/                  # AdonisJS configuration
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── docker/                  # Docker configuration files
├── inertia/
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   └── pages/               # React pages
│       ├── admin/           # Admin panel pages
│       └── storefront/      # Storefront pages
├── scripts/                 # Utility scripts
├── start/                   # AdonisJS boot files
├── tests/
│   └── e2e/                 # Puppeteer E2E tests
├── docker-compose.yml       # Development Docker config
├── docker-compose.prod.yml  # Production Docker config
├── Dockerfile               # Production Dockerfile
├── Dockerfile.dev           # Development Dockerfile
└── Makefile                 # Convenience commands
```

## Features

### Storefront
- Product catalog with filtering and search
- Product variants (size, color, etc.)
- Shopping cart with discount codes
- Multi-step checkout
- Customer accounts
- Order history
- Wishlist
- Product reviews

### Admin Panel
- Dashboard with analytics
- Product management (CRUD, variants, images)
- Order management (status, fulfillment, refunds)
- Customer management
- Category management (hierarchical)
- Discount code management
- Inventory tracking
- Store settings

## Testing

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3333 |
| `APP_KEY` | Application key | - |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USER` | PostgreSQL user | postgres |
| `DB_PASSWORD` | PostgreSQL password | - |
| `DB_DATABASE` | Database name | adoniscommerce |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_PASSWORD` | Redis password | - |

## Production Deployment

```bash
# Build production image
docker compose -f docker-compose.prod.yml build

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec app node ace migration:run
```

## API Health Check

```bash
curl http://localhost:3333/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "checks": {
    "database": "ok",
    "memory": "ok"
  }
}
```

## Documentation

Full documentation: https://github.com/haliltoma/adonisjs-ecommerce-core

## License

MIT
