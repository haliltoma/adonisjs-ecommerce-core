# AdonisCommerce E-Commerce Platform

Modern, full-featured e-commerce platform built with **AdonisJS 7**, InertiaJS, and React 19.

## 🚀 Tech Stack

- **Backend:** AdonisJS 7 (Node.js 20+)
- **Frontend:** React 19 + InertiaJS + Vite
- **Database:** PostgreSQL 16
- **Cache/Session:** Redis 7
- **Search:** MeiliSearch (optional)
- **Styling:** Tailwind CSS v4
- **Testing:** Japa (Unit) + Puppeteer (E2E)

## ✨ Features

### Storefront
- 🛍️ Product catalog with advanced filtering and search
- 📦 Product variants (size, color, etc.)
- 🛒 Shopping cart with discount codes
- 💳 Multi-step checkout with multiple payment providers
- 👤 Customer accounts and order history
- ❤️ Wishlist functionality
- ⭐ Product reviews and ratings
- 🌍 Multi-currency support with real-time exchange rates
- 🔍 Advanced full-text search with MeiliSearch

### Admin Panel
- 📊 Dashboard with real-time analytics
- 📦 Product management (CRUD, variants, images, inventory)
- 🛒 Order management (status, fulfillment, refunds, returns)
- 👥 Customer management with segments
- 🎯 Customer segmentation & personalization
- 🏷️ Category management (hierarchical)
- 💰 Discount code system with rules and coupons
- 📊 Advanced inventory management with alerts
- 🔙 Returns & refunds system (RMA)
- 🔍 Search analytics and trending terms
- 📈 Store settings and configuration

### Advanced Features
- **Customer Segmentation:** Rule-based customer segments with dynamic assignment
- **Personalization:** Segment-specific pricing and content
- **Advanced Search:** MeiliSearch integration with typo tolerance and faceted search
- **Search Analytics:** Track popular searches, trending terms, and zero-result queries
- **Returns Management:** Complete RMA workflow with inspection and resolution tracking
- **Inventory Alerts:** Low stock, out of stock, and backorder threshold notifications
- **Inventory Reservations:** Cart and order reservations to prevent overselling
- **Advanced Discounts:** Tiered discounts, quantity-based rules, bulk coupon generation
- **Multi-Currency:** Automatic currency detection and real-time conversion

## 📋 Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14
- Redis >= 7 (optional, for cache/sessions)
- MeiliSearch >= 1.0 (optional, for advanced search)

## 🔧 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/haliltoma/adonisjs-ecommerce-core.git
cd adonisjs-ecommerce-core/templates/default

# Copy environment file
cp .env.example .env

# Start infrastructure (PostgreSQL, Redis)
pnpm infra:up

# Or with Docker Compose
docker compose up -d postgres redis

# Run migrations and seed
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

### Option 2: Manual Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env

# Edit .env with your database credentials
# Required variables:
# - APP_KEY (generate with: node ace key:generate)
# - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE
# - MEILISEARCH_HOST (optional, for search)

