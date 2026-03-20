# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AdonisCommerce is a full-featured e-commerce framework built with AdonisJS 7 + React 19 + InertiaJS + TailwindCSS 4. It's a monorepo with CLI tools for scaffolding new projects.

## Commands

```bash
# Development
pnpm dev              # Run template in development
pnpm dev:cli          # Run CLI in development (old CLI)
pnpm dev:cli:new      # Run new CLI in development

# Building
pnpm build            # Build all packages
pnpm build:cli        # Build CLI packages

# Testing
pnpm test             # Run unit tests (Japa)
pnpm test:e2e         # Run E2E tests (Jest + Puppeteer)

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed         # Seed database
pnpm db:fresh        # Fresh install (migrate + seed)

# Docker
pnpm docker:dev      # Start Docker dev environment
pnpm docker:stop     # Stop Docker containers

# Publishing
pnpm version:patch    # Bump patch version (2.3.0 -> 2.3.1)
pnpm version:minor    # Bump minor version
pnpm version:major    # Bump major version
pnpm publish:cli     # Publish CLI to npm
```

## Architecture

### Monorepo Structure

- `packages/create` - Old CLI package (@adonisjs-ecommerce-core/create)
- `packages/create-adoniscommerce` - New CLI package (create-adoniscommerce)
- `templates/default` - Default project template (the actual e-commerce app)

### CLI Commands (Template-Level)

Located in `templates/default/commands/`:

- `commerce:cache:clear` - Clear application cache
- `commerce:cleanup:carts` - Clean up expired carts
- `commerce:create:admin` - Create admin user
- `commerce:daily:analytics` - Aggregate daily analytics
- `commerce:generate:sitemap` - Generate sitemap
- `commerce:install` - Installation wizard
- `commerce:queue:status` - Queue status check
- `commerce:queue:work` - Queue worker
- `commerce:search:reindex` - Reindex search
- `commerce:update:exchange-rates` - Update currency exchange rates

### SOLID Architecture

The app follows SOLID principles with a service-oriented architecture:

1. **Services** (`app/services/`) - Business logic layer
2. **Repositories** (`app/repositories/`) - Data access layer with interfaces
3. **Controllers** (`app/controllers/`) - HTTP request handling
4. **Models** (`app/models/`) - Database models (Lucid ORM)

### Service Container Pattern

Services are managed via a service container (`app/services/service_container.ts`). Use the container to access services:

```typescript
import { useCartService } from '#services/service_container'

const cartService = useCartService()
```

### Cart Service Architecture

The cart system uses specialized classes for separation of concerns:
- `CartTotalsCalculator` - Calculates subtotal, grand total
- `CartItemManager` - Add/update/remove cart items
- `CartDiscountApplicator` - Applies discount codes
- `CartTaxCalculator` - Calculates taxes
- `CartValidator` - Validates cart state

### Cart Calculations

Always recalculate from unitPrice × quantity - never trust client-provided totals:

```typescript
const unitPrice = Math.round(Number(item.unitPrice || 0) * 100) / 100
const quantity = Number(item.quantity || 0)
const itemTotal = Math.round((unitPrice * quantity - discountAmount) * 100) / 100
```

## Key Directories

### App Layer
- `app/services/` - 50+ services with business logic
- `app/services/cart/` - Cart specialized classes
- `app/services/order/` - Order processing
- `app/services/product/` - Product utilities
- `app/services/payment/` - Payment processing
- `app/services/shipping/` - Shipping logic
- `app/services/search/` - Meilisearch integration
- `app/services/queue/` - BullMQ job queue
- `app/repositories/interfaces/` - Repository interfaces (5 types)
- `app/repositories/implementations/` - Repository implementations
- `app/models/` - 90+ Lucid ORM models
- `app/controllers/storefront/` - Customer-facing controllers
- `app/controllers/admin/` - Admin panel controllers
- `app/controllers/api/` - REST API controllers
- `app/events/` - Event definitions (7 types)
- `app/listeners/` - Event listeners (9 types)
- `app/jobs/` - Background jobs (9 types)
- `app/middleware/` - 18 middleware types

### Frontend (Inertia/React)
- `inertia/pages/admin/` - Admin panel pages
- `inertia/pages/storefront/` - Customer-facing pages
- `inertia/components/` - UI components
- `inertia/stores/` - Zustand state management
- `inertia/hooks/` - Custom React hooks
- `inertia/lib/` - Utilities (i18n, CSRF)

### Database
- `database/migrations/` - 80+ migration files
- `database/seeders/` - Database seeders
- `database/factories/` - Test data factories

## Key Patterns

- **Repository Pattern**: Interfaces in `app/repositories/interfaces/`, implementations in `app/repositories/implementations/`
- **Factory Pattern**: Used in services (e.g., `OrderItemFactory`) for creating complex objects
- **Transaction Support**: Database operations wrapped in transactions via repository
- **Event-Driven**: Events defined in `app/events/`, listeners in `app/listeners/`
- **Queue-Based Processing**: BullMQ for background jobs

## Database Models (90+)

