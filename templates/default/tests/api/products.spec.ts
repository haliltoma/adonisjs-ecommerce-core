import { test, expect } from '@japa/expect'
import { apiClient } from '../app'

test.group('Products API', (group) => {
  group.setup(async () => {
    await apiClient.prepare()
  })

  test('GET /api/products returns products list', async ({ client }) => {
    const response = await client.get('/api/products')

    expect(response.status()).toBe(200)
    expect(response.body()).toHaveProperty('data')
  })

  test('GET /api/products - pagination works', async ({ client }) => {
    const response = await client.get('/api/products?page=1&limit=10')

    expect(response.status()).toBe(200)
    expect(response.body()).toHaveProperty('meta')
  })

  test('GET /api/products/:id - valid product returns 200', async ({ client }) => {
    // First get products to find a valid ID
    const listResponse = await client.get('/api/products')
    const firstProduct = listResponse.body().data?.[0]

    if (firstProduct) {
      const response = await client.get(`/api/products/${firstProduct.id}`)
      expect(response.status()).toBe(200)
      expect(response.body()).toHaveProperty('data')
    }
  })

  test('GET /api/products/:id - invalid ID returns 404', async ({ client }) => {
    const response = await client.get('/api/products/invalid-id-12345')
    expect(response.status()).toBe(404)
  })

  test('GET /api/products/search - search functionality', async ({ client }) => {
    const response = await client.get('/api/products/search?q=product')
    expect(response.status()).toBe(200)
  })

  test('GET /api/products/featured - featured products', async ({ client }) => {
    const response = await client.get('/api/products/featured')
    expect(response.status()).toBe(200)
    expect(response.body()).toHaveProperty('data')
  })
})