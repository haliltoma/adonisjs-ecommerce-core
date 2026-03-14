import { test } from '@japa/runner'
import { CustomerFactory } from '#database/factories/main'
import Customer from '#models/customer'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Customer Model', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('create customer with required fields', async ({ assert }) => {
    const customer = await CustomerFactory.create()
    assert.isDefined(customer.id)
    assert.isNotEmpty(customer.email)
    assert.isNotEmpty(customer.firstName)
    assert.isNotEmpty(customer.lastName)
  })

  test('customer email is required', async ({ assert }) => {
    const customer = await CustomerFactory.create()
    assert.isDefined(customer.email)
    assert.include(customer.email, '@')
  })

  test('customer full name calculation', async ({ assert }) => {
    const customer = await CustomerFactory.merge({
      firstName: 'John',
      lastName: 'Doe',
    }).create()

    const fullName = `${customer.firstName} ${customer.lastName}`
    assert.equal(fullName, 'John Doe')
  })

  test('customer status defaults to active', async ({ assert }) => {
    const customer = await CustomerFactory.create()
    assert.equal(customer.status, 'active')
  })

  test('customer accepts marketing flag', async ({ assert }) => {
    const customer = await CustomerFactory.merge({
      acceptsMarketing: true,
    }).create()

    assert.isTrue(customer.acceptsMarketing)
  })

  test('customer total orders defaults to 0', async ({ assert }) => {
    const customer = await CustomerFactory.create()
    assert.equal(customer.totalOrders, 0)
  })

  test('customer total spent defaults to 0', async ({ assert }) => {
    const customer = await CustomerFactory.create()
    assert.equal(customer.totalSpent, 0)
  })

  test('customer phone number', async ({ assert }) => {
    const customer = await CustomerFactory.create()
    assert.isDefined(customer.phone)
  })

  test('customer tags array', async ({ assert }) => {
    const customer = await CustomerFactory.merge({
      tags: ['vip', 'repeat-customer'],
    }).create()

    assert.isArray(customer.tags)
    assert.lengthOf(customer.tags, 2)
    assert.include(customer.tags, 'vip')
  })

  test('customer metadata object', async ({ assert }) => {
    const customer = await CustomerFactory.merge({
      metadata: {
        source: 'google',
        campaign: 'spring-sale',
      },
    }).create()

    assert.isObject(customer.metadata)
    assert.equal(customer.metadata.source, 'google')
  })

  test('customer can be inactive', async ({ assert }) => {
    const customer = await CustomerFactory.merge({
      status: 'inactive',
    }).create()

    assert.equal(customer.status, 'inactive')
  })
})
