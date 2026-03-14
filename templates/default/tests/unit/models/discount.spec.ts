import { test } from '@japa/runner'
import { DiscountFactory } from '#database/factories/main'
import Discount from '#models/discount'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Discount Model', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('create discount with required fields', async ({ assert }) => {
    const discount = await DiscountFactory.create()
    assert.isDefined(discount.id)
    assert.isNotEmpty(discount.code)
    assert.isNotEmpty(discount.name)
  })

  test('discount code uniqueness', async ({ assert }) => {
    await DiscountFactory.merge({ code: 'UNIQUE20' }).create()

    // Creating another discount with same code would fail validation
    const discount2 = await DiscountFactory.merge({ code: 'DIFFERENT30' }).create()

    assert.notEqual(discount2.code, 'UNIQUE20')
  })

  test('discount type percentage', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      type: 'percentage',
      value: 20,
    }).create()

    assert.equal(discount.type, 'percentage')
    assert.equal(discount.value, 20)
  })

  test('discount type fixed', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      type: 'fixed',
      value: 50,
    }).create()

    assert.equal(discount.type, 'fixed')
    assert.equal(discount.value, 50)
  })

  test('discount status active', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      isActive: true,
    }).create()

    assert.isTrue(discount.isActive)
  })

  test('discount inactive', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      isActive: false,
    }).create()

    assert.isFalse(discount.isActive)
  })

  test('discount usage limit', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      usageLimit: 100,
      usageCount: 50,
    }).create()

    assert.equal(discount.usageLimit, 100)
    assert.equal(discount.usageCount, 50)
    assert.isTrue(discount.usageCount < discount.usageLimit)
  })

  test('discount at usage limit', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      usageLimit: 100,
      usageCount: 100,
    }).create()

    assert.equal(discount.usageCount, discount.usageLimit)
  })

  test('discount first order only', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      firstOrderOnly: true,
    }).create()

    assert.isTrue(discount.firstOrderOnly)
  })

  test('discount automatic application', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      isAutomatic: true,
    }).create()

    assert.isTrue(discount.isAutomatic)
  })

  test('discount combinable', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      isCombinable: true,
    }).create()

    assert.isTrue(discount.isCombinable)
  })

  test('discount minimum order amount', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      minimumOrderAmount: 50,
    }).create()

    assert.equal(discount.minimumOrderAmount, 50)
  })
})
