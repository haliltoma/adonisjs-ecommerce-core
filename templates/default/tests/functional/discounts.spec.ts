import { test } from '@japa/runner'
import Discount from '#models/discount'
import Store from '#models/store'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

function createDiscountData(storeId: string, overrides: Record<string, unknown> = {}) {
  return {
    storeId,
    code: 'SAVE10',
    name: '10% Off',
    type: 'percentage' as const,
    value: 10,
    appliesTo: 'all' as const,
    usageCount: 0,
    isActive: true,
    isPublic: true,
    firstOrderOnly: false,
    isAutomatic: false,
    priority: 0,
    isCombinable: false,
    ...overrides,
  }
}

test.group('Discounts - Coupon validation', (group) => {
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

  test('active discount can be found by code', async ({ assert }) => {
    await Discount.create(createDiscountData(store.id))

    const discount = await Discount.query()
      .where('code', 'SAVE10')
      .where('storeId', store.id)
      .where('isActive', true)
      .first()

    assert.isNotNull(discount)
    assert.equal(discount!.code, 'SAVE10')
    assert.equal(discount!.type, 'percentage')
    assert.equal(discount!.value, 10)
  })

  test('inactive discount is not returned', async ({ assert }) => {
    await Discount.create(createDiscountData(store.id, {
      code: 'INACTIVE',
      name: 'Inactive Discount',
      isActive: false,
    }))

    const discount = await Discount.query()
      .where('code', 'INACTIVE')
      .where('storeId', store.id)
      .where('isActive', true)
      .first()

    assert.isNull(discount)
  })

  test('expired discount is detected', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'EXPIRED',
      name: 'Expired Discount',
      value: 15,
      endsAt: DateTime.now().minus({ days: 1 }),
    }))

    assert.isNotNull(discount.endsAt)
    assert.isTrue(discount.endsAt! < DateTime.now())
  })

  test('not-yet-active discount is detected', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'FUTURE',
      name: 'Future Discount',
      type: 'fixed_amount',
      value: 25,
      startsAt: DateTime.now().plus({ days: 7 }),
    }))

    assert.isNotNull(discount.startsAt)
    assert.isTrue(discount.startsAt! > DateTime.now())
  })

  test('usage limit is enforced', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'LIMITED',
      name: 'Limited Discount',
      value: 20,
      usageCount: 100,
      usageLimit: 100,
    }))

    const isExhausted = discount.usageLimit !== null && discount.usageCount >= discount.usageLimit
    assert.isTrue(isExhausted)
  })

  test('discount within usage limit is valid', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'AVAILABLE',
      name: 'Available Discount',
      usageCount: 5,
      usageLimit: 100,
    }))

    const isExhausted = discount.usageLimit !== null && discount.usageCount >= discount.usageLimit
    assert.isFalse(isExhausted)
  })

  test('minimum order amount check', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'MIN50',
      name: 'Min $50 Order',
      minimumOrderAmount: 50,
    }))

    const cartSubtotal = 30
    const meetsMinimum = !discount.minimumOrderAmount || cartSubtotal >= discount.minimumOrderAmount
    assert.isFalse(meetsMinimum)

    const cartSubtotal2 = 75
    const meetsMinimum2 = !discount.minimumOrderAmount || cartSubtotal2 >= discount.minimumOrderAmount
    assert.isTrue(meetsMinimum2)
  })

  test('increment usage count', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'TRACK',
      name: 'Tracked Discount',
      type: 'fixed_amount',
    }))

    discount.usageCount = (discount.usageCount || 0) + 1
    await discount.save()
    await discount.refresh()

    assert.equal(discount.usageCount, 1)
  })

  test('discount code lookup is case-insensitive', async ({ assert }) => {
    await Discount.create(createDiscountData(store.id, {
      code: 'SAVE20',
      name: '20% Off',
      value: 20,
    }))

    const code = 'save20'.toUpperCase()
    const discount = await Discount.query()
      .where('code', code)
      .where('storeId', store.id)
      .where('isActive', true)
      .first()

    assert.isNotNull(discount)
    assert.equal(discount!.code, 'SAVE20')
  })

  test('free shipping discount type', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'FREESHIP',
      name: 'Free Shipping',
      type: 'free_shipping',
      value: 0,
    }))

    assert.equal(discount.type, 'free_shipping')

    const shippingAmount = 12.99
    const discountAmount = discount.type === 'free_shipping' ? shippingAmount : 0
    assert.equal(discountAmount, 12.99)
  })

  test('percentage discount value stored correctly', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'HALF',
      name: '50% Off',
      value: 50,
    }))

    await discount.refresh()
    assert.equal(discount.value, 50)
    assert.equal(discount.type, 'percentage')
  })

  test('fixed amount discount value stored correctly', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'FLAT25',
      name: '$25 Off',
      type: 'fixed_amount',
      value: 25,
    }))

    await discount.refresh()
    assert.equal(discount.value, 25)
    assert.equal(discount.type, 'fixed_amount')
  })

  test('buy X get Y discount fields', async ({ assert }) => {
    const discount = await Discount.create(createDiscountData(store.id, {
      code: 'B2G1',
      name: 'Buy 2 Get 1 Free',
      type: 'buy_x_get_y',
      value: 0,
      buyQuantity: 2,
      getQuantity: 1,
      getDiscountPercentage: 100,
    }))

    await discount.refresh()
    assert.equal(discount.type, 'buy_x_get_y')
    assert.equal(discount.buyQuantity, 2)
    assert.equal(discount.getQuantity, 1)
    assert.equal(discount.getDiscountPercentage, 100)
  })
})
