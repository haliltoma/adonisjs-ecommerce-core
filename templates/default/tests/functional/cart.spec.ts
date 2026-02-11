import { test } from '@japa/runner'
import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import Product from '#models/product'
import Store from '#models/store'
import Customer from '#models/customer'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

function createStoreData(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test Store',
    slug: 'test-store',
    defaultCurrency: 'USD',
    defaultLocale: 'en',
    timezone: 'UTC',
    isActive: true,
    config: {},
    meta: {},
    ...overrides,
  }
}

function createCartData(storeId: string, overrides: Record<string, unknown> = {}) {
  return {
    storeId,
    currencyCode: 'USD',
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    grandTotal: 0,
    totalItems: 0,
    totalQuantity: 0,
    metadata: {},
    ...overrides,
  }
}

function createCartItemData(cartId: string, productId: string, overrides: Record<string, unknown> = {}) {
  return {
    cartId,
    productId,
    quantity: 1,
    unitPrice: 29.99,
    totalPrice: 29.99,
    discountAmount: 0,
    taxAmount: 0,
    sku: 'TST-001',
    title: 'Test Product',
    metadata: {},
    ...overrides,
  }
}

test.group('Cart - Operations', (group) => {
  let store: Store
  let customer: Customer
  let product: Product

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create(createStoreData())

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

    product = await Product.create({
      storeId: store.id,
      title: 'Test Product',
      slug: 'test-product',
      price: 29.99,
      status: 'active',
      sku: 'TST-001',
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
  })

  test('create a new cart for customer', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
    }))

    assert.isNotNull(cart.id)
    assert.equal(cart.storeId, store.id)
    assert.equal(cart.customerId, customer.id)
    assert.equal(cart.subtotal, 0)
    assert.equal(cart.totalItems, 0)
  })

  test('create a guest cart with session ID', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      sessionId: 'guest-session-123',
    }))

    assert.isNotNull(cart.id)
    assert.isNull(cart.customerId)
    assert.equal(cart.sessionId, 'guest-session-123')
  })

  test('add item to cart', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
    }))

    const item = await CartItem.create(createCartItemData(cart.id, product.id, {
      quantity: 2,
      unitPrice: 29.99,
      totalPrice: 59.98,
    }))

    assert.isNotNull(item.id)
    assert.equal(item.cartId, cart.id)
    assert.equal(item.quantity, 2)
    assert.equal(item.unitPrice, 29.99)
    assert.equal(item.totalPrice, 59.98)
  })

  test('update cart item quantity', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
    }))

    const item = await CartItem.create(createCartItemData(cart.id, product.id))

    item.quantity = 5
    item.totalPrice = item.unitPrice * item.quantity
    await item.save()
    await item.refresh()

    assert.equal(item.quantity, 5)
    assert.equal(item.totalPrice, 149.95)
  })

  test('remove item from cart', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
    }))

    const item = await CartItem.create(createCartItemData(cart.id, product.id))

    await item.delete()

    const found = await CartItem.find(item.id)
    assert.isNull(found)
  })

  test('clear all items from cart', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
    }))

    await CartItem.create(createCartItemData(cart.id, product.id, {
      sku: 'TST-001',
      title: 'Product 1',
    }))

    await CartItem.create(createCartItemData(cart.id, product.id, {
      sku: 'TST-002',
      title: 'Product 2',
      unitPrice: 19.99,
      totalPrice: 39.98,
      quantity: 2,
    }))

    await CartItem.query().where('cartId', cart.id).delete()
    const remaining = await CartItem.query().where('cartId', cart.id)

    assert.equal(remaining.length, 0)
  })

  test('cart subtotal calculation', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
    }))

    await CartItem.create(createCartItemData(cart.id, product.id, {
      quantity: 2,
      unitPrice: 29.99,
      totalPrice: 59.98,
      sku: 'TST-001',
      title: 'Product A',
    }))

    await CartItem.create(createCartItemData(cart.id, product.id, {
      quantity: 1,
      unitPrice: 49.99,
      totalPrice: 49.99,
      sku: 'TST-002',
      title: 'Product B',
    }))

    // Recalculate
    const items = await CartItem.query().where('cartId', cart.id)
    let subtotal = 0
    let totalItems = 0
    let totalQuantity = 0
    for (const item of items) {
      subtotal += item.totalPrice
      totalItems += 1
      totalQuantity += item.quantity
    }

    cart.subtotal = subtotal
    cart.totalItems = totalItems
    cart.totalQuantity = totalQuantity
    cart.grandTotal = subtotal - cart.discountTotal + cart.taxTotal
    await cart.save()
    await cart.refresh()

    assert.equal(cart.subtotal, 109.97)
    assert.equal(cart.totalItems, 2)
    assert.equal(cart.totalQuantity, 3)
    assert.equal(cart.grandTotal, 109.97)
  })

  test('cart grand total with discount and tax', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
      subtotal: 100,
      discountTotal: 15,
      taxTotal: 8.5,
      totalItems: 2,
      totalQuantity: 3,
    }))

    cart.grandTotal = cart.subtotal - cart.discountTotal + cart.taxTotal
    await cart.save()
    await cart.refresh()

    assert.equal(cart.grandTotal, 93.5)
  })

  test('mark cart as completed', async ({ assert }) => {
    const cart = await Cart.create(createCartData(store.id, {
      customerId: customer.id,
      subtotal: 100,
      grandTotal: 100,
      totalItems: 2,
      totalQuantity: 2,
    }))

    cart.completedAt = DateTime.now()
    await cart.save()
    await cart.refresh()

    assert.isNotNull(cart.completedAt)
  })

  test('completed cart not returned as active', async ({ assert }) => {
    await Cart.create(createCartData(store.id, {
      customerId: customer.id,
      subtotal: 100,
      grandTotal: 100,
      totalItems: 2,
      totalQuantity: 2,
      completedAt: DateTime.now(),
    }))

    const activeCart = await Cart.query()
      .where('storeId', store.id)
      .where('customerId', customer.id)
      .whereNull('completedAt')
      .first()

    assert.isNull(activeCart)
  })
})
