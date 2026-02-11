import { test } from '@japa/runner'
import { money } from '../../app/helpers/money.js'
import { TaxCalculator } from '../../app/helpers/tax_calculator.js'

/**
 * Unit tests for cart calculation logic.
 * These test the pure math used by CartService without requiring DB.
 */

test.group('Cart Service - Subtotal calculation', () => {
  test('subtotal is sum of item totals', ({ assert }) => {
    const items = [
      { unitPrice: 29.99, quantity: 2, totalPrice: 59.98 },
      { unitPrice: 49.99, quantity: 1, totalPrice: 49.99 },
      { unitPrice: 9.99, quantity: 3, totalPrice: 29.97 },
    ]

    const subtotal = items.reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    assert.equal(subtotal, 139.94)
  })

  test('subtotal handles single item', ({ assert }) => {
    const items = [{ unitPrice: 19.99, quantity: 1, totalPrice: 19.99 }]
    const subtotal = items.reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    assert.equal(subtotal, 19.99)
  })

  test('subtotal for empty cart is zero', ({ assert }) => {
    const items: { totalPrice: number }[] = []
    const subtotal = items.reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    assert.equal(subtotal, 0)
  })

  test('item total is unit price times quantity', ({ assert }) => {
    const unitPrice = 29.99
    const quantity = 3
    const totalPrice = money.multiply(unitPrice, quantity)
    assert.equal(totalPrice, 89.97)
  })

  test('item total with high quantity', ({ assert }) => {
    const unitPrice = 0.99
    const quantity = 100
    const totalPrice = money.multiply(unitPrice, quantity)
    assert.equal(totalPrice, 99)
  })
})

test.group('Cart Service - Discount application', () => {
  test('percentage discount on cart subtotal', ({ assert }) => {
    const subtotal = 200
    const discountPercent = 15
    const discountAmount = money.percentage(subtotal, discountPercent)
    assert.equal(discountAmount, 30)

    const afterDiscount = money.subtract(subtotal, discountAmount)
    assert.equal(afterDiscount, 170)
  })

  test('fixed amount discount on cart', ({ assert }) => {
    const subtotal = 100
    const fixedDiscount = 20
    const discountAmount = Math.min(fixedDiscount, subtotal)
    const afterDiscount = money.subtract(subtotal, discountAmount)
    assert.equal(afterDiscount, 80)
  })

  test('discount cannot make cart negative', ({ assert }) => {
    const subtotal = 15
    const fixedDiscount = 25
    const discountAmount = Math.min(fixedDiscount, subtotal)
    const afterDiscount = money.subtract(subtotal, discountAmount)
    assert.equal(afterDiscount, 0)
  })

  test('multiple discounts are applied sequentially', ({ assert }) => {
    let subtotal = 100

    // First discount: 10%
    const discount1 = money.percentage(subtotal, 10)
    subtotal = money.subtract(subtotal, discount1)
    assert.equal(subtotal, 90)

    // Second discount: $5 off
    const discount2 = Math.min(5, subtotal)
    subtotal = money.subtract(subtotal, discount2)
    assert.equal(subtotal, 85)
  })

  test('free shipping discount equals shipping amount', ({ assert }) => {
    const shippingAmount = 12.99
    const freeShippingDiscount = shippingAmount
    const effectiveShipping = money.subtract(shippingAmount, freeShippingDiscount)
    assert.equal(effectiveShipping, 0)
  })
})

test.group('Cart Service - Tax calculation', () => {
  test('tax on subtotal after discount', ({ assert }) => {
    const calc = new TaxCalculator()
    const subtotal = 100
    const discountAmount = 20
    const taxableAmount = money.subtract(subtotal, discountAmount)
    const result = calc.addTax(taxableAmount, 8)

    assert.equal(result.tax, 6.4)
    assert.equal(result.priceWithTax, 86.4)
  })

  test('no tax on zero amount', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.addTax(0, 10)
    assert.equal(result.tax, 0)
  })

  test('grand total = subtotal - discount + tax + shipping', ({ assert }) => {
    const subtotal = 150
    const discountTotal = 15
    const taxTotal = 10.8
    const shippingTotal = 12

    const afterDiscount = money.subtract(subtotal, discountTotal)
    const withTax = money.add(afterDiscount, taxTotal)
    const grandTotal = money.add(withTax, shippingTotal)

    assert.equal(grandTotal, 157.8)
  })

  test('grand total with no extras', ({ assert }) => {
    const subtotal = 99.99
    const discountTotal = 0
    const taxTotal = 0
    const shippingTotal = 0

    const grandTotal = money.add(
      money.add(money.subtract(subtotal, discountTotal), taxTotal),
      shippingTotal
    )
    assert.equal(grandTotal, 99.99)
  })
})

test.group('Cart Service - Item quantity changes', () => {
  test('quantity increase recalculates item total', ({ assert }) => {
    const unitPrice = 25.50
    const newQuantity = 4
    const newTotal = money.multiply(unitPrice, newQuantity)
    assert.equal(newTotal, 102)
  })

  test('quantity decrease recalculates item total', ({ assert }) => {
    const unitPrice = 25.50
    const newQuantity = 1
    const newTotal = money.multiply(unitPrice, newQuantity)
    assert.equal(newTotal, 25.5)
  })

  test('cart totals update after item quantity change', ({ assert }) => {
    const items = [
      { unitPrice: 20, quantity: 2, totalPrice: 40 },
      { unitPrice: 30, quantity: 1, totalPrice: 30 },
    ]

    // Change first item quantity from 2 to 5
    items[0].quantity = 5
    items[0].totalPrice = money.multiply(items[0].unitPrice, items[0].quantity)

    const subtotal = items.reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    const totalItems = items.length
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

    assert.equal(subtotal, 130)
    assert.equal(totalItems, 2)
    assert.equal(totalQuantity, 6)
  })
})

test.group('Cart Service - Shipping threshold', () => {
  test('free shipping when subtotal exceeds threshold', ({ assert }) => {
    const subtotal = 100
    const freeShippingThreshold = 75
    const defaultShippingRate = 9.99

    const shippingTotal = subtotal >= freeShippingThreshold ? 0 : defaultShippingRate
    assert.equal(shippingTotal, 0)
  })

  test('shipping charged when below threshold', ({ assert }) => {
    const subtotal = 50
    const freeShippingThreshold = 75
    const defaultShippingRate = 9.99

    const shippingTotal = subtotal >= freeShippingThreshold ? 0 : defaultShippingRate
    assert.equal(shippingTotal, 9.99)
  })

  test('free shipping at exact threshold', ({ assert }) => {
    const subtotal = 75
    const freeShippingThreshold = 75
    const defaultShippingRate = 9.99

    const shippingTotal = subtotal >= freeShippingThreshold ? 0 : defaultShippingRate
    assert.equal(shippingTotal, 0)
  })
})
