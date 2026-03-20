import { test } from '@japa/runner'
import { assert } from '@japa/assert'
import Cart from '#models/cart'
import Order from '#models/order'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'

test.group('Checkout Flow', (group) => {
  // Setup: Get store and product data
  let storeId: string
  let productId: string
  let variantId: string

  group.setup(async () => {
    // Get store from seed data
    const stores = await Product.query().limit(1)
    if (stores.length === 0) {
      throw new Error('No products found in database. Run db:seed first.')
    }

    const product = await Product.query().first()
    if (!product) {
      throw new Error('No product found')
    }

    productId = product.id
    storeId = product.storeId

    const variants = await ProductVariant.query().where('productId', productId).limit(1)
    if (variants.length === 0) {
      throw new Error('No product variants found')
    }
    variantId = variants[0]!.id
  })

  test('create cart and add item', async ({ assert }) => {
    console.log('[TEST] Creating cart...')

    const cart = await Cart.create({
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
    })

    assert.exists(cart.id)
    console.log('[TEST] Cart created:', cart.id)

    // Add cart item
    const { default: CartItem } = await import('#models/cart_item')

    await CartItem.create({
      cartId: cart.id,
      productId,
      variantId,
      title: 'Test Product',
      variantTitle: 'Test Variant',
      quantity: 1,
      unitPrice: 100,
      totalPrice: 100,
      metadata: {},
    })

    console.log('[TEST] Cart item added')

    // Verify cart totals
    await cart.refresh()
    assert.equal(cart.totalItems, 1)
    assert.equal(cart.totalQuantity, 1)
  })

  test('create order from cart data', async ({ assert }) => {
    console.log('[TEST] Testing order creation...')

    // First create a cart with items
    const cart = await Cart.create({
      storeId,
      customerId: null,
      email: 'test@example.com',
      currencyCode: 'USD',
      subtotal: 100,
      discountTotal: 0,
      taxTotal: 10,
      shippingTotal: 15,
      grandTotal: 125,
      totalItems: 1,
      totalQuantity: 1,
      metadata: {},
    })

    console.log('[TEST] Test cart created:', cart.id)

    // Now test order creation through service
    const { useCartService } = await import('#services/service_container')
    const { useOrderService } = await import('#services/service_container')

    const cartService = useCartService()
    const orderService = useOrderService()

    try {
      const order = await orderService.createFromCart({
        cartId: cart.id,
        customerId: null,
        billingAddress: {
          firstName: 'Test',
          lastName: 'User',
          address1: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'US',
          phone: '555-1234',
        },
        shippingMethod: 'standard',
        shippingCost: 15,
      })

      console.log('[TEST] Order created successfully:', order.id)
      assert.exists(order.id)
      assert.equal(order.status, 'pending')
      assert.equal(order.grandTotal, 125)
    } catch (error) {
      console.error('[TEST] Order creation failed:', error)
      throw error
    }
  })
})
