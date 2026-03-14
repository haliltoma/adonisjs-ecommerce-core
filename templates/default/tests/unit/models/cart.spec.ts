import { test } from '@japa/runner'
import { CartFactory, CartItemFactory, ProductFactory } from '#database/factories/main'
import Cart from '#models/cart'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Cart Model', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('create cart with default values', async ({ assert }) => {
    const cart = await CartFactory.create()
    assert.isDefined(cart.id)
    assert.equal(cart.currencyCode, 'USD')
    assert.equal(cart.grandTotal, 0)
  })

  test('cart items relationship', async ({ assert }) => {
    const cart = await CartFactory.create()
    await CartItemFactory.merge({ cartId: cart.id }).create()

    const items = await cart.related('items').query()
    assert.lengthOf(items, 1)
  })

  test('calculate total items count', async ({ assert }) => {
    const cart = await CartFactory.create()
    await CartItemFactory.merge({ cartId: cart.id, quantity: 3 }).create()
    await CartItemFactory.merge({ cartId: cart.id, quantity: 2 }).create()

    await cart.load('items')
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    assert.equal(totalItems, 5)
  })

  test('calculate grand total', async ({ assert }) => {
    const cart = await CartFactory.merge({
      subtotal: 100,
      discountTotal: 10,
      taxTotal: 9,
      shippingTotal: 15,
      grandTotal: 114,
    }).create()

    const expected = cart.subtotal - cart.discountTotal + cart.taxTotal + cart.shippingTotal
    assert.equal(cart.grandTotal, expected)
  })

  test('empty cart has zero totals', async ({ assert }) => {
    const cart = await CartFactory.create()

    assert.equal(cart.subtotal, 0)
    assert.equal(cart.discountTotal, 0)
    assert.equal(cart.taxTotal, 0)
    assert.equal(cart.shippingTotal, 0)
    assert.equal(cart.grandTotal, 0)
  })

  test('cart with multiple items', async ({ assert }) => {
    const cart = await CartFactory.create()
    await CartItemFactory.createMany(5, { cartId: cart.id })

    await cart.load('items')
    assert.lengthOf(cart.items, 5)
  })

  test('cart metadata storage', async ({ assert }) => {
    const cart = await CartFactory.merge({
      metadata: {
        source: 'web',
        campaign: 'summer-sale',
      },
    }).create()

    assert.equal(cart.metadata.source, 'web')
    assert.equal(cart.metadata.campaign, 'summer-sale')
  })
})
