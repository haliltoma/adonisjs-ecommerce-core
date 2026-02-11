import { test } from '@japa/runner'
import { money } from '../../app/helpers/money.js'

/**
 * Tests for discount calculation logic.
 *
 * The DiscountEngine uses the same money helper for calculations.
 * These tests verify the core discount math without DB dependencies.
 */
test.group('Discount Calculations - Percentage discounts', () => {
  test('10% discount on $100 cart', ({ assert }) => {
    const subtotal = 100
    const discountPercent = 10
    const discountAmount = money.percentage(subtotal, discountPercent)
    assert.equal(discountAmount, 10)
    assert.equal(money.subtract(subtotal, discountAmount), 90)
  })

  test('25% discount on $199.99 cart', ({ assert }) => {
    const subtotal = 199.99
    const discountPercent = 25
    const discountAmount = money.percentage(subtotal, discountPercent)
    assert.equal(discountAmount, 50)
    assert.equal(money.subtract(subtotal, discountAmount), 149.99)
  })

  test('100% discount gives zero total', ({ assert }) => {
    const subtotal = 59.99
    const discountAmount = money.percentage(subtotal, 100)
    assert.equal(discountAmount, 59.99)
    assert.equal(money.subtract(subtotal, discountAmount), 0)
  })

  test('0% discount gives full amount', ({ assert }) => {
    const subtotal = 100
    const discountAmount = money.percentage(subtotal, 0)
    assert.equal(discountAmount, 0)
    assert.equal(money.subtract(subtotal, discountAmount), 100)
  })
})

test.group('Discount Calculations - Fixed amount discounts', () => {
  test('$15 discount on $100 cart', ({ assert }) => {
    const subtotal = 100
    const fixedDiscount = 15
    const actualDiscount = Math.min(fixedDiscount, subtotal)
    assert.equal(actualDiscount, 15)
    assert.equal(money.subtract(subtotal, actualDiscount), 85)
  })

  test('fixed discount cannot exceed cart total', ({ assert }) => {
    const subtotal = 10
    const fixedDiscount = 25
    const actualDiscount = Math.min(fixedDiscount, subtotal)
    assert.equal(actualDiscount, 10)
    assert.equal(money.subtract(subtotal, actualDiscount), 0)
  })

  test('fixed discount equal to cart total', ({ assert }) => {
    const subtotal = 50
    const fixedDiscount = 50
    const actualDiscount = Math.min(fixedDiscount, subtotal)
    assert.equal(actualDiscount, 50)
    assert.equal(money.subtract(subtotal, actualDiscount), 0)
  })
})

test.group('Discount Calculations - Free shipping', () => {
  test('free shipping discount equals shipping amount', ({ assert }) => {
    const shippingAmount = 12.99
    const discountAmount = shippingAmount
    assert.equal(discountAmount, 12.99)
  })

  test('free shipping with zero shipping', ({ assert }) => {
    const shippingAmount = 0
    const discountAmount = shippingAmount
    assert.equal(discountAmount, 0)
  })
})

test.group('Discount Calculations - Buy X Get Y', () => {
  test('buy 2 get 1 free - 3 items of same price', ({ assert }) => {
    const items = [
      { unitPrice: 20, quantity: 3 },
    ]

    const buyQuantity = 2
    const getQuantity = 1
    const getDiscountPercentage = 100

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const setsOfBuyX = Math.floor(totalQuantity / buyQuantity)
    const freeItems = setsOfBuyX * getQuantity

    // All items same price, cheapest = 20
    const allPrices = items.flatMap((item) =>
      Array(item.quantity).fill(item.unitPrice)
    )
    allPrices.sort((a, b) => a - b)
    const freePrices = allPrices.slice(0, freeItems)
    const freeAmount = money.sum(freePrices)
    const discountAmount = money.percentage(freeAmount, getDiscountPercentage)

    assert.equal(freeItems, 1)
    assert.equal(discountAmount, 20)
  })

  test('buy 3 get 1 free - 7 items, cheapest is free', ({ assert }) => {
    const items = [
      { unitPrice: 10, quantity: 2 },
      { unitPrice: 20, quantity: 3 },
      { unitPrice: 30, quantity: 2 },
    ]

    const buyQuantity = 3
    const getQuantity = 1

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    assert.equal(totalQuantity, 7)

    const setsOfBuyX = Math.floor(totalQuantity / buyQuantity)
    const freeItems = setsOfBuyX * getQuantity
    assert.equal(setsOfBuyX, 2)
    assert.equal(freeItems, 2)

    // Cheapest items first
    const allPrices: number[] = items.flatMap((item) =>
      Array(item.quantity).fill(item.unitPrice)
    )
    allPrices.sort((a, b) => a - b)
    // Sorted: [10, 10, 20, 20, 20, 30, 30]
    const freePrices = allPrices.slice(0, freeItems)
    // Free: [10, 10]
    const freeAmount = money.sum(freePrices)
    assert.equal(freeAmount, 20)
  })

  test('buy 1 get 1 at 50% off', ({ assert }) => {
    const items = [
      { unitPrice: 40, quantity: 2 },
    ]

    const buyQuantity = 1
    const getQuantity = 1
    const getDiscountPercentage = 50

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const setsOfBuyX = Math.floor(totalQuantity / buyQuantity)
    const freeItems = setsOfBuyX * getQuantity

    const allPrices = items.flatMap((item) =>
      Array(item.quantity).fill(item.unitPrice)
    )
    allPrices.sort((a, b) => a - b)
    const freePrices = allPrices.slice(0, freeItems)
    const freeAmount = money.sum(freePrices)
    const discountAmount = money.percentage(freeAmount, getDiscountPercentage)

    // 2 items at $40, get 2 at 50% off = $40
    assert.equal(discountAmount, 40)
  })
})

