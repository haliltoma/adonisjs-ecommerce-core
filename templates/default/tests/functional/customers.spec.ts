import { test } from '@japa/runner'
import User from '#models/user'
import Customer from '#models/customer'
import CustomerAddress from '#models/customer_address'
import Store from '#models/store'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'

function createStoreData() {
  return {
    name: 'Test Store',
    slug: 'test-store',
    defaultCurrency: 'USD',
    defaultLocale: 'en',
    timezone: 'UTC',
    isActive: true,
    config: {},
    meta: {},
  }
}

function createCustomerData(storeId: string, overrides: Record<string, unknown> = {}) {
  return {
    storeId,
    email: 'customer@test.com',
    firstName: 'Jane',
    lastName: 'Doe',
    status: 'active' as const,
    acceptsMarketing: false,
    totalOrders: 0,
    totalSpent: 0,
    tags: [],
    metadata: {},
    ...overrides,
  }
}

test.group('Customers - Model operations', (group) => {
  let store: Store

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create(createStoreData())
  })

  test('create a customer', async ({ assert }) => {
    const customer = await Customer.create(createCustomerData(store.id))

    assert.isNotNull(customer.id)
    assert.equal(customer.email, 'customer@test.com')
    assert.equal(customer.firstName, 'Jane')
    assert.equal(customer.lastName, 'Doe')
    assert.equal(customer.status, 'active')
  })

  test('customer email is unique per store', async ({ assert }) => {
    await Customer.create(createCustomerData(store.id))

    try {
      await Customer.create(createCustomerData(store.id, { email: 'customer@test.com' }))
      assert.fail('Should have thrown for duplicate email')
    } catch {
      assert.isTrue(true)
    }
  })

  test('customer password is hashed', async ({ assert }) => {
    const passwordHash = await hash.make('secret123')
    const customer = await Customer.create(createCustomerData(store.id, { passwordHash }))

    assert.notEqual(customer.passwordHash, 'secret123')
    assert.isTrue(await hash.verify(customer.passwordHash!, 'secret123'))
  })

  test('update customer details', async ({ assert }) => {
    const customer = await Customer.create(createCustomerData(store.id))

    customer.merge({
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+1234567890',
      acceptsMarketing: true,
    })
    await customer.save()
    await customer.refresh()

    assert.equal(customer.firstName, 'Updated')
    assert.equal(customer.lastName, 'Name')
    assert.equal(customer.phone, '+1234567890')
    assert.isTrue(customer.acceptsMarketing)
  })

  test('update customer order stats', async ({ assert }) => {
    const customer = await Customer.create(createCustomerData(store.id))

    customer.totalOrders = 5
    customer.totalSpent = 499.95
    await customer.save()
    await customer.refresh()

    assert.equal(customer.totalOrders, 5)
    assert.equal(customer.totalSpent, 499.95)
  })

  test('customer can be deactivated', async ({ assert }) => {
    const customer = await Customer.create(createCustomerData(store.id))

    customer.status = 'inactive'
    await customer.save()
    await customer.refresh()

    assert.equal(customer.status, 'inactive')
  })

  test('find customer by email', async ({ assert }) => {
    await Customer.create(createCustomerData(store.id))

    const found = await Customer.query()
      .where('storeId', store.id)
      .where('email', 'customer@test.com')
      .first()

    assert.isNotNull(found)
    assert.equal(found!.email, 'customer@test.com')
  })
})

test.group('Customers - Address management', (group) => {
  let store: Store
  let customer: Customer

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create(createStoreData())
    customer = await Customer.create(createCustomerData(store.id))
  })

  test('add shipping address', async ({ assert }) => {
    const address = await CustomerAddress.create({
      customerId: customer.id,
      type: 'shipping',
      firstName: 'Jane',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      isDefault: true,
    })

    assert.isNotNull(address.id)
    assert.equal(address.customerId, customer.id)
    assert.equal(address.type, 'shipping')
    assert.isTrue(address.isDefault)
  })

  test('add billing address', async ({ assert }) => {
    const address = await CustomerAddress.create({
      customerId: customer.id,
      type: 'billing',
      firstName: 'Jane',
      lastName: 'Doe',
      address1: '456 Billing Ave',
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
      country: 'US',
      isDefault: true,
    })

    assert.equal(address.type, 'billing')
    assert.equal(address.city, 'Boston')
  })

  test('customer can have multiple addresses', async ({ assert }) => {
    await CustomerAddress.create({
      customerId: customer.id,
      type: 'shipping',
      firstName: 'Jane',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      isDefault: true,
    })

    await CustomerAddress.create({
      customerId: customer.id,
      type: 'shipping',
      firstName: 'Jane',
      lastName: 'Doe',
      address1: '789 Second St',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'US',
      isDefault: false,
    })

    const addresses = await CustomerAddress.query().where('customerId', customer.id)
    assert.equal(addresses.length, 2)
  })

  test('update address', async ({ assert }) => {
    const address = await CustomerAddress.create({
      customerId: customer.id,
      type: 'shipping',
      firstName: 'Jane',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      isDefault: true,
    })

    address.merge({
      address1: '999 Updated Blvd',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
    })
    await address.save()
    await address.refresh()

    assert.equal(address.address1, '999 Updated Blvd')
    assert.equal(address.city, 'Los Angeles')
  })

  test('delete address', async ({ assert }) => {
    const address = await CustomerAddress.create({
      customerId: customer.id,
      type: 'shipping',
      firstName: 'Jane',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      isDefault: false,
    })

    await address.delete()

    const found = await CustomerAddress.find(address.id)
    assert.isNull(found)
  })
})

test.group('Customers - Admin access', (group) => {
  let admin: User
  let store: Store

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create(createStoreData())
    admin = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })
  })

  test('admin can list customers', async ({ client }) => {
    const response = await client.get('/admin/customers').loginAs(admin)
    response.assertStatus(200)
  })

  test('unauthenticated user cannot access customers', async ({ client }) => {
    const response = await client.get('/admin/customers')
    response.assertStatus(302)
  })
})