# Generate app key
node ace key:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development server
pnpm dev
```

Access the application:
- **App:** http://localhost:3333
- **Admin Panel:** http://localhost:3333/admin

## 🔐 Default Credentials

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

## 📁 Project Structure

```
templates/default/
├── app/
│   ├── controllers/
│   │   ├── admin/                    # Admin panel controllers
│   │   │   ├── customer_segments_controller.ts
│   │   │   ├── search_controller.ts
│   │   │   ├── returns_controller.ts
│   │   │   └── advanced_inventory_controller.ts
│   │   └── storefront/               # Storefront controllers
│   ├── models/                      # Lucid ORM models
│   │   ├── customer_segment.ts       # Customer segmentation
│   │   ├── return.ts                 # Returns/RMA
│   │   └── product.ts               # Products with variants
│   ├── services/                    # Business logic
│   │   ├── meilisearch_service.ts   # Advanced search
│   │   ├── search_analytics_service.ts
│   │   ├── returns_service.ts       # Returns processing
│   │   ├── segment_assignment_service.ts
│   │   ├── advanced_inventory_service.ts
│   │   ├── currency_service.ts      # Multi-currency
│   │   └── coupon_generator_service.ts
│   └── validators/                 # VineJS validators
├── config/                          # AdonisJS configuration
├── database/
│   ├── migrations/                  # Database migrations
│   │   ├── 0214_create_customer_segments_table.ts
│   │   ├── 0215_create_customer_segment_assignments_table.ts
│   │   ├── 0216_create_search_events_table.ts
│   │   ├── 0217_create_search_clicks_table.ts
│   │   ├── 0218_create_returns_table.ts
│   │   ├── 0219_create_return_items_table.ts
│   │   ├── 0220_create_inventory_alerts_table.ts
│   │   └── 0221_create_inventory_reservations_table.ts
│   └── seeders/                     # Database seeders
├── docker/                          # Docker configuration
├── inertia/
│   ├── components/                  # React components
│   ├── pages/                       # React pages
│   │   ├── admin/                   # Admin panel pages
│   │   └── storefront/              # Storefront pages
│   └── lib/                         # Utilities
├── start/                           # AdonisJS boot files
├── tests/                           # Test files
│   ├── unit/                        # Unit tests
│   └── e2e/                         # E2E tests
├── .env.example                     # Environment variables template
├── docker-compose.yml               # Development Docker config
├── docker-compose.prod.yml          # Production Docker config
└── package.json                     # Dependencies and scripts
```

## 🧪 Testing

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# All tests with coverage
pnpm test:coverage

# E2E tests (headless)
pnpm test:e2e

# E2E tests (with browser)
pnpm test:e2e:headed

# E2E tests (debug mode - slow motion)
pnpm test:e2e:debug
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                    # Start dev server with HMR
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database
pnpm db:reset              # Reset database (migrate + seed)
pnpm db:fresh              # Fresh database

# Infrastructure (Docker Compose)
pnpm infra:up              # Start postgres and redis
pnpm infra:down            # Stop containers
pnpm infra:status          # Check container status
pnpm infra:logs            # View container logs

# Queue
pnpm queue:work            # Process queued jobs
pnpm queue:status          # Check queue status

# One-command setup
pnpm setup                 # Full setup: infra + migrate + seed
pnpm go                    # Start everything
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3333 |
| `HOST` | Server host | localhost |
| `APP_KEY` | Application encryption key | - |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | info |
| `SESSION_DRIVER` | Session driver | cookie |
| **Database** | | |
| `DB_HOST` | PostgreSQL host | 127.0.0.1 |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USER` | PostgreSQL user | root |
| `DB_PASSWORD` | PostgreSQL password | root |
| `DB_DATABASE` | Database name | app |
| **Redis** | | |
| `REDIS_HOST` | Redis host | 127.0.0.1 |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_PASSWORD` | Redis password | - |
| **Payment** | | |
| `PAYMENT_PROVIDER` | Payment provider (manual, stripe, iyzico) | manual |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `STRIPE_PUBLIC_KEY` | Stripe public key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - |
| `IYZICO_API_KEY` | Iyzico API key | - |
| `IYZICO_SECRET_KEY` | Iyzico secret key | - |
| **MeiliSearch** (Optional) | | |
| `MEILISEARCH_HOST` | MeiliSearch server URL | http://127.0.0.1:7700 |
| `MEILISEARCH_API_KEY` | MeiliSearch API key (optional) | - |
| **Exchange Rate API** | | |
| `EXCHANGE_RATE_API_KEY` | ExchangeRate-API key (free tier available) | - |

## 🔍 MeiliSearch Setup (Optional)

MeiliSearch provides advanced full-text search with typo tolerance and faceted filtering.

### Installation

```bash
# Using Docker
docker run -d -p 7700:7700 --name meilisearch getmeili/meilisearch:v1.5

# Or download binary
# Visit: https://www.meilisearch.com/docs/learn/getting_started/installation
```

### Configuration

Add to your `.env`:
```env
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=  # Optional, only if you set a master key
```

### Create Search Index

```bash
# Start the server
pnpm dev

# The MeiliSearch index will be created automatically
# when you first search or access the admin search panel
```

### Reindex Products

```bash
# Via API
curl -X POST http://localhost:3333/admin/search/reindex

