import { test, expect } from '@japa/expect'
import { apiClient } from '../app'

test.group('Categories API', (group) => {
  group.setup(async () => {
    await apiClient.prepare()
  })

  test('GET /api/categories returns categories list', async ({ client }) => {
    const response = await client.get('/api/categories')

    expect(response.status()).toBe(200)
  })

  test('GET /api/categories/tree returns category tree', async ({ client }) => {
    const response = await client.get('/api/categories/tree')

    expect(response.status()).toBe(200)
  })

  test('GET /api/categories/:id returns single category', async ({ client }) => {
    const listResponse = await client.get('/api/categories')
    const categories = listResponse.body().data || []
    const firstCategory = categories[0]

    if (firstCategory) {
      const response = await client.get(`/api/categories/${firstCategory.id}`)
      expect(response.status()).toBe(200)
    }
  })
})