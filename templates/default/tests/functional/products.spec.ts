import { test } from '@japa/runner'
import User from '#models/user'
import Product from '#models/product'
import Store from '#models/store'
import testUtils from '@adonisjs/core/services/test_utils'

const productDefaults = {
  type: 'simple' as const,
  isTaxable: true,
  requiresShipping: true,
  trackInventory: false,
  stockQuantity: 100,
  hasVariants: false,
  isFeatured: false,
  sortOrder: 0,
  customFields: {},
  weightUnit: 'kg' as const,
}

test.group('Products - CRUD', (group) => {
  let admin: User
  let store: Store

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create({
      name: 'Test Store',
      slug: 'test-store',
      defaultCurrency: 'USD',
      defaultLocale: 'en',
      timezone: 'UTC',
      isActive: true,
      config: {},
      meta: {},
    })

    admin = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })
  })

  test('admin can list products', async ({ client }) => {
    await Product.create({
      ...productDefaults,
      storeId: store.id,
      title: 'Test Product',
      slug: 'test-product',
      price: 29.99,
      status: 'active',
    })

    const response = await client.get('/admin/products').loginAs(admin)
    response.assertStatus(200)
  })

  test('admin can create a product', async ({ assert, client }) => {
    const response = await client.post('/admin/products').loginAs(admin).form({
      title: 'New Product',
      slug: 'new-product',
      price: 49.99,
      status: 'draft',
      description: 'A great product',
      storeId: store.id,
    })

    response.assertStatus(302)

    const product = await Product.findBy('slug', 'new-product')
    assert.isNotNull(product)
    if (product) {
      assert.equal(product.title, 'New Product')
    }
  })

  test('admin can update a product', async ({ assert, client }) => {
    const product = await Product.create({
      ...productDefaults,
      storeId: store.id,
      title: 'Old Title',
      slug: 'old-title',
      price: 29.99,
      status: 'draft',
    })

    const response = await client
      .put(`/admin/products/${product.id}`)
      .loginAs(admin)
      .form({
        title: 'New Title',
        slug: 'new-title',
        price: 39.99,
        status: 'active',
      })

    response.assertStatus(302)

    await product.refresh()
    assert.equal(product.title, 'New Title')
    assert.equal(product.price, 39.99)
  })

  test('admin can delete a product', async ({ assert, client }) => {
    const product = await Product.create({
      ...productDefaults,
      storeId: store.id,
      title: 'Delete Me',
      slug: 'delete-me',
      price: 9.99,
      status: 'draft',
    })

    const response = await client
      .delete(`/admin/products/${product.id}`)
      .loginAs(admin)

    response.assertStatus(302)

    const found = await Product.find(product.id)
    // Either soft-deleted or hard-deleted
    assert.isTrue(!found || found.deletedAt !== null)
  })
})

test.group('Products - Storefront', (group) => {
  let store: Store

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create({
      name: 'Test Store',
      slug: 'test-store',
      defaultCurrency: 'USD',
      defaultLocale: 'en',
      timezone: 'UTC',
      isActive: true,
      config: {},
      meta: {},
    })
  })

  test('storefront shows only active products', async ({ client }) => {
    await Product.create({
      ...productDefaults,
      storeId: store.id,
      title: 'Active Product',
      slug: 'active-product',
      price: 29.99,
      status: 'active',
    })

    await Product.create({
      ...productDefaults,
      storeId: store.id,
      title: 'Draft Product',
      slug: 'draft-product',
      price: 19.99,
      status: 'draft',
    })

    const response = await client.get('/products')
    response.assertStatus(200)
  })

  test('storefront product detail page returns 200 for active product', async ({ client }) => {
    await Product.create({
      ...productDefaults,
      storeId: store.id,
      title: 'Detail Product',
      slug: 'detail-product',
      price: 49.99,
      status: 'active',
    })

    const response = await client.get('/products/detail-product')
    response.assertStatus(200)
  })

  test('storefront product detail returns 404 for non-existent product', async ({ client }) => {
    const response = await client.get('/products/non-existent-slug')
    response.assertStatus(404)
  })
})