# Or manually in admin panel
# Visit: http://localhost:3333/admin/search
```

### Features

- ✅ Full-text search with typo tolerance
- ✅ Faceted search (price range, category, in-stock, on-sale, tags)
- ✅ Sortable results (price, name, popularity, newest)
- ✅ Search suggestions/autocomplete
- ✅ Search analytics (popular, trending, zero-result searches)
- ✅ Automatic fallback to database search if MeiliSearch unavailable

## 🌍 Multi-Currency Setup

### Configuration

1. **Add Currencies** via Admin Panel:
   - Visit: http://localhost:3333/admin/settings/currencies
   - Add currencies with exchange rates

2. **Enable Auto-Update** (Optional):
   ```bash
   # Get a free API key from: https://www.exchangerate-api.com/
   EXCHANGE_RATE_API_KEY=your_api_key_here
   ```

3. **Update Exchange Rates**:
   ```bash
   # Via API
   curl -X POST http://localhost:3333/admin/currencies/update-rates

   # Via Admin Panel
   # Visit: http://localhost:3333/admin/settings/currencies
   ```

### Features

- ✅ Real-time exchange rate updates (ExchangeRate-API)
- ✅ GeoIP-based currency detection
- ✅ Customer preferred currency
- ✅ Automatic price conversion
- ✅ Currency-specific formatting

## 📊 Customer Segments Setup

### Creating Segments

1. **Manual Segment**: Assign customers manually
2. **Dynamic Segment**: Auto-assign based on rules
3. **Behavioral Segment**: Based on purchase patterns
4. **Demographic Segment**: Based on customer attributes

### Example Segments

```typescript
// VIP Customers (spent > $1000)
{
  type: 'dynamic',
  conditions: {
    minSpent: 1000
  }
}

// Loyal Customers (5+ orders)
{
  type: 'behavioral',
  conditions: {
    minOrderCount: 5
  }
}

// Recent Purchasers (ordered in last 30 days)
{
  type: 'behavioral',
  rules: [
    { field: 'lastOrderDaysAgo', operator: 'lte', value: 30 }
  ]
}
```

### Segment Rules

**Operators:**
- `eq` - Equal to
- `ne` - Not equal to
- `gt` - Greater than
- `gte` - Greater than or equal to
- `lt` - Less than
- `lte` - Less than or equal to
- `in` - In array
- `contains` - Contains string/array element
- `matches` - Matches regex pattern

**Fields:**
- `totalSpent` - Total amount spent
- `totalOrders` - Number of orders
- `lastOrderDaysAgo` - Days since last order
- `tags` - Customer tags
- `groupId` - Customer group membership

## 🔙 Returns & Refunds Setup

### RMA Workflow

1. **Requested** - Customer submits return request
2. **Approved** - Admin approves, sets expected return date
3. **Received** - Items received from customer
4. **Inspected** - Items inspected, condition verified
5. **Processed** - Refund/exchange completed

### Return Reasons

- `damaged` - Item arrived damaged
- `defective` - Item is defective
- `wrong_item` - Wrong item received
- `no_longer_needed` - No longer needed
- `better_price_available` - Found better price
- `other` - Other

### Resolutions

- `refund` - Refund to original payment method
- `exchange` - Exchange for different item
- `store_credit` - Issue store credit

### Return Window

Default: 30 days from order date (configurable per return)

## 📦 Advanced Inventory Setup

### Inventory Alerts

Alerts are automatically created when:

- **Low Stock**: Stock falls below threshold
- **Out of Stock**: Stock reaches zero
- **Backorder Threshold**: Stock below backorder limit

### Configuration

Set thresholds per product:
- `lowStockThreshold` - Alert level (default: 10)
- `backorderThreshold` - Allow backorders below this level
- `allowBackorder` - Enable backorders for this product

### Inventory Reservations

Reservations prevent overselling by:
1. Reserving stock when added to cart (30 min default)
2. Consuming reservation when order placed
3. Releasing expired reservations automatically

### Managing Alerts

```bash
# Via API
curl http://localhost:3333/admin/inventory/alerts

# Acknowledge alert
curl -X POST http://localhost:3333/admin/inventory/alerts/:id/acknowledge

# Resolve alert
curl -X POST http://localhost:3333/admin/inventory/alerts/:id/resolve

# Clean expired reservations
curl -X POST http://localhost:3333/admin/inventory/clean-expired
```

## 🚀 Production Deployment

### Build

```bash
# Build for production
pnpm build
```

### Docker

```bash
# Build production image
docker compose -f docker-compose.prod.yml build

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec app node ace migration:run
```

### Manual

```bash
# Setup environment
export NODE_ENV=production
cp .env.example .env
# Edit .env for production

# Install dependencies
pnpm install --prod

# Build
pnpm build

# Run migrations
node ace migration:run

# Start server
node build/server.js
```

### Process Manager (PM2)

```bash
# Install PM2
pnpm add -g pm2

# Start app
pm2 start build/server.js --name adoniscommerce

# View logs
pm2 logs adoniscommerce

# Restart
pm2 restart adoniscommerce

