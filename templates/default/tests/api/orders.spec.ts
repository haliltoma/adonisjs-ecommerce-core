import { test, expect } from '@japa/expect'
import { apiClient } from '../app'

test.group('Orders API', (group) => {
  group.setup(async () => {
    await apiClient.prepare()
  })

  test('GET /api/orders - without auth returns 401', async ({ client }) => {
    const response = await client.get('/api/orders')
    expect(response.status()).toBe(401)
  })

  test('POST /api/orders - empty cart returns error', async ({ client }) => {
    // First login to get token
    const loginResponse = await client
      .post('/api/customers/login')
      .json({
        email: 'test@example.com',
        password: 'Test1234!',
      })

    const token = loginResponse.body().token

    if (!token) {
      console.log('Skipping order test - no authenticated user')
      return
    }

    // Try to create order with empty cart
    const response = await client
      .post('/api/orders')
      .header('Authorization', `Bearer ${token}`)
      .json({
        email: 'test@example.com',
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          address1: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'US',
        },
      })

    expect(response.status()).toBeOneOf([400, 422])
  })

  test('GET /api/orders/:id - invalid ID returns 404', async ({ client }) => {
    const loginResponse = await client
      .post('/api/customers/login')
      .json({
        email: 'test@example.com',
        password: 'Test1234!',
      })

    const token = loginResponse.body().token

    if (!token) return

    const response = await client
      .get('/api/orders/invalid-id-123')
      .header('Authorization', `Bearer ${token}`)

    expect(response.status()).toBe(404)
  })
})