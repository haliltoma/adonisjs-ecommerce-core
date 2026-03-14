import { test } from '@japa/runner'
import { ProductFactory, CartFactory } from '#database/factories/main'
import { ApiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Cart API Integration', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('POST /api/cart creates new cart', async ({ assert }) => {
    const client = new ApiClient(app)
    const response = await client.post('/api/cart').json({
      currencyCode: 'USD',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      data: {
        currencyCode: 'USD',
        totalItems: 0,
        grandTotal: 0,
      },
    })
    assert.exists(response.body().data.id)
  })

  test('POST /api/cart/items adds item to cart', async ({ assert }) => {
    const cart = await CartFactory.create()
    const product = await ProductFactory.merge({ price: 29.99 }).create()

    const client = new ApiClient(app)
    const response = await client.post(`/api/cart/${cart.id}/items`).json({
      productId: product.id,
      quantity: 2,
      unitPrice: product.price,
    })

    response.assertStatus(201)
    response.assertBodyContains({
      data: {
        quantity: 2,
        totalPrice: 59.98,
      },
    })
  })

  test('PATCH /api/cart/items/:id updates cart item quantity', async ({ assert }) => {
    const cart = await CartFactory.create()
    const product = await ProductFactory.merge({ price: 29.99 }).create()

    const client = new ApiClient(app)

    // Add item first
    await client.post(`/api/cart/${cart.id}/items`).json({
      productId: product.id,
      quantity: 2,
      unitPrice: product.price,
    })

    // Get the cart item (assuming first item)
    const cartResponse = await client.get(`/api/cart/${cart.id}`)
    const itemId = cartResponse.body().data.items[0].id

    // Update quantity
    const response = await client.patch(`/api/cart/${cart.id}/items/${itemId}`).json({
      quantity: 5,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        quantity: 5,
        totalPrice: 149.95,
      },
    })
  })

  test('DELETE /api/cart/items/:id removes item from cart', async ({ assert }) => {
    const cart = await CartFactory.create()
    const product = await ProductFactory.create()

    const client = new ApiClient(app)

    // Add item
    await client.post(`/api/cart/${cart.id}/items`).json({
      productId: product.id,
      quantity: 1,
      unitPrice: product.price,
    })

    // Get item ID
    const cartResponse = await client.get(`/api/cart/${cart.id}`)
    const itemId = cartResponse.body().data.items[0].id

    // Remove item
    const response = await client.delete(`/api/cart/${cart.id}/items/${itemId}`)

    response.assertStatus(204)
  })

  test('POST /api/cart/:id/discount applies discount code', async ({ assert }) => {
    const cart = await CartFactory.merge({
      subtotal: 100,
    }).create()

    const client = new ApiClient(app)
    const response = await client.post(`/api/cart/${cart.id}/discount`).json({
      code: 'SAVE10',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        discountTotal: 10,
        grandTotal: 90,
      },
    })
  })

  test('DELETE /api/cart/:id/discount removes discount', async ({ assert }) => {
    const cart = await CartFactory.merge({
      subtotal: 100,
      discountTotal: 10,
      grandTotal: 90,
    }).create()

    const client = new ApiClient(app)
    const response = await client.delete(`/api/cart/${cart.id}/discount`)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        discountTotal: 0,
        grandTotal: 100,
      },
    })
  })

  test('GET /api/cart/:id returns cart with calculations', async ({ assert }) => {
    const cart = await CartFactory.create()

    const client = new ApiClient(app)
    const response = await client.get(`/api/cart/${cart.id}`)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: cart.id,
        currencyCode: cart.currencyCode,
        totalItems: cart.totalItems,
        grandTotal: cart.grandTotal,
      },
    })
  })

  test('DELETE /api/cart/:id clears all items', async ({ assert }) => {
    const cart = await CartFactory.merge({
      totalItems: 5,
    }).create()

    const client = new ApiClient(app)
    const response = await client.delete(`/api/cart/${cart.id}`)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        totalItems: 0,
        grandTotal: 0,
      },
    })
  })
})
