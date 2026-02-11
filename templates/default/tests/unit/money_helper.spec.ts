import { test } from '@japa/runner'
import { MoneyHelper, money, formatMoney, toCents, fromCents } from '../../app/helpers/money.js'

test.group('MoneyHelper', () => {
  test('toCents converts decimal to integer cents', ({ assert }) => {
    assert.equal(money.toCents(10.99), 1099)
    assert.equal(money.toCents(0), 0)
    assert.equal(money.toCents(1.5), 150)
    assert.equal(money.toCents(100), 10000)
    // Floating point edge case
    assert.equal(money.toCents(0.1 + 0.2), 30)
  })

  test('fromCents converts integer cents to decimal', ({ assert }) => {
    assert.equal(money.fromCents(1099), 10.99)
    assert.equal(money.fromCents(0), 0)
    assert.equal(money.fromCents(150), 1.5)
    assert.equal(money.fromCents(10000), 100)
  })

  test('add sums two monetary values without floating point errors', ({ assert }) => {
    assert.equal(money.add(0.1, 0.2), 0.3)
    assert.equal(money.add(10.99, 5.01), 16)
    assert.equal(money.add(0, 100), 100)
    assert.equal(money.add(99.99, 0.01), 100)
  })

  test('subtract subtracts two monetary values without floating point errors', ({ assert }) => {
    assert.equal(money.subtract(100, 0.01), 99.99)
    assert.equal(money.subtract(10, 3.33), 6.67)
    assert.equal(money.subtract(50, 50), 0)
    assert.equal(money.subtract(0.3, 0.1), 0.2)
  })

  test('multiply multiplies amount by quantity', ({ assert }) => {
    assert.equal(money.multiply(9.99, 3), 29.97)
    assert.equal(money.multiply(0, 100), 0)
    assert.equal(money.multiply(10.50, 2), 21)
    assert.equal(money.multiply(1.99, 10), 19.9)
  })

  test('divide divides amount correctly', ({ assert }) => {
    assert.equal(money.divide(100, 3), 33.33)
    assert.equal(money.divide(10, 2), 5)
    assert.equal(money.divide(99.99, 1), 99.99)
  })

  test('divide throws error on division by zero', ({ assert }) => {
    assert.throws(() => money.divide(100, 0), 'Cannot divide by zero')
  })

  test('percentage calculates percent of amount', ({ assert }) => {
    assert.equal(money.percentage(100, 10), 10)
    assert.equal(money.percentage(200, 15), 30)
    assert.equal(money.percentage(50, 50), 25)
    assert.equal(money.percentage(99.99, 20), 20)
  })

  test('applyDiscount applies percentage discount', ({ assert }) => {
    const result = money.applyDiscount(100, { type: 'percentage', value: 10 })
    assert.equal(result, 90)
  })

  test('applyDiscount applies fixed amount discount', ({ assert }) => {
    const result = money.applyDiscount(100, { type: 'fixed_amount', value: 15 })
    assert.equal(result, 85)
  })

  test('calculateDiscount returns discount amount for percentage', ({ assert }) => {
    assert.equal(money.calculateDiscount(100, { type: 'percentage', value: 25 }), 25)
    assert.equal(money.calculateDiscount(200, { type: 'percentage', value: 10 }), 20)
  })

  test('calculateDiscount returns discount amount for fixed, capped at total', ({ assert }) => {
    assert.equal(money.calculateDiscount(100, { type: 'fixed_amount', value: 15 }), 15)
    // Fixed discount cannot exceed the total amount
    assert.equal(money.calculateDiscount(10, { type: 'fixed_amount', value: 15 }), 10)
  })

  test('round rounds to specified precision', ({ assert }) => {
    assert.equal(money.round(10.456, 2), 10.46)
    assert.equal(money.round(10.454, 2), 10.45)
    assert.equal(money.round(10.5, 0), 11)
    assert.equal(money.round(10.123), 10.12)
  })

  test('equals compares monetary values', ({ assert }) => {
    assert.isTrue(money.equals(10.00, 10))
    assert.isTrue(money.equals(0.1 + 0.2, 0.3))
    assert.isFalse(money.equals(10.01, 10.02))
  })

  test('min returns minimum amount', ({ assert }) => {
    assert.equal(money.min(10, 5, 20), 5)
    assert.equal(money.min(100), 100)
    assert.equal(money.min(-5, 0, 5), -5)
  })

  test('max returns maximum amount', ({ assert }) => {
    assert.equal(money.max(10, 5, 20), 20)
    assert.equal(money.max(100), 100)
    assert.equal(money.max(-5, 0, 5), 5)
  })

  test('sum calculates total of amounts array', ({ assert }) => {
    assert.equal(money.sum([10, 20, 30]), 60)
    assert.equal(money.sum([0.1, 0.2, 0.3]), 0.6)
    assert.equal(money.sum([]), 0)
    assert.equal(money.sum([99.99]), 99.99)
  })

  test('average calculates average of amounts', ({ assert }) => {
    assert.equal(money.average([10, 20, 30]), 20)
    assert.equal(money.average([100, 200]), 150)
    assert.equal(money.average([]), 0)
  })

  test('convert converts between currency rates', ({ assert }) => {
    // USD (rate 1) to EUR (rate 0.85)
    const result = money.convert(100, 1, 0.85)
    assert.equal(result, 85)
  })

  test('parse extracts number from currency string', ({ assert }) => {
    assert.equal(money.parse('$10.99'), 10.99)
    assert.equal(money.parse('€1,234.56'), 1234.56)
    assert.equal(money.parse('abc'), 0)
    assert.equal(money.parse('100'), 100)
  })

  test('isPositive checks for positive amounts', ({ assert }) => {
    assert.isTrue(money.isPositive(1))
    assert.isTrue(money.isPositive(0.01))
    assert.isFalse(money.isPositive(0))
    assert.isFalse(money.isPositive(-1))
  })

  test('isNegative checks for negative amounts', ({ assert }) => {
    assert.isTrue(money.isNegative(-1))
    assert.isTrue(money.isNegative(-0.01))
    assert.isFalse(money.isNegative(0))
    assert.isFalse(money.isNegative(1))
  })

  test('isZero checks for zero amounts', ({ assert }) => {
    assert.isTrue(money.isZero(0))
    assert.isTrue(money.isZero(0.00))
    assert.isFalse(money.isZero(0.01))
    assert.isFalse(money.isZero(-0.01))
  })

  test('abs returns absolute value', ({ assert }) => {
    assert.equal(money.abs(-10), 10)
    assert.equal(money.abs(10), 10)
    assert.equal(money.abs(0), 0)
  })

  test('format returns currency-formatted string', ({ assert }) => {
    const formatted = money.format(10.99)
    assert.isTrue(formatted.includes('10.99'))
  })

  test('format with currency code appends code', ({ assert }) => {
    const formatted = money.format(10.99, { showCode: true, currency: 'EUR' })
    assert.isTrue(formatted.includes('EUR'))
  })
})

test.group('MoneyHelper - Standalone functions', () => {
  test('formatMoney works as standalone function', ({ assert }) => {
    const result = formatMoney(10.99)
    assert.isTrue(result.includes('10.99'))
  })

  test('toCents works as standalone function', ({ assert }) => {
    assert.equal(toCents(10.99), 1099)
  })

  test('fromCents works as standalone function', ({ assert }) => {
    assert.equal(fromCents(1099), 10.99)
  })

  test('MoneyHelper can be instantiated', ({ assert }) => {
    const helper = new MoneyHelper()
    assert.equal(helper.toCents(5.50), 550)
  })
})
