# Test Coverage Documentation

## Overview

This document describes the testing strategy and coverage goals for the AdonisCommerce e-commerce platform.

## Coverage Goals

- **Overall Coverage**: 80%+
- **Unit Tests**: 80%+ coverage for services and models
- **Integration Tests**: Critical API endpoints covered
- **E2E Tests**: Major user flows covered

## Test Structure

```
tests/
├── unit/              # Unit tests for isolated functions
│   ├── models/        # Model tests
│   ├── services/      # Service layer tests
│   ├── helpers/       # Helper function tests
│   └── validators/    # Validator tests
├── integration/       # Integration tests
│   └── api/           # API endpoint tests
├── functional/        # Functional tests (existing)
└── e2e/              # End-to-end browser tests (existing)
```

## Running Tests

### Run All Tests
```bash
pnpm test:all
```

### Run Unit Tests Only
```bash
pnpm test:unit
```

### Run Integration Tests Only
```bash
pnpm test:integration
```

### Generate Coverage Report
```bash
pnpm test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual functions and methods in isolation

**Models**:
- ✅ Product model tests
- ✅ Order model tests
- ✅ Customer model tests
- ✅ Cart model tests
- ✅ Discount model tests

**Services**:
- ✅ ProductService tests
- ✅ OrderService tests
- ✅ CartService tests
- ✅ DiscountService tests
- ✅ TaxService tests

**Helpers**:
- ✅ Money helper tests
- ✅ Tax calculator tests
- ✅ Serialization helpers

**Validators**:
- ✅ Product validator tests
- ✅ Order validator tests
- ✅ Customer validator tests

### 2. Integration Tests

**Purpose**: Test how different parts work together

**API Endpoints**:
- ✅ Products API (`/api/products`)
- ✅ Cart API (`/api/cart`)
- ✅ Orders API (`/api/orders`)
- ✅ Customers API (`/api/customers`)
- ✌ Discounts API (`/api/discounts`) - TODO
- ✌ Checkout API (`/api/checkout`) - TODO

### 3. E2E Tests (Existing)

**Purpose**: Test complete user journeys

**Storefront**:
- ✅ Product browsing
- ✅ Add to cart
- ✅ Checkout flow
- ✅ Customer authentication

**Admin Panel**:
- ✅ Product management
- ✅ Order management
- ✅ Settings management

## Coverage Report

### Current Coverage

| Category | Coverage | Status |
|----------|----------|--------|
| Models | 75% | 🟡 |
| Services | 70% | 🟡 |
| Controllers | 40% | 🔴 |
| Helpers | 85% | 🟢 |
| Validators | 60% | 🟡 |

### Target Coverage

| Category | Target |
|----------|--------|
| Models | 90% |
| Services | 85% |
| Controllers | 70% |
| Helpers | 90% |
| Validators | 80% |

## Writing Tests

### Unit Test Example

```typescript
import { test } from '@japa/runner'
import { ProductFactory } from '#database/factories/main'

test.group('Product Model', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('create product with required fields', async ({ assert }) => {
    const product = await ProductFactory.create()
    assert.isDefined(product.id)
    assert.isNotEmpty(product.title)
  })
})
```

### Integration Test Example

```typescript
import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'

test.group('Products API', (group) => {
  test('GET /api/products returns paginated list', async ({ assert }) => {
    const client = new ApiClient(app)
    const response = await client.get('/api/products')

    response.assertStatus(200)
    assert.isArray(response.body().data)
  })
})
```

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request

Coverage reports are uploaded to Codecov.

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Database Transactions**: Use `beginGlobalTransaction()` for cleanup
3. **Factory Usage**: Use factories for test data generation
4. **Assertion Clarity**: Use descriptive assertion messages
5. **Test Speed**: Keep tests fast and focused
6. **Coverage Goals**: Aim for 80%+ coverage

## TODO

- [ ] Add more controller tests
- [ ] Add more integration tests for all API endpoints
- [ ] Add performance tests
- [ ] Add load testing scenarios
- [ ] Increase controller coverage to 70%
- [ ] Add more validator tests
