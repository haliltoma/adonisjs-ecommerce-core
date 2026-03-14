import { test } from '@japa/runner'
import { ProductFactory, CategoryFactory } from '#database/factories/main'
import ProductService from '#services/product_service'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Product Service', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('get all products with pagination', async ({ assert }) => {
    await ProductFactory.createMany(15)

    const productService = new ProductService()
    const result = await productService.getAll({ page: 1, limit: 10 })

    assert.lengthOf(result.products, 10)
    assert.isDefined(result.meta.total)
    assert.equal(result.meta.total, 15)
  })

  test('get product by id', async ({ assert }) => {
    const product = await ProductFactory.create()

    const productService = new ProductService()
    const found = await productService.getById(product.id)

    assert.isDefined(found)
    assert.equal(found.id, product.id)
  })

  test('get product by slug', async ({ assert }) => {
    const product = await ProductFactory.merge({
      slug: 'test-product-slug',
    }).create()

    const productService = new ProductService()
    const found = await productService.getBySlug('test-product-slug')

    assert.isDefined(found)
    assert.equal(found.slug, 'test-product-slug')
  })

  test('filter products by category', async ({ assert }) => {
    const category = await CategoryFactory.create()
    const product1 = await ProductFactory.create()
    const product2 = await ProductFactory.create()

    await product1.related('categories').attach([category.id])
    await product2.related('categories').attach([category.id])

    const productService = new ProductService()
    const result = await productService.getByCategory(category.id)

    assert.lengthOf(result, 2)
  })

  test('search products by title', async ({ assert }) => {
    await ProductFactory.merge({ title: 'Amazing Red Widget' }).create()
    await ProductFactory.merge({ title: 'Blue Gadget' }).create()
    await ProductFactory.merge({ title: 'Red Tool Set' }).create()

    const productService = new ProductService()
    const result = await productService.search('red')

    assert.lengthOf(result, 2)
  })

  test('get featured products', async ({ assert }) => {
    await ProductFactory.merge({ isFeatured: true }).create()
    await ProductFactory.merge({ isFeatured: true }).create()
    await ProductFactory.merge({ isFeatured: false }).create()

    const productService = new ProductService()
    const featured = await productService.getFeatured()

    assert.lengthOf(featured, 2)
    featured.forEach((p) => assert.isTrue(p.isFeatured))
  })

  test('get products in stock', async ({ assert }) => {
    await ProductFactory.merge({ stockQuantity: 50, trackInventory: true }).create()
    await ProductFactory.merge({ stockQuantity: 0, trackInventory: true }).create()
    await ProductFactory.merge({ stockQuantity: 100, trackInventory: true }).create()

    const productService = new ProductService()
    const inStock = await productService.getInStock()

    assert.lengthOf(inStock, 2)
  })

  test('create product with variants', async ({ assert }) => {
    const data = {
      title: 'T-Shirt',
      type: 'variable',
      hasVariants: true,
      price: 29.99,
      sku: 'TSHIRT-BASE',
    }

    const productService = new ProductService()
    const product = await productService.create(data)

    assert.isTrue(product.hasVariants)
    assert.equal(product.type, 'variable')
  })

  test('update product stock', async ({ assert }) => {
    const product = await ProductFactory.merge({ stockQuantity: 100 }).create()

    const productService = new ProductService()
    const updated = await productService.updateStock(product.id, 75)

    assert.equal(updated.stockQuantity, 75)
  })

  test('decrease product stock', async ({ assert }) => {
    const product = await ProductFactory.merge({ stockQuantity: 100 }).create()

    const productService = new ProductService()
    const updated = await productService.decreaseStock(product.id, 25)

    assert.equal(updated.stockQuantity, 75)
  })

  test('increase product stock', async ({ assert }) => {
    const product = await ProductFactory.merge({ stockQuantity: 50 }).create()

    const productService = new ProductService()
    const updated = await productService.increaseStock(product.id, 30)

    assert.equal(updated.stockQuantity, 80)
  })

  test('delete product (soft delete)', async ({ assert }) => {
    const product = await ProductFactory.create()

    const productService = new ProductService()
    await productService.delete(product.id)

    const deleted = await Product.find(product.id)
    assert.isNull(deleted)
  })

  test('get related products', async ({ assert }) => {
    const category = await CategoryFactory.create()
    const product1 = await ProductFactory.create()
    const product2 = await ProductFactory.create()
    const product3 = await ProductFactory.create()

    await product1.related('categories').attach([category.id])
    await product2.related('categories').attach([category.id])
    await product3.related('categories').attach([category.id])

    const productService = new ProductService()
    const related = await productService.getRelated(product1.id, 4)

    assert.isTrue(related.length > 0)
    assert.notInclude(related.map((p) => p.id), product1.id)
  })

  test('bulk update product prices', async ({ assert }) => {
    const product1 = await ProductFactory.merge({ price: 100 }).create()
    const product2 = await ProductFactory.merge({ price: 200 }).create()

    const productService = new ProductService()
    const updates = [
      { id: product1.id, price: 110 },
      { id: product2.id, price: 220 },
    ]

    await productService.bulkUpdatePrices(updates)

    await product1.refresh()
    await product2.refresh()

    assert.equal(product1.price, 110)
    assert.equal(product2.price, 220)
  })
})
