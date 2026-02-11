import { test } from '@japa/runner'
import User from '#models/user'
import Store from '#models/store'
import Setting from '#models/setting'
import TaxClass from '#models/tax_class'
import TaxRate from '#models/tax_rate'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Settings - Store settings', (group) => {
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

  test('admin can access settings page', async ({ client }) => {
    const response = await client.get('/admin/settings').loginAs(admin)
    response.assertStatus(200)
  })

  test('unauthenticated user cannot access settings', async ({ client }) => {
    const response = await client.get('/admin/settings')
    response.assertStatus(302)
  })

  test('settings can be stored in the database', async ({ assert }) => {
    const setting = await Setting.create({
      storeId: store.id,
      group: 'general',
      key: 'store_name',
      value: 'My Store',
      type: 'string',
      isPublic: true,
    })

    assert.isNotNull(setting)
    assert.equal(setting.group, 'general')
    assert.equal(setting.key, 'store_name')
    assert.equal(setting.value, 'My Store')
  })

  test('settings can be updated', async ({ assert }) => {
    const setting = await Setting.create({
      storeId: store.id,
      group: 'general',
      key: 'store_email',
      value: 'old@example.com',
      type: 'string',
      isPublic: true,
    })

    setting.value = 'new@example.com'
    await setting.save()
    await setting.refresh()

    assert.equal(setting.value, 'new@example.com')
  })

  test('settings can be queried by group', async ({ assert }) => {
    await Setting.create({
      storeId: store.id,
      group: 'shipping',
      key: 'free_shipping_threshold',
      value: 75,
      type: 'number',
      isPublic: false,
    })

    await Setting.create({
      storeId: store.id,
      group: 'shipping',
      key: 'default_shipping_rate',
      value: 9.99,
      type: 'number',
      isPublic: false,
    })

    await Setting.create({
      storeId: store.id,
      group: 'general',
      key: 'store_name',
      value: 'Test',
      type: 'string',
      isPublic: true,
    })

    const shippingSettings = await Setting.query()
      .where('storeId', store.id)
      .where('group', 'shipping')

    assert.equal(shippingSettings.length, 2)
  })

  test('boolean settings are stored correctly', async ({ assert }) => {
    const setting = await Setting.create({
      storeId: store.id,
      group: 'checkout',
      key: 'guest_checkout_enabled',
      value: true,
      type: 'boolean',
      isPublic: false,
    })

    await setting.refresh()
    assert.equal(setting.type, 'boolean')
    assert.isTrue(!!setting.value)
  })
})

test.group('Settings - Tax configuration', (group) => {
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

  test('create tax class', async ({ assert }) => {
    const taxClass = await TaxClass.create({
      storeId: store.id,
      name: 'Standard',
      description: 'Standard tax class',
      isDefault: true,
    })

    assert.isNotNull(taxClass.id)
    assert.equal(taxClass.name, 'Standard')
    assert.isTrue(taxClass.isDefault)
  })

  test('create tax rate for a class', async ({ assert }) => {
    const taxClass = await TaxClass.create({
      storeId: store.id,
      name: 'Standard',
      isDefault: true,
    })

    const taxRate = await TaxRate.create({
      taxClassId: taxClass.id,
      name: 'NY State Tax',
      rate: 8.875,
      country: 'US',
      state: 'NY',
      priority: 1,
      isCompound: false,
    })

    assert.isNotNull(taxRate.id)
    assert.equal(taxRate.rate, 8.875)
    assert.equal(taxRate.country, 'US')
    assert.equal(taxRate.state, 'NY')
  })

  test('multiple tax rates per class', async ({ assert }) => {
    const taxClass = await TaxClass.create({
      storeId: store.id,
      name: 'Standard',
      isDefault: true,
    })

    await TaxRate.create({
      taxClassId: taxClass.id,
      name: 'State Tax',
      rate: 6.25,
      country: 'US',
      state: 'TX',
      priority: 1,
      isCompound: false,
    })

    await TaxRate.create({
      taxClassId: taxClass.id,
      name: 'County Tax',
      rate: 2,
      country: 'US',
      state: 'TX',
      priority: 2,
      isCompound: true,
    })

    const rates = await TaxRate.query().where('taxClassId', taxClass.id)
    assert.equal(rates.length, 2)
  })

  test('update tax rate', async ({ assert }) => {
    const taxClass = await TaxClass.create({
      storeId: store.id,
      name: 'Standard',
      isDefault: true,
    })

    const taxRate = await TaxRate.create({
      taxClassId: taxClass.id,
      name: 'Old Rate',
      rate: 5,
      country: 'US',
      priority: 1,
      isCompound: false,
    })

    taxRate.rate = 7.5
    taxRate.name = 'Updated Rate'
    await taxRate.save()
    await taxRate.refresh()

    assert.equal(taxRate.rate, 7.5)
    assert.equal(taxRate.name, 'Updated Rate')
  })

  test('delete tax rate', async ({ assert }) => {
    const taxClass = await TaxClass.create({
      storeId: store.id,
      name: 'Standard',
      isDefault: true,
    })

    const taxRate = await TaxRate.create({
      taxClassId: taxClass.id,
      name: 'Delete Me',
      rate: 10,
      country: 'US',
      priority: 1,
      isCompound: false,
    })

    await taxRate.delete()
    const found = await TaxRate.find(taxRate.id)
    assert.isNull(found)
  })
})
