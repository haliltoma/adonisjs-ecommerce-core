import { test, expect } from '@japa/expect'
import { apiClient } from '../app'

test.group('Auth API', (group) => {
  group.setup(async () => {
    await apiClient.prepare()
  })

  const testEmail = `test_${Date.now()}@example.com`
  const testPassword = 'Test1234!'

  test('POST /api/customers/register - valid data creates account', async ({ client }) => {
    const response = await client
      .post('/api/customers/register')
      .json({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
      })

    expect(response.status()).toBeOneOf([200, 201])
    expect(response.body()).toHaveProperty('token')
  })

  test('POST /api/customers/register - duplicate email returns 409', async ({ client }) => {
    const response = await client
      .post('/api/customers/register')
      .json({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
      })

    expect(response.status()).toBeOneOf([409, 422])
  })

  test('POST /api/customers/register - missing required fields returns 422', async ({ client }) => {
    const response = await client
      .post('/api/customers/register')
      .json({
        email: 'test@example.com',
      })

    expect(response.status()).toBe(422)
    expect(response.body()).toHaveProperty('errors')
  })

  test('POST /api/customers/login - valid credentials returns token', async ({ client }) => {
    const response = await client
      .post('/api/customers/login')
      .json({
        email: testEmail,
        password: testPassword,
      })

    expect(response.status()).toBe(200)
    expect(response.body()).toHaveProperty('token')
  })

  test('POST /api/customers/login - wrong password returns 401', async ({ client }) => {
    const response = await client
      .post('/api/customers/login')
      .json({
        email: testEmail,
        password: 'wrongpassword',
      })

    expect(response.status()).toBe(401)
  })

  test('POST /api/customers/login - non-existent user returns 401', async ({ client }) => {
    const response = await client
      .post('/api/customers/login')
      .json({
        email: 'nonexistent@example.com',
        password: 'password123',
      })

    expect(response.status()).toBe(401)
  })
})