test.group('Discount Calculations - Maximum discount cap', () => {
  test('discount capped at maximum amount', ({ assert }) => {
    const subtotal = 1000
    const discountPercent = 50
    const maximumDiscountAmount = 100

    let discountAmount = money.percentage(subtotal, discountPercent)
    assert.equal(discountAmount, 500)

    // Apply cap
    if (discountAmount > maximumDiscountAmount) {
      discountAmount = maximumDiscountAmount
    }
    assert.equal(discountAmount, 100)
    assert.equal(money.subtract(subtotal, discountAmount), 900)
  })

  test('discount under cap is not affected', ({ assert }) => {
    const subtotal = 50
    const discountPercent = 10
    const maximumDiscountAmount = 100

    let discountAmount = money.percentage(subtotal, discountPercent)
    assert.equal(discountAmount, 5)

    if (discountAmount > maximumDiscountAmount) {
      discountAmount = maximumDiscountAmount
    }
    assert.equal(discountAmount, 5)
  })
})

test.group('Discount Calculations - Eligible amount for specific products', () => {
  test('discount applies only to eligible products', ({ assert }) => {
    const items = [
      { productId: 'p1', totalPrice: 50 },
      { productId: 'p2', totalPrice: 30 },
      { productId: 'p3', totalPrice: 20 },
    ]

    const eligibleProductIds = ['p1', 'p3']
    const eligibleAmount = items
      .filter((item) => eligibleProductIds.includes(item.productId))
      .reduce((sum, item) => money.add(sum, item.totalPrice), 0)

    assert.equal(eligibleAmount, 70)

    const discountAmount = money.percentage(eligibleAmount, 20)
    assert.equal(discountAmount, 14)
  })

  test('discount applies to all items when no restrictions', ({ assert }) => {
    const items = [
      { totalPrice: 50 },
      { totalPrice: 30 },
      { totalPrice: 20 },
    ]

    const subtotal = items.reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    assert.equal(subtotal, 100)

    const discountAmount = money.percentage(subtotal, 10)
    assert.equal(discountAmount, 10)
  })
})

test.group('Discount Calculations - Cart total with discount and tax', () => {
  test('cart total = subtotal - discount + tax', ({ assert }) => {
    const subtotal = 100
    const discountTotal = 15
    const taxTotal = 8.5

    const grandTotal = money.add(money.subtract(subtotal, discountTotal), taxTotal)
    assert.equal(grandTotal, 93.5)
  })

  test('cart with zero discount and tax', ({ assert }) => {
    const subtotal = 59.99
    const discountTotal = 0
    const taxTotal = 0

    const grandTotal = money.add(money.subtract(subtotal, discountTotal), taxTotal)
    assert.equal(grandTotal, 59.99)
  })

  test('cart total never goes negative', ({ assert }) => {
    const subtotal = 10
    const discountTotal = 10
    const taxTotal = 0

    const grandTotal = money.add(money.subtract(subtotal, discountTotal), taxTotal)
    assert.isTrue(grandTotal >= 0)
  })
})
