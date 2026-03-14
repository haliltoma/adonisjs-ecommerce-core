import { test } from '@japa/runner'
import { validator } from '#services/validation_service'

test.group('Product Validators', () => {
  test('valid product data passes validation', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      status: 'active',
    }

    const result = await validator.validateProduct(data)
    assert.isTrue(result.success)
  })

  test('product title is required', async ({ assert }) => {
    const data = {
      price: 29.99,
      sku: 'TEST-001',
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.title)
  })

  test('product price must be positive number', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: -10,
      sku: 'TEST-001',
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.price)
  })

  test('product SKU is required', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.sku)
  })

  test('product status must be valid enum value', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      status: 'invalid_status',
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.status)
  })

  test('product weight must be positive', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      weight: -5,
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.weight)
  })

  test('product inventory quantity cannot be negative', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      stockQuantity: -10,
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.stockQuantity)
  })

  test('product slug must be URL-friendly', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      slug: 'Invalid Slug With Spaces!',
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.slug)
  })

  test('product type must be valid enum value', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      type: 'invalid_type',
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.type)
  })

  test('variant option values are required for variable products', async ({ assert }) => {
    const data = {
      title: 'Test Product',
      price: 29.99,
      sku: 'TEST-001',
      type: 'variable',
      hasVariants: true,
      options: [],
    }

    const result = await validator.validateProduct(data)
    assert.isFalse(result.success)
    assert.exists(result.errors.options)
  })
})
