import { test } from '@japa/runner'
import { ProductFactory, CategoryFactory } from '#database/factories/main'
import { ApiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Products API Integration', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /api/products returns paginated products', async ({ assert }) => {
    await ProductFactory.createMany(25)

    const client = new ApiClient(app)
    const response = await client.get('/api/products').qs({ page: 1, limit: 10 })

    response.assertStatus(200)
    response.assertBodyContains({
      meta: { total: 25 },
    })
    assert.lengthOf(response.body().data, 10)
  })

  test('GET /api/products/:id returns single product', async ({ assert }) => {
    const product = await ProductFactory.create()

    const client = new ApiClient(app)
    const response = await client.get(`/api/products/${product.id}`)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: product.id,
        title: product.title,
      },
    })
  })

  test('GET /api/products/slug/:slug returns product by slug', async ({ assert }) => {
    const product = await ProductFactory.merge({
      slug: 'test-product',
    }).create()

    const client = new ApiClient(app)
    const response = await client.get('/api/products/slug/test-product')

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        slug: 'test-product',
      },
    })
  })

  test('GET /api/products/category/:id returns products by category', async ({ assert }) => {
    const category = await CategoryFactory.create()
    const product1 = await ProductFactory.create()
    const product2 = await ProductFactory.create()

    await product1.related('categories').attach([category.id])
    await product2.related('categories').attach([category.id])

    const client = new ApiClient(app)
    const response = await client.get(`/api/products/category/${category.id}`)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 2)
  })

  test('GET /api/products/search?q=query searches products', async ({ assert }) => {
    await ProductFactory.merge({ title: 'Red Widget Pro' }).create()
    await ProductFactory.merge({ title: 'Blue Gadget' }).create()
    await ProductFactory.merge({ title: 'Red Tool Set' }).create()

    const client = new ApiClient(app)
    const response = await client.get('/api/products/search').qs({ q: 'red' })

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 2)
  })

  test('GET /api/products/featured returns featured products', async ({ assert }) => {
    await ProductFactory.merge({ isFeatured: true }).create()
    await ProductFactory.merge({ isFeatured: true }).create()
    await ProductFactory.merge({ isFeatured: false }).create()

    const client = new ApiClient(app)
    const response = await client.get('/api/products/featured')

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 2)
  })

  test('POST /api/products creates new product', async ({ assert }) => {
    const client = new ApiClient(app)
    const productData = {
      title: 'New Product',
      price: 99.99,
      sku: 'NEW-001',
      status: 'active',
    }

    const response = await client.post('/api/products').json(productData)

    response.assertStatus(201)
    response.assertBodyContains({
      data: {
        title: 'New Product',
        price: 99.99,
      },
    })
  })

  test('PATCH /api/products/:id updates product', async ({ assert }) => {
    const product = await ProductFactory.merge({ price: 50 }).create()

    const client = new ApiClient(app)
    const response = await client.patch(`/api/products/${product.id}`).json({
      price: 75,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        price: 75,
      },
    })
  })

  test('DELETE /api/products/:id deletes product', async ({ assert }) => {
    const product = await ProductFactory.create()

    const client = new ApiClient(app)
    const response = await client.delete(`/api/products/${product.id}`)

    response.assertStatus(204)
  })

  test('GET /api/products returns 404 for non-existent product', async ({ assert }) => {
    const client = new ApiClient(app)
    const fakeId = '00000000-0000-0000-0000-000000000000'

    const response = await client.get(`/api/products/${fakeId}`)

    response.assertStatus(404)
  })
})
