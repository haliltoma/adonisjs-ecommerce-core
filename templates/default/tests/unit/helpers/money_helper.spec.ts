import { test } from '@japa/runner'
import { money } from '#helpers/money_helper'

test.group('Money Helper', () => {
  test('add two amounts', ({ assert }) => {
    const result = money.add(100, 50)
    assert.equal(result, 150)
  })

  test('subtract two amounts', ({ assert }) => {
    const result = money.subtract(100, 30)
    assert.equal(result, 70)
  })

  test('multiply amount by quantity', ({ assert }) => {
    const result = money.multiply(25.99, 3)
    assert.equal(result, 77.97)
  })

  test('calculate percentage', ({ assert }) => {
    const result = money.percentage(100, 20)
    assert.equal(result, 20)
  })

  test('calculate percentage of non-round amount', ({ assert }) => {
    const result = money.percentage(99.99, 15)
    assert.equal(result, 14.9985)
  })

  test('format currency with 2 decimals', ({ assert }) => {
    const result = money.format(1234.5)
    assert.equal(result, '1,234.50')
  })

  test('format zero amount', ({ assert }) => {
    const result = money.format(0)
    assert.equal(result, '0.00')
  })

  test('round to 2 decimals', ({ assert }) => {
    const result = money.round(123.456)
    assert.equal(result, 123.46)
  })

  test('handle negative multiplication', ({ assert }) => {
    const result = money.multiply(-10, 5)
    assert.equal(result, -50)
  })

  test('subtract results in zero', ({ assert }) => {
    const result = money.subtract(100, 100)
    assert.equal(result, 0)
  })

  test('percentage of zero', ({ assert }) => {
    const result = money.percentage(0, 10)
    assert.equal(result, 0)
  })

  test('divide amounts', ({ assert }) => {
    const result = money.divide(100, 4)
    assert.equal(result, 25)
  })

  test('divide with decimals', ({ assert }) => {
    const result = money.divide(100, 3)
    assert.approximately(result, 33.33, 0.01)
  })
})
