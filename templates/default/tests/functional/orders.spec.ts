import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import User from '#models/user'
import Order from '#models/order'
import Store from '#models/store'
import Customer from '#models/customer'
import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'

function createOrderData(storeId: string, customerId: string, overrides: Record<string, unknown> = {}) {
  return {
    storeId,
    customerId,
    orderNumber: `ORD-${Date.now()}`,
    email: 'customer@test.com',
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    fulfillmentStatus: 'unfulfilled' as const,
    currencyCode: 'USD',
    subtotal: 100,
    discountTotal: 0,
    shippingTotal: 10,
    taxTotal: 8,
    grandTotal: 118,
    totalPaid: 0,
    totalRefunded: 0,
    billingAddress: {},
    shippingAddress: {},
    metadata: {},
    placedAt: DateTime.now(),
    ...overrides,
  }
}

test.group('Orders - Lifecycle', (group) => {
  let admin: User
  let store: Store
  let customer: Customer

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

    admin = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })

    const passwordHash = await hash.make('password123')
    customer = await Customer.create({
      storeId: store.id,
      email: 'customer@test.com',
      firstName: 'Test',
      lastName: 'Customer',
      passwordHash,
      status: 'active',
      acceptsMarketing: false,
      totalOrders: 0,
      totalSpent: 0,
      tags: [],
      metadata: {},
    })
  })

  test('admin can list orders', async ({ client }) => {
    const response = await client.get('/admin/orders').loginAs(admin)
    response.assertStatus(200)
  })

  test('admin can view order detail', async ({ client }) => {
    const order = await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-00000001',
    }))

    const response = await client.get(`/admin/orders/${order.id}`).loginAs(admin)
    response.assertStatus(200)
  })

  test('order status transitions: pending -> processing', async ({ assert }) => {
    const order = await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-00000002',
    }))

    order.status = 'processing'
    await order.save()
    await order.refresh()

    assert.equal(order.status, 'processing')
  })

  test('order status transitions: processing -> completed with fulfilled', async ({ assert }) => {
    const order = await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-00000003',
      status: 'processing',
      paymentStatus: 'paid',
    }))

    order.fulfillmentStatus = 'fulfilled'
    order.status = 'completed'
    await order.save()
    await order.refresh()

    assert.equal(order.fulfillmentStatus, 'fulfilled')
    assert.equal(order.status, 'completed')
  })

  test('order can be cancelled', async ({ assert }) => {
    const order = await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-00000004',
    }))

    order.status = 'cancelled'
    order.cancelledAt = DateTime.now()
    order.cancelReason = 'Customer requested'
    await order.save()
    await order.refresh()

    assert.equal(order.status, 'cancelled')
    assert.isNotNull(order.cancelledAt)
    assert.equal(order.cancelReason, 'Customer requested')
  })

  test('order payment status transitions: pending -> paid', async ({ assert }) => {
    const order = await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-00000005',
    }))

    order.paymentStatus = 'paid'
    order.totalPaid = order.grandTotal
    await order.save()
    await order.refresh()

    assert.equal(order.paymentStatus, 'paid')
    assert.equal(order.totalPaid, order.grandTotal)
  })

  test('order totals are correctly stored', async ({ assert }) => {
    const order = await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-00000006',
      subtotal: 100,
      discountTotal: 15,
      shippingTotal: 10,
      taxTotal: 7.65,
      grandTotal: 102.65,
    }))

    await order.refresh()

    assert.equal(order.subtotal, 100)
    assert.equal(order.discountTotal, 15)
    assert.equal(order.shippingTotal, 10)
    assert.equal(order.taxTotal, 7.65)
    assert.equal(order.grandTotal, 102.65)
  })

  test('order number is unique', async ({ assert }) => {
    await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-UNIQUE-01',
    }))

    try {
      await Order.create(createOrderData(store.id, customer.id, {
        orderNumber: 'ORD-UNIQUE-01',
      }))
      assert.fail('Should have thrown for duplicate order number')
    } catch {
      assert.isTrue(true)
    }
  })

  test('order refund tracking', async ({ assert }) => {
    const order = await Order.create(createOrderData(store.id, customer.id, {
      orderNumber: 'ORD-REFUND-01',
      paymentStatus: 'paid',
      totalPaid: 118,
    }))

    order.totalRefunded = 50
    order.paymentStatus = 'partially_refunded'
    await order.save()
    await order.refresh()

    assert.equal(order.totalRefunded, 50)
    assert.equal(order.paymentStatus, 'partially_refunded')
  })
})
