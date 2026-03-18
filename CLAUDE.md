# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AdonisCommerce is a full-featured e-commerce framework built with AdonisJS 7 + React 19 + InertiaJS. It's a monorepo with CLI tools for scaffolding new projects.

## Commands

```bash
# Development
pnpm dev              # Run template in development
pnpm dev:cli         # Run CLI in development

# Building
pnpm build           # Build all packages
pnpm build:cli       # Build CLI packages

# Testing
pnpm test            # Run unit tests
pnpm test:e2e       # Run E2E tests (Puppeteer)

# Database
pnpm db:migrate      # Run migrations
pnpm db:seed        # Seed database
pnpm db:fresh       # Fresh install (migrate + seed)

# Docker
pnpm docker:dev     # Start Docker dev environment
pnpm docker:stop    # Stop Docker containers

# Publishing
pnpm version:patch  # Bump patch version (2.3.0 -> 2.3.1)
pnpm version:minor  # Bump minor version
pnpm version:major  # Bump major version
pnpm publish:cli    # Publish CLI to npm
```

## Architecture

### Monorepo Structure
- `packages/create` - Old CLI package (@adonisjs-ecommerce-core/create)
- `packages/create-adoniscommerce` - New CLI package (create-adoniscommerce)
- `templates/default` - Default project template (the actual e-commerce app)

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

## Docker Setup

Docker compose uses dynamic container naming via `COMPOSE_PROJECT_NAME`:
- Postgres: `${COMPOSE_PROJECT_NAME:-adoniscommerce}-postgres`
- Redis: `${COMPOSE_PROJECT_NAME:-adoniscommerce}-redis`

APP_MODE environment variable supports `docker` or `local` modes.

## Key Patterns

- **Repository Pattern**: Interfaces in `app/repositories/interfaces/`, implementations in `app/repositories/implementations/`
- **Factory Pattern**: Used in services (e.g., `OrderItemFactory`) for creating complex objects
- **Transaction Support**: Database operations wrapped in transactions via repository
- **Event-Driven**: Events defined in `app/events/`, listeners in `app/listeners/`