Key model groups:
- **Users & Auth**: User, Customer, CustomerAddress, CustomerGroup, CustomerSegment
- **Store**: Store, Setting, Region, Locale, Currency, SalesChannel
- **Products**: Product, ProductVariant, ProductImage, ProductOption
- **Orders**: Order, OrderItem, OrderTransaction, OrderStatusHistory
- **Cart**: Cart, CartItem
- **Pricing**: PriceList, PriceListPrice, Discount, DiscountRule, Coupon
- **Inventory**: InventoryItem, InventoryLocation, InventoryMovement
- **Fulfillment**: Fulfillment, Return, ReturnItem
- **Digital Products**: DigitalProduct, Download, License
- **Content**: BlogPost, Page, Menu, Banner

## Docker Setup

Docker compose uses dynamic container naming via `COMPOSE_PROJECT_NAME`:
- Postgres: `${COMPOSE_PROJECT_NAME:-adoniscommerce}-postgres` (port 5433)
- Redis: `${COMPOSE_PROJECT_NAME:-adoniscommerce}-redis` (port 6380)

APP_MODE environment variable supports `docker` or `local` modes.

## Testing

- **Unit/Integration**: Japa test runner
- **E2E**: Jest + Puppeteer
- **Test directories**: `tests/unit/`, `tests/integration/`, `tests/functional/`, `tests/e2e/`, `tests/api/`

## Key Files

- `templates/default/adonisrc.ts` - App configuration
- `templates/default/vite.config.ts` - Frontend build config
- `templates/default/start/routes.ts` - All routes (~48KB)
- `templates/default/database/schema.ts` - Database schema
- `templates/default/app/services/service_container.ts` - DI container
- `templates/default/config/commerce.ts` - E-commerce settings

## Environment

- Node.js 20+
- PostgreSQL 16
- Redis 7
- pnpm workspace

---

# Agent Sistemi ve MCP Kullanımı

Bu proje MCP Gateway entegrasyonlu agent sistemini kullanır. Agent dokümantasyonu `agents-md-with-mcp-skills/` klasöründe mevcuttur.

## MCP Sunucuları

| Sunucu | Kullanım |
|--------|----------|
| `filesystem` | Proje dosyalarını okuma/yazma/düzenleme |
| `context7` | Framework dokümantasyonu (React, AdonisJS, Tailwind, vb.) |
| `brave-search` | Güncel best practice, kütüphane araştırması |
| `fetch` | CDN URL doğrulama, API endpoint test |
| `puppeteer` | E2E test, browser otomasyonu |
| `sequential-thinking` | Karmaşık mimari kararlar için adım adım düşünme |
| `gateway` | MCP sunucu yönetimi |

## Agent Karar Ağacı

```
Görev geldi
├── Hata/ebug          → debug-agent.md kullan
├── UI/Component       → frontend-agent.md kullan
├── Güvenlik           → security-agent.md kullan
├── Performans         → performance-agent.md kullan
├── MCP Gateway        → gateway-agent.md kullan
├── Fullstack          → fullstack-agent.md kullan
└── Araştırma         → research-agent.md kullan
```

## Debug Protokolü (Her Hata İçin)

```
HATA GELDİ
├── ADIM 1: ANLA — Ne oluyor, ne olması gerekiyor?
├── ADIM 2: REPRODUCE — Hatayı güvenilir şekilde tekrar üret
├── ADIM 3: İZOLE — Sorunu en küçük hale getir
├── ADIM 4: ARAŞTIR — Kök nedeni bul (sequential-thinking)
├── ADIM 5: ÇÖZE — Kalıcı düzeltme uygula
└── ADIM 6: DOĞRULA — Düzeltme çalışıyor mu?
```

## MCP Skill'leri

### Gateway Skills
```
/diagnose         → MCP Gateway teşhis
/gateway-logs     → Log analizi
/backup-config    → Değişiklik öncesi yedek
/ralph-loop       → İteratif görevler
/security-audit   → Güvenlik denetimi
/optimize         → Performans optimizasyonu
```

### Frontend Skills
```
/ui-component       → Tekil component
/landing-page       → Tam landing page
/dashboard          → Admin dashboard
/form-builder       → Form sistemleri
/performance-audit  → Core Web Vitals
/accessibility-audit → A11y kontrol
```

## Hızlı Referans

| Problem | İlk Aksiyon |
|---------|-------------|
| Runtime hata | filesystem + sequential-thinking |
| Build hata | brave-search + context7 |
| API hata | fetch ile test et |
| Performans | puppeteer + performance-agent |
| Gateway sorunu | /diagnose + /gateway-logs |

## Debug Rapor Formatı

```markdown
# Debug Raporu
**Tarih:** YYYY-MM-DD
**Hata Türü:** Runtime / Build / Mantık / Ağ

## Hata Özeti
[Ne hata veriyordu?]

## Kök Neden
[Gerçek neden]

## Uygulanan Çözüm
**Dosya:** path:line
**Önce:** [hatalı kod]
**Sonra:** [düzeltilmiş kod]

## Doğrulama
- [ ] Hata tekrar vermiyor
- [ ] Diğer özellikler kırılmadı
```
