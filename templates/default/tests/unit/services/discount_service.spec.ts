import { test } from '@japa/runner'
import { DiscountFactory, ProductFactory } from '#database/factories/main'
import DiscountService from '#services/discount_service'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Discount Service', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('calculate percentage discount', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      type: 'percentage',
      value: 20,
    }).create()

    const discountService = new DiscountService()
    const result = discountService.calculateDiscount(discount, 100)

    assert.equal(result.discountAmount, 20)
    assert.equal(result.finalAmount, 80)
  })

  test('calculate fixed amount discount', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      type: 'fixed',
      value: 25,
    }).create()

    const discountService = new DiscountService()
    const result = discountService.calculateDiscount(discount, 100)

    assert.equal(result.discountAmount, 25)
    assert.equal(result.finalAmount, 75)
  })

  test('discount cannot exceed subtotal', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      type: 'fixed',
      value: 150,
    }).create()

    const discountService = new DiscountService()
    const result = discountService.calculateDiscount(discount, 100)

    assert.equal(result.discountAmount, 100)
    assert.equal(result.finalAmount, 0)
  })

  test('validate discount code', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      code: 'SAVE20',
      isActive: true,
      isPublic: true,
    }).create()

    const discountService = new DiscountService()
    const isValid = await discountService.validateCode('SAVE20')

    assert.isTrue(isValid)
  })

  test('inactive discount code is invalid', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      code: 'INACTIVE',
      isActive: false,
    }).create()

    const discountService = new DiscountService()
    const isValid = await discountService.validateCode('INACTIVE')

    assert.isFalse(isValid)
  })

  test('discount with minimum order requirement', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      type: 'percentage',
      value: 10,
      minimumOrderAmount: 50,
    }).create()

    const discountService = new DiscountService()

    // Below minimum
    const result1 = discountService.checkRequirements(discount, 25)
    assert.isFalse(result1.isValid)

    // Above minimum
    const result2 = discountService.checkRequirements(discount, 75)
    assert.isTrue(result2.isValid)
  })

  test('discount with usage limit', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      usageLimit: 100,
      usageCount: 95,
    }).create()

    const discountService = new DiscountService()
    const canUse = await discountService.checkUsageLimit(discount)

    assert.isTrue(canUse)
  })

  test('discount at usage limit cannot be used', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      usageLimit: 100,
      usageCount: 100,
    }).create()

    const discountService = new DiscountService()
    const canUse = await discountService.checkUsageLimit(discount)

    assert.isFalse(canUse)
  })

  test('increment discount usage count', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      usageCount: 10,
    }).create()

    const discountService = new DiscountService()
    await discountService.incrementUsage(discount.id)

    await discount.refresh()
    assert.equal(discount.usageCount, 11)
  })

  test('applicable to specific products only', async ({ assert }) => {
    const product1 = await ProductFactory.create()
    const product2 = await ProductFactory.create()

    const discount = await DiscountFactory.merge({
      appliesTo: 'specific',
    }).create()

    await discount.related('products').attach([product1.id])

    const discountService = new DiscountService()
    const applicable = await discountService.checkProductApplicability(discount, [product1.id])

    assert.isTrue(applicable)
  })

  test('free shipping discount', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      type: 'free_shipping',
    }).create()

    const discountService = new DiscountService()
    const result = discountService.calculateFreeShipping(discount, 15)

    assert.equal(result.shippingAmount, 0)
    assert.equal(result.discountAmount, 15)
  })

  test('combinable discounts', async ({ assert }) => {
    const discount1 = await DiscountFactory.merge({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
      isCombinable: true,
    }).create()

    const discount2 = await DiscountFactory.merge({
      code: 'EXTRA5',
      type: 'percentage',
      value: 5,
      isCombinable: true,
    }).create()

    const discountService = new DiscountService()
    const canCombine = discountService.canCombine([discount1, discount2])

    assert.isTrue(canCombine)
  })

  test('non-combinable discounts', async ({ assert }) => {
    const discount1 = await DiscountFactory.merge({
      code: 'SAVE10',
      isCombinable: false,
    }).create()

    const discount2 = await DiscountFactory.merge({
      code: 'EXTRA5',
      isCombinable: true,
    }).create()

    const discountService = new DiscountService()
    const canCombine = discountService.canCombine([discount1, discount2])

    assert.isFalse(canCombine)
  })

  test('first order only discount', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      firstOrderOnly: true,
    }).create()

    const discountService = new DiscountService()
    const isValidForNewCustomer = discountService.checkFirstOrder(discount, true)

    assert.isTrue(isValidForNewCustomer)
  })

  test('automatic discount applied without code', async ({ assert }) => {
    const discount = await DiscountFactory.merge({
      isAutomatic: true,
      type: 'percentage',
      value: 15,
    }).create()

    const discountService = new DiscountService()
    const automaticDiscounts = await discountService.getAutomaticDiscounts()

    assert.lengthOf(automaticDiscounts, 1)
    assert.equal(automaticDiscounts[0].id, discount.id)
  })
})