# Stop
pm2 stop adoniscommerce
```

## 🏥 Health Check

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

## 📚 API Endpoints

### Search API

```bash
# Search products
GET /search?q=term&category=electronics&minPrice=100&maxPrice=500&inStock=true

# Search suggestions
GET /search/suggestions?q=lapt

# Track search (analytics)
POST /search/track
{
  "query": "laptop",
  "resultsCount": 25,
  "filters": {}
}
```

### Customer Segments API

```bash
# Get customer segments
GET /admin/segments

# Create segment
POST /admin/segments
{
  "name": "VIP Customers",
  "type": "dynamic",
  "conditions": {
    "minSpent": 1000
  }
}

# Recalculate segment
POST /admin/segments/:id/recalculate

# Assign customer to segment
POST /admin/segments/:id/assign
{
  "customerId": "uuid"
}
```

### Returns API

```bash
# Get returns
GET /admin/returns?status=pending

# Create return
POST /returns
{
  "orderId": "uuid",
  "reason": "damaged",
  "items": [...]
}

# Approve return
POST /admin/returns/:id/approve

# Process return
POST /admin/returns/:id/process
{
  "resolution": "refund"
}
```

### Inventory API

```bash
# Get inventory statistics
GET /admin/inventory/statistics/:storeId

# Get alerts
GET /admin/inventory/alerts?severity=critical

# Reserve inventory
POST /admin/inventory/reserve
{
  "productId": "uuid",
  "quantity": 2,
  "reservationType": "cart"
}
```

## 🐳 Multiple Projects with Docker

If you're running multiple AdonisCommerce projects simultaneously, container name conflicts can occur. This has been fixed with dynamic naming.

### How It Works

Container names are automatically based on the project folder name:

```bash
# Example with multiple projects
cd my-store-1
pnpm docker:dev
# Containers: my-store-1-postgres, my-store-1-redis, my-store-1-app

cd ../my-store-2
pnpm docker:dev
# Containers: my-store-2-postgres, my-store-2-redis, my-store-2-app
# ✅ No conflicts!
```

### Custom Project Name

You can override the automatic naming:

1. **Edit .env:**
```bash
PROJECT_NAME=my-custom-name
```

2. **Start services:**
```bash
pnpm docker:dev
# Containers: my-custom-name-postgres, my-custom-name-redis, my-custom-name-app
```

### Container Names Reference

| Service | Default Name Pattern | Example (my-store) |
|---------|---------------------|---------------------|
| PostgreSQL | `${PROJECT_NAME}-postgres` | `my-store-postgres` |
| Redis | `${PROJECT_NAME}-redis` | `my-store-redis` |
| AdonisJS App | `${PROJECT_NAME}-app` | `my-store-app` |
| Adminer | `${PROJECT_NAME}-adminer` | `my-store-adminer` |
| Redis Commander | `${PROJECT_NAME}-redis-commander` | `my-store-redis-commander` |
| MailHog | `${PROJECT_NAME}-mailhog` | `my-store-mailhog` |

### View Running Containers

```bash
# List all AdonisCommerce containers
docker ps | grep adoniscommerce

# View specific project containers
docker ps | grep my-store
```

### Troubleshooting Multiple Projects

**Port conflicts?** Change ports in `.env`:
```bash
# Project 1 (.env)
APP_PORT=3333
DB_PORT=5432
REDIS_PORT=6379

# Project 2 (.env)
APP_PORT=3334
DB_PORT=5433
REDIS_PORT=6380
```

**Still getting conflicts?** Stop other projects:
```bash
# Stop specific project
cd ../my-store-1
docker compose down

# Stop all AdonisCommerce projects
docker ps -q | grep adoniscommerce | xargs docker stop
```

## 🐛 Troubleshooting

### Server won't start

```bash
# Check if port is in use
lsof -i :3333

# Check database connection
pnpm db:migrate

# Check logs
tail -f storage/logs/server.log
```

### MeiliSearch connection error

```bash
# Check if MeiliSearch is running
curl http://127.0.0.1:7700/health

# Verify .env configuration
grep MEILISEARCH .env

# Search will fall back to database search automatically
```

### Import errors

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
rm -rf build
pnpm build
```

## 📖 Documentation

Full documentation: https://github.com/haliltoma/adonisjs-ecommerce-core

### AdonisJS Documentation
- https://docs.adonisjs.com
- https://github.com/adonisjs

### MeiliSearch Documentation
- https://www.meilisearch.com/docs/

## 📝 License

MIT

---

**Built with ❤️ using AdonisJS 7**
