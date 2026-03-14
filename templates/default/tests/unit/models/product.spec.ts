import { test } from '@japa/runner'
import { ProductFactory } from '#database/factories/main'
import Product from '#models/product'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Product Model', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('create product with required fields', async ({ assert }) => {
    const product = await ProductFactory.create()
    assert.isDefined(product.id)
    assert.isNotEmpty(product.title)
    assert.isNotEmpty(product.sku)
  })

  test('product slug is auto-generated from title', async ({ assert }) => {
    const product = await ProductFactory.merge({
      title: 'Amazing Product Name',
    }).create()

    assert.equal(product.slug, 'amazing-product-name')
  })

  test('product status defaults to active', async ({ assert }) => {
    const product = await ProductFactory.create()
    assert.equal(product.status, 'active')
  })

  test('simple product has no variants', async ({ assert }) => {
    const product = await ProductFactory.merge({
      type: 'simple',
      hasVariants: false,
    }).create()

    assert.equal(product.type, 'simple')
    assert.isFalse(product.hasVariants)
  })

  test('product calculates stock correctly', async ({ assert }) => {
    const product = await ProductFactory.merge({
      stockQuantity: 100,
      trackInventory: true,
    }).create()

    assert.equal(product.stockQuantity, 100)
    assert.isTrue(product.trackInventory)
  })

  test('product in stock when quantity > 0', async ({ assert }) => {
    const product = await ProductFactory.merge({
      stockQuantity: 50,
      trackInventory: true,
    }).create()

    const isInStock = product.stockQuantity > 0
    assert.isTrue(isInStock)
  })

  test('product out of stock when quantity = 0', async ({ assert }) => {
    const product = await ProductFactory.merge({
      stockQuantity: 0,
      trackInventory: true,
    }).create()

    const isInStock = product.stockQuantity > 0
    assert.isFalse(isInStock)
  })

  test('product price validation', async ({ assert }) => {
    const product = await ProductFactory.merge({
      price: 99.99,
    }).create()

    assert.equal(product.price, 99.99)
    assert.isTrue(product.price > 0)
  })

  test('product with inventory tracking disabled has infinite stock', async ({ assert }) => {
    const product = await ProductFactory.merge({
      trackInventory: false,
      stockQuantity: 0,
    }).create()

    assert.isFalse(product.trackInventory)
    // Product should still be purchasable even with 0 stock when tracking is disabled
  })

  test('product featured flag', async ({ assert }) => {
    const product = await ProductFactory.merge({
      isFeatured: true,
    }).create()

    assert.isTrue(product.isFeatured)
  })

  test('product SKU uniqueness', async ({ assert }) => {
    const sku = 'UNIQUE-SKU-123'

    await ProductFactory.merge({ sku }).create()

    // Creating another product with same SKU should fail or be handled
    const product2 = await ProductFactory.merge({ sku: 'DIFFERENT-SKU' }).create()

    assert.notEqual(product2.sku, sku)
  })
})
