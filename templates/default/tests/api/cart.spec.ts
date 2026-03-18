import { test, expect } from '@japa/expect'
import { apiClient } from '../app'

test.group('Cart API', (group) => {
  group.setup(async () => {
    await apiClient.prepare()
  })

  let testProductId: string | null = null

  test('GET /api/cart - empty cart returns 200', async ({ client }) => {
    const response = await client.get('/api/cart')
    expect(response.status()).toBe(200)
  })

  test('POST /api/cart/items - add item to cart', async ({ client }) => {
    // First get a valid product ID
    const productsResponse = await client.get('/api/products')
    const products = productsResponse.body().data || []
    const product = products.find((p: any) => p.status === 'active')

    if (!product) {
      console.log('No active products found')
      return
    }

    const response = await client
      .post('/api/cart/items')
      .json({
        productId: product.id,
        quantity: 1,
      })

    expect(response.status()).toBe(200)
    expect(response.body()).toHaveProperty('data')
  })

  test('POST /api/cart/items - add item with invalid product returns 400', async ({ client }) => {
    const response = await client
      .post('/api/cart/items')
      .json({
        productId: 'non-existent-product-id',
        quantity: 1,
      })

    expect(response.status()).toBe(400)
  })

  test('POST /api/cart/items - quantity 0 returns validation error', async ({ client }) => {
    const productsResponse = await client.get('/api/products')
    const products = productsResponse.body().data || []
    const product = products.find((p: any) => p.status === 'active')

    if (!product) return

    const response = await client
      .post('/api/cart/items')
      .json({
        productId: product.id,
        quantity: 0,
      })

    expect([400, 422]).toContain(response.status)
  })

  test('POST /api/cart/items - negative quantity returns validation error', async ({ client }) => {
    const productsResponse = await client.get('/api/products')
    const products = productsResponse.body().data || []
    const product = products.find((p: any) => p.status === 'active')

    if (!product) return

    const response = await client
      .post('/api/cart/items')
      .json({
        productId: product.id,
        quantity: -1,
      })

    expect([400, 422]).toContain(response.status)
  })

  test('PATCH /api/cart/items/:id - update quantity', async ({ client }) => {
    // Add item first
    const productsResponse = await client.get('/api/products')
    const products = productsResponse.body().data || []
    const product = products.find((p: any) => p.status === 'active')

    if (!product) return

    const addResponse = await client
      .post('/api/cart/items')
      .json({
        productId: product.id,
        quantity: 1,
      })

    const cartData = addResponse.body().data
    const firstItem = cartData?.items?.[0]

    if (!firstItem) return

    const updateResponse = await client
      .patch(`/api/cart/items/${firstItem.id}`)
      .json({
        quantity: 2,
      })

    expect(updateResponse.status()).toBe(200)
  })

  test('DELETE /api/cart/items/:id - remove item from cart', async ({ client }) => {
    // Add item first
    const productsResponse = await client.get('/api/products')
    const products = productsResponse.body().data || []
    const product = products.find((p: any) => p.status === 'active')

    if (!product) return

    const addResponse = await client
      .post('/api/cart/items')
      .json({
        productId: product.id,
        quantity: 1,
      })

    const cartData = addResponse.body().data
    const firstItem = cartData?.items?.[0]

    if (!firstItem) return

    const deleteResponse = await client.delete(`/api/cart/items/${firstItem.id}`)
    expect(deleteResponse.status()).toBe(200)
  })

  test('DELETE /api/cart - clear entire cart', async ({ client }) => {
    const response = await client.delete('/api/cart')
    expect(response.status()).toBe(200)
  })

  test('POST /api/cart/discount - apply invalid discount code', async ({ client }) => {
    const response = await client
      .post('/api/cart/discount')
      .json({
        code: 'INVALIDCODE123',
      })

    expect(response.status()).toBe(400)
  })
})