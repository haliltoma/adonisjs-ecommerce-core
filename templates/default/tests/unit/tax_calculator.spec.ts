import { test } from '@japa/runner'
import { TaxCalculator } from '../../app/helpers/tax_calculator.js'

test.group('TaxCalculator - Pure calculations', () => {
  test('extractTax extracts tax from inclusive price', ({ assert }) => {
    const calc = new TaxCalculator()

    // 10% tax on $110 inclusive
    const result = calc.extractTax(110, 10)
    assert.equal(result.price, 100)
    assert.equal(result.tax, 10)
  })

  test('extractTax handles 20% tax rate', ({ assert }) => {
    const calc = new TaxCalculator()

    // 20% tax on $120 inclusive => $100 base + $20 tax
    const result = calc.extractTax(120, 20)
    assert.equal(result.price, 100)
    assert.equal(result.tax, 20)
  })

  test('extractTax handles zero tax rate', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.extractTax(100, 0)
    assert.equal(result.price, 100)
    assert.equal(result.tax, 0)
  })

  test('extractTax handles small amounts', ({ assert }) => {
    const calc = new TaxCalculator()
    // 7.5% tax on $10.75 inclusive
    const result = calc.extractTax(10.75, 7.5)
    assert.equal(result.price, 10)
    assert.equal(result.tax, 0.75)
  })

  test('addTax adds tax to base price', ({ assert }) => {
    const calc = new TaxCalculator()

    // 10% tax on $100
    const result = calc.addTax(100, 10)
    assert.equal(result.priceWithTax, 110)
    assert.equal(result.tax, 10)
  })

  test('addTax handles 20% tax rate', ({ assert }) => {
    const calc = new TaxCalculator()

    const result = calc.addTax(100, 20)
    assert.equal(result.priceWithTax, 120)
    assert.equal(result.tax, 20)
  })

  test('addTax handles zero tax rate', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.addTax(100, 0)
    assert.equal(result.priceWithTax, 100)
    assert.equal(result.tax, 0)
  })

  test('addTax handles decimal amounts', ({ assert }) => {
    const calc = new TaxCalculator()
    // 8.25% tax on $49.99
    const result = calc.addTax(49.99, 8.25)
    assert.equal(result.tax, 4.12)
    assert.equal(result.priceWithTax, 54.11)
  })

  test('formatTaxRate formats rate with two decimals', ({ assert }) => {
    const calc = new TaxCalculator()
    assert.equal(calc.formatTaxRate(10), '10.00%')
    assert.equal(calc.formatTaxRate(7.5), '7.50%')
    assert.equal(calc.formatTaxRate(0), '0.00%')
    assert.equal(calc.formatTaxRate(21.35), '21.35%')
  })

  test('extractTax and addTax are inverse operations', ({ assert }) => {
    const calc = new TaxCalculator()
    const rate = 10

    // Start with base price, add tax, then extract
    const added = calc.addTax(100, rate)
    const extracted = calc.extractTax(added.priceWithTax, rate)
    assert.equal(extracted.price, 100)
    assert.equal(extracted.tax, added.tax)
  })

  test('extractTax and addTax inverse with 7.5% rate', ({ assert }) => {
    const calc = new TaxCalculator()
    const rate = 7.5

    const added = calc.addTax(250, rate)
    const extracted = calc.extractTax(added.priceWithTax, rate)
    assert.equal(extracted.price, 250)
  })

  test('setPricesIncludeTax returns instance for chaining', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.setPricesIncludeTax(true)
    assert.equal(result, calc)
  })

  test('setDefaultTaxRate returns instance for chaining', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.setDefaultTaxRate(10)
    assert.equal(result, calc)
  })
})

test.group('TaxCalculator - Tax calculation edge cases', () => {
  test('addTax on zero amount', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.addTax(0, 10)
    assert.equal(result.priceWithTax, 0)
    assert.equal(result.tax, 0)
  })

  test('extractTax on zero amount', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.extractTax(0, 10)
    assert.equal(result.price, 0)
    assert.equal(result.tax, 0)
  })

  test('addTax with 100% rate doubles the price', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.addTax(50, 100)
    assert.equal(result.priceWithTax, 100)
    assert.equal(result.tax, 50)
  })

  test('extractTax with 100% rate halves the price', ({ assert }) => {
    const calc = new TaxCalculator()
    const result = calc.extractTax(100, 100)
    assert.equal(result.price, 50)
    assert.equal(result.tax, 50)
  })
})
