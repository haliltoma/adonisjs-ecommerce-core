import { test } from '@japa/runner'
import { OrderFactory, OrderItemFactory, ProductFactory } from '#database/factories/main'
import Order from '#models/order'
import { Database } from '@adonisjs/lucid/services/db'

test.group('Order Model', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('create order with required fields', async ({ assert }) => {
    const order = await OrderFactory.create()
    assert.isDefined(order.id)
    assert.isNotEmpty(order.orderNumber)
    assert.isNotEmpty(order.email)
  })

  test('order number is unique', async ({ assert }) => {
    const order1 = await OrderFactory.create()
    const order2 = await OrderFactory.create()

    assert.notEqual(order1.orderNumber, order2.orderNumber)
  })

  test('order status defaults to pending', async ({ assert }) => {
    const order = await OrderFactory.create()
    assert.equal(order.status, 'pending')
  })

  test('order payment status defaults to pending', async ({ assert }) => {
    const order = await OrderFactory.create()
    assert.equal(order.paymentStatus, 'pending')
  })

  test('order fulfillment status defaults to unfulfilled', async ({ assert }) => {
    const order = await OrderFactory.create()
    assert.equal(order.fulfillmentStatus, 'unfulfilled')
  })

  test('order calculates grand total', async ({ assert }) => {
    const order = await OrderFactory.merge({
      subtotal: 100,
      discountTotal: 10,
      taxTotal: 9,
      shippingTotal: 15,
      grandTotal: 114,
    }).create()

    const expectedTotal = 100 - 10 + 9 + 15
    assert.equal(order.grandTotal, expectedTotal)
  })

  test('order with items relationship', async ({ assert }) => {
    const order = await OrderFactory.create()
    await OrderItemFactory.merge({ orderId: order.id }).create()

    const items = await order.related('items').query()
    assert.lengthOf(items, 1)
  })

  test('order total paid updates correctly', async ({ assert }) => {
    const order = await OrderFactory.merge({
      grandTotal: 100,
      totalPaid: 50,
    }).create()

    const remainingAmount = order.grandTotal - order.totalPaid
    assert.equal(remainingAmount, 50)
  })

  test('order is fully paid', async ({ assert }) => {
    const order = await OrderFactory.merge({
      grandTotal: 100,
      totalPaid: 100,
      paymentStatus: 'paid',
    }).create()

    assert.equal(order.paymentStatus, 'paid')
    assert.isTrue(order.totalPaid >= order.grandTotal)
  })

  test('order refund amount', async ({ assert }) => {
    const order = await OrderFactory.merge({
      totalPaid: 100,
      totalRefunded: 25,
    }).create()

    assert.equal(order.totalRefunded, 25)
    assert.isTrue(order.totalRefunded <= order.totalPaid)
  })

  test('order placed at timestamp', async ({ assert }) => {
    const order = await OrderFactory.create()
    assert.isDefined(order.placedAt)
  })

  test('order has billing address', async ({ assert }) => {
    const billingAddress = {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      country: 'US',
      zip: '10001',
    }

    const order = await OrderFactory.merge({
      billingAddress,
    }).create()

    assert.equal(order.billingAddress.firstName, 'John')
    assert.equal(order.billingAddress.city, 'New York')
  })

  test('order has shipping address', async ({ assert }) => {
    const shippingAddress = {
      firstName: 'Jane',
      lastName: 'Smith',
      address1: '456 Oak Ave',
      city: 'Los Angeles',
      country: 'US',
      zip: '90001',
    }

    const order = await OrderFactory.merge({
      shippingAddress,
    }).create()

    assert.equal(order.shippingAddress.firstName, 'Jane')
    assert.equal(order.shippingAddress.city, 'Los Angeles')
  })
})
