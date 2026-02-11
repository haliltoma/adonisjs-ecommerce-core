import { test } from '@japa/runner'
import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import Store from '#models/store'
import Customer from '#models/customer'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Cart to Order - Pipeline', (group) => {
  let store: Store
  let customer: Customer
  let productA: Product
  let productB: Product

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

    const productDefaults = {
      storeId: store.id,
      status: 'active' as const,
      type: 'simple' as const,
      isTaxable: true,
      requiresShipping: true,
      trackInventory: false,
      stockQuantity: 100,
      hasVariants: false,
      isFeatured: false,
      sortOrder: 0,
      customFields: {},
      weightUnit: 'kg' as const,
    }

    productA = await Product.create({
      ...productDefaults,
      title: 'Product A',
      slug: 'product-a',
      price: 29.99,
      sku: 'PROD-A',
    })

    productB = await Product.create({
      ...productDefaults,
      title: 'Product B',
      slug: 'product-b',
      price: 49.99,
      sku: 'PROD-B',
    })
  })

  test('cart items correctly transfer to order items', async ({ assert }) => {
    // Step 1: Create cart with items
    const cart = await Cart.create({
      storeId: store.id,
      customerId: customer.id,
      currencyCode: 'USD',
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      shippingTotal: 0,
      grandTotal: 0,
      totalItems: 0,
      totalQuantity: 0,
      metadata: {},
    })

    await CartItem.create({
      cartId: cart.id,
      productId: productA.id,
      quantity: 2,
      unitPrice: 29.99,
      totalPrice: 59.98,
      discountAmount: 0,
      taxAmount: 0,
      sku: 'PROD-A',
      title: 'Product A',
      metadata: {},
    })

    await CartItem.create({
      cartId: cart.id,
      productId: productB.id,
      quantity: 1,
      unitPrice: 49.99,
      totalPrice: 49.99,
      discountAmount: 0,
      taxAmount: 0,
      sku: 'PROD-B',
      title: 'Product B',
      metadata: {},
    })

    // Step 2: Calculate cart totals
    const cartItems = await CartItem.query().where('cartId', cart.id)
    let subtotal = 0
    let totalQuantity = 0
    for (const item of cartItems) {
      subtotal += item.totalPrice
      totalQuantity += item.quantity
    }

    const shippingTotal = 10
    const taxRate = 0.08
    const taxTotal = Math.round(subtotal * taxRate * 100) / 100
    const grandTotal = Math.round((subtotal + shippingTotal + taxTotal) * 100) / 100

    // Step 3: Create order from cart data
    const order = await Order.create({
      storeId: store.id,
      customerId: customer.id,
      orderNumber: 'ORD-00000001',
      email: customer.email,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      currencyCode: 'USD',
      subtotal,
      discountTotal: 0,
      shippingTotal,
      taxTotal,
      grandTotal,
      totalPaid: 0,
      totalRefunded: 0,
      billingAddress: {},
      shippingAddress: {},
      metadata: {},
      placedAt: DateTime.now(),
    })

    // Step 4: Copy cart items to order items
    for (const cartItem of cartItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalPrice: cartItem.totalPrice,
        discountAmount: 0,
        taxAmount: 0,
        taxRate: 0,
        fulfilledQuantity: 0,
        returnedQuantity: 0,
        sku: cartItem.sku,
        title: cartItem.title,
        properties: {},
      })
    }

    // Step 5: Mark cart as completed
    cart.completedAt = DateTime.now()
    await cart.save()

    // Verify
    const orderItems = await OrderItem.query().where('orderId', order.id)
    assert.equal(orderItems.length, 2)
    assert.equal(order.subtotal, 109.97)
    assert.isNotNull(cart.completedAt)

    // Verify item details
    const itemA = orderItems.find((i) => i.sku === 'PROD-A')
    const itemB = orderItems.find((i) => i.sku === 'PROD-B')
    assert.isNotNull(itemA)
    assert.isNotNull(itemB)
    assert.equal(itemA!.quantity, 2)
    assert.equal(itemA!.unitPrice, 29.99)
    assert.equal(itemB!.quantity, 1)
    assert.equal(itemB!.unitPrice, 49.99)
  })

  test('cart is no longer active after conversion', async ({ assert }) => {
    const cart = await Cart.create({
      storeId: store.id,
      customerId: customer.id,
      currencyCode: 'USD',
      subtotal: 29.99,
      discountTotal: 0,
      taxTotal: 0,
      shippingTotal: 0,
      grandTotal: 29.99,
      totalItems: 1,
      totalQuantity: 1,
      metadata: {},
    })

    cart.completedAt = DateTime.now()
    await cart.save()

    const activeCart = await Cart.query()
      .where('storeId', store.id)
      .where('customerId', customer.id)
      .whereNull('completedAt')
      .first()

    assert.isNull(activeCart)
  })

  test('order totals correctly reflect discount', async ({ assert }) => {
    const subtotal = 100
    const discountTotal = 15
    const shippingTotal = 10
    const taxTotal = Math.round((subtotal - discountTotal) * 0.08 * 100) / 100
    const grandTotal = Math.round((subtotal - discountTotal + shippingTotal + taxTotal) * 100) / 100

    const order = await Order.create({
      storeId: store.id,
      customerId: customer.id,
      orderNumber: 'ORD-DISCOUNT-01',
      email: customer.email,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      currencyCode: 'USD',
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
      totalPaid: 0,
      totalRefunded: 0,
      billingAddress: {},
      shippingAddress: {},
      metadata: {},
      placedAt: DateTime.now(),
    })

    await order.refresh()

    assert.equal(order.subtotal, 100)
    assert.equal(order.discountTotal, 15)
    assert.equal(order.shippingTotal, 10)
    assert.equal(order.grandTotal, grandTotal)
  })
})

test.group('Cart to Order - Stock validation', (group) => {
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

  test('inactive product cannot be found for cart', async ({ assert }) => {
    const product = await Product.create({
      storeId: store.id,
      title: 'Inactive Product',
      slug: 'inactive-product',
      price: 29.99,
      status: 'draft',
      sku: 'INACTIVE-001',
      type: 'simple',
      isTaxable: true,
      requiresShipping: true,
      trackInventory: false,
      stockQuantity: 100,
      hasVariants: false,
      isFeatured: false,
      sortOrder: 0,
      customFields: {},
      weightUnit: 'kg',
    })

    const activeProduct = await Product.query()
      .where('id', product.id)
      .where('status', 'active')
      .first()

    assert.isNull(activeProduct)
  })

  test('deleted product cannot be found for cart', async ({ assert }) => {
    const product = await Product.create({
      storeId: store.id,
      title: 'Deleted Product',
      slug: 'deleted-product',
      price: 29.99,
      status: 'active',
      deletedAt: DateTime.now(),
      sku: 'DELETED-001',
      type: 'simple',
      isTaxable: true,
      requiresShipping: true,
      trackInventory: false,
      stockQuantity: 100,
      hasVariants: false,
      isFeatured: false,
      sortOrder: 0,
      customFields: {},
      weightUnit: 'kg',
    })

    const activeProduct = await Product.query()
      .where('id', product.id)
      .where('status', 'active')
      .whereNull('deletedAt')
      .first()

    assert.isNull(activeProduct)
  })
})
