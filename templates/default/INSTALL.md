# Installation Guide

Complete step-by-step installation guide for AdonisCommerce E-Commerce Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Options](#installation-options)
3. [Manual Installation](#manual-installation)
4. [Docker Installation](#docker-installation)
5. [Post-Installation](#post-installation)
6. [Optional Features](#optional-features)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Node.js** >= 24.0.0
  ```bash
  node --version  # Should be v24.0.0 or higher
  ```

- **pnpm** >= 9.0.0
  ```bash
  npm install -g pnpm
  pnpm --version  # Should be 9.0.0 or higher
  ```

- **PostgreSQL** >= 14
  ```bash
  psql --version  # Should be 14 or higher
  ```

### Optional (Recommended)

- **Redis** >= 7 (for cache and sessions)
- **MeiliSearch** >= 1.0 (for advanced search)

## Installation Options

Choose one of the following installation methods:

- [Docker (Recommended)](#docker-installation) - Everything in containers
- [Manual Installation](#manual-installation) - Install services separately

## Docker Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/haliltoma/adonisjs-ecommerce-core.git
cd adonisjs-ecommerce-core/templates/default
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set the following:
```env
APP_KEY=
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=adoniscommerce
REDIS_HOST=redis
REDIS_PORT=6379
```

### Step 3: Generate APP_KEY

```bash
docker compose run --rm app node ace key:generate
```

Copy the generated key to your `.env` file's `APP_KEY` variable.

### Step 4: Start Services

```bash
# Start all services (PostgreSQL, Redis, App)
docker compose up -d

# Check services status
docker compose ps
```

### Step 5: Run Migrations

```bash
docker compose exec app node ace migration:run
```

### Step 6: Seed Database

```bash
docker compose exec app node ace db:seed
```

### Step 7: Access Application

- **App:** http://localhost:3333
- **Admin Panel:** http://localhost:3333/admin

### Docker Commands

```bash
# View logs
docker compose logs -f app

# Stop services
docker compose down

# Restart services
docker compose restart

# Access container shell
docker compose exec app bash
```

## Manual Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/haliltoma/adonisjs-ecommerce-core.git
cd adonisjs-ecommerce-core/templates/default
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Configure PostgreSQL

#### Option A: Use Existing PostgreSQL

```bash
# Create database
createdb adoniscommerce

# Or use psql
psql -U postgres
CREATE DATABASE adoniscommerce;
\q
```

#### Option B: Install PostgreSQL Locally

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
APP_KEY=
NODE_ENV=development
PORT=3333
HOST=localhost

# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=adoniscommerce

# Redis (optional but recommended)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Step 5: Generate APP_KEY

```bash
node ace key:generate
```

Copy the output to `APP_KEY` in `.env`.

### Step 6: Install Redis (Optional)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Download from https://redis.io/download

Or use Docker:
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### Step 7: Run Migrations

```bash
pnpm db:migrate
```

Expected output:
```
✅ Migration 0201_create_currencies_table
✅ Migration 0202_add_preferred_currency_to_customers
...
✅ Database migrated successfully
```

### Step 8: Seed Database

```bash
pnpm db:seed
```

Expected output:
```
✅ Seeded currencies
✅ Seeded admin user
✅ Seeded products
...
✅ Database seeded successfully
```

### Step 9: Start Development Server

```bash
pnpm dev
```

Expected output:
```
[ info ] starting server in hmr mode...
[ info ] loading hooks...
[ info ] generating indexes...
╭─────────────────────────────────────────────────╮
│                                                 │
│    Server address: http://127.0.0.1:3333        │
│    Mode: hmr                                    │
│    Ready in: 614 ms                             │
╰─────────────────────────────────────────────────╯
```

### Step 10: Verify Installation

Open your browser and visit:
- **Health Check:** http://localhost:3333/health
- **Storefront:** http://localhost:3333
- **Admin Panel:** http://localhost:3333/admin

## Post-Installation

### 1. Test Admin Login

```
Email: admin@example.com
Password: admin123
```

### 2. Create Your First Product

1. Visit http://localhost:3333/admin/products
2. Click "New Product"
3. Fill in product details
4. Add images
5. Save

### 3. Test Checkout

1. Visit http://localhost:3333
2. Browse products
3. Add to cart
4. Proceed to checkout
5. Fill in shipping details
6. Complete order (test mode)

## Optional Features

### MeiliSearch (Advanced Search)

#### Why MeiliSearch?

- ⚡ Lightning-fast full-text search
- 🔍 Typo tolerance
- 🎯 Faceted search (filters)
- 📊 Search analytics

#### Installation

**Using Docker:**
```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -v $(pwd)/meilisearch_data:/meilisearch.ms \
  getmeili/meilisearch:v1.5
```

**Using Binary:**
```bash
# Download from https://www.meilisearch.com/docs/learn/getting_started/installation
# Or use Homebrew (macOS)
brew install meilisearch
meilisearch
```

#### Configuration

Add to `.env`:
```env
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=  # Optional, only if you set a master key
```

#### Create Search Index

The index will be created automatically when you:
1. First search for products
2. Visit admin search panel
3. Or manually trigger reindex:
   ```bash
   curl -X POST http://localhost:3333/admin/search/reindex
   ```

#### Verify MeiliSearch

```bash
# Check MeiliSearch is running
curl http://127.0.0.1:7700/health

# Should return:
# {"status":"available"}
```

### Exchange Rate API (Multi-Currency)

#### Get Free API Key

1. Visit https://www.exchangerate-api.com/
2. Sign up for free account
3. Get your API key (1500 requests/month free)

#### Configuration

Add to `.env`:
```env
EXCHANGE_RATE_API_KEY=your_api_key_here
```

#### Update Exchange Rates

```bash
# Via API
curl -X POST http://localhost:3333/admin/currencies/update-rates

# Via Admin Panel
# Visit: http://localhost:3333/admin/settings/currencies
# Click "Update Exchange Rates"
```

### Monitoring (Optional)

For production, consider setting up:

#### PM2 Process Manager

```bash
# Install PM2
pnpm add -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'adoniscommerce',
    script: 'build/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3333
    }
  }]
}
EOF

# Start app
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
```

#### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3333
lsof -i :3333

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3334
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep adoniscommerce

# Check connection
psql -h 127.0.0.1 -U postgres -d adoniscommerce
```

### Migration Errors

```bash
# Rollback migrations
pnpm migration:rollback --batch=0

# Fresh start
pnpm db:fresh

# Or manually
node ace migration:rollback --batch=0
node ace migration:run
node ace db:seed
```

### Import Errors

```bash
# Clean rebuild
rm -rf node_modules build
pnpm install
pnpm build
```

### Server Won't Start

```bash
# Check logs
tail -f storage/logs/server.log

# Check environment
node ace --version

# Verify dependencies
pnpm list --depth=0
```

### MeiliSearch Connection Error

```bash
# Verify MeiliSearch is running
curl http://127.0.0.1:7700/health

# Check .env configuration
cat .env | grep MEILISEARCH

# Restart server after configuration change
# Search will automatically fall back to database search
```

### TypeScript Errors

```bash
# Type check
pnpm typecheck

# Build with error ignoring
pnpm build --ignore-ts-errors

# Or fix TypeScript errors
pnpm typecheck 2>&1 | head
```

## Next Steps

After successful installation:

1. **Configure Store Settings**
   - Visit: http://localhost:3333/admin/settings/store
   - Update store name, logo, currency

2. **Set Up Payment Providers**
   - Visit: http://localhost:3333/admin/settings/payments
   - Configure Stripe or Iyzico

3. **Configure Shipping**
   - Visit: http://localhost:3333/admin/settings/shipping
   - Add shipping zones and methods

4. **Create Products**
   - Visit: http://localhost:3333/admin/products
   - Add your product catalog

5. **Set Up Taxes**
   - Visit: http://localhost:3333/admin/settings/taxes
   - Configure tax classes and rates

## Getting Help

- **Documentation:** https://github.com/haliltoma/adonisjs-ecommerce-core
- **Issues:** https://github.com/haliltoma/adonisjs-ecommerce-core/issues
- **AdonisJS Docs:** https://docs.adonisjs.com
- **Discord:** Join AdonisJS Discord community

## Uninstallation

```bash
# Stop services
docker compose down -v

# Remove containers and volumes
docker compose down -v

# Or manually
pm2 delete adoniscommerce
dropdb adoniscommerce
```

---

**Installation complete! 🎉**

For more information, see [README.md](./README.md)
