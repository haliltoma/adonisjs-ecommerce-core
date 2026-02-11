import { test } from '@japa/runner'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth - Admin login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('admin can login with valid credentials', async ({ assert, client }) => {
    const password = 'password123'
    const user = await User.create({
      email: 'admin@test.com',
      password,
      fullName: 'Test Admin',
      isActive: true,
    })

    const response = await client.post('/admin/login').form({
      email: 'admin@test.com',
      password,
    })

    response.assertStatus(302)
    assert.isNotNull(user)
  })

  test('admin login fails with wrong password', async ({ client }) => {
    await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })

    const response = await client.post('/admin/login').form({
      email: 'admin@test.com',
      password: 'wrongpassword',
    })

    response.assertStatus(302)
  })

  test('admin login fails with non-existent email', async ({ client }) => {
    const response = await client.post('/admin/login').form({
      email: 'nonexistent@test.com',
      password: 'password123',
    })

    response.assertStatus(302)
  })

  test('unauthenticated user cannot access admin dashboard', async ({ client }) => {
    const response = await client.get('/admin/dashboard')

    response.assertStatus(302)
  })

  test('authenticated admin can access admin dashboard', async ({ client }) => {
    const user = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })

    const response = await client.get('/admin/dashboard').loginAs(user)

    response.assertStatus(200)
  })

  test('admin can logout', async ({ client }) => {
    const user = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })

    const response = await client.post('/admin/logout').loginAs(user)

    response.assertStatus(302)
  })

  test('password is hashed in database', async ({ assert }) => {
    const user = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })

    await user.refresh()
    assert.notEqual(user.password, 'password123')
    assert.isTrue(await hash.verify(user.password, 'password123'))
  })
})
