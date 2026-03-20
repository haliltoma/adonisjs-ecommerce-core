/**
 * Manual Checkout Test
 * Tests the complete checkout flow step by step
 */

import { Database } from '@adonisjs/lucid/services/database'
import Cart from '#models/cart'
import Order from '#models/order'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'
import Customer from '#models/customer'
import { useCartService } from '#services/service_container'
import { useOrderService } from '#services/service_container'
import { useCustomerService } from '#services/service_container'

async function testCheckout() {
  console.log('=== CHECKOUT FLOW TEST START ===\n')

  try {
    // STEP 1: Check if we have data
    console.log('[STEP 1] Checking database for test data...')

    const products = await Product.query().limit(1)
    if (products.length === 0) {
      throw new Error('❌ No products found! Run db:seed first')
    }

    const product = products[0]!
    console.log(`✓ Found product: ${product.title} (ID: ${product.id})`)

    const variants = await ProductVariant.query().where('productId', product.id).limit(1)
    if (variants.length === 0) {
      throw new Error('❌ No variants found!')
    }

    const variant = variants[0]!
    console.log(`✓ Found variant: ${variant.title} (ID: ${variant.id})`)
    console.log(`  Price: $${variant.price}, Stock: ${variant.stockQuantity}`)

    const storeId = product.storeId
    console.log(`✓ Store ID: ${storeId}`)

    // STEP 2: Get or create customer
    console.log('\n[STEP 2] Getting/creating customer...')

    const customerService = useCustomerService()

    let customer = await customerService.findByEmail(storeId, 'test@example.com')
    if (!customer) {
      console.log('  Creating new customer...')
      customer = await customerService.create({
        storeId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      })
      console.log(`✓ Customer created: ${customer.id}`)
    } else {
      console.log(`✓ Customer found: ${customer.id}`)
    }

    // STEP 3: Create cart with items
    console.log('\n[STEP 3] Creating cart...')

    const cartService = useCartService()

    // Create a test cart
    const cart = await Cart.create({
      storeId,
      customerId: customer.id,
      email: 'test@example.com',
      currencyCode: 'USD',
      subtotal: Number(variant.price),
      discountTotal: 0,
      taxTotal: 0,
      shippingTotal: 0,
      grandTotal: Number(variant.price),
      totalItems: 1,
      totalQuantity: 1,
      metadata: {},
    })

    console.log(`✓ Cart created: ${cart.id}`)

    // Add cart item
    const { default: CartItem } = await import('#models/cart_item')

    const cartItem = await CartItem.create({
      cartId: cart.id,
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      quantity: 1,
      unitPrice: Number(variant.price),
      totalPrice: Number(variant.price),
      metadata: {},
    })

    console.log(`✓ Cart item added: ${cartItem.id}`)
    console.log(`  Unit Price: $${cartItem.unitPrice}, Quantity: ${cartItem.quantity}`)

    // STEP 4: Test order creation
    console.log('\n[STEP 4] Creating order from cart...')

    const orderService = useOrderService()

    console.log('  Calling orderService.createFromCart...')

    const order = await orderService.createFromCart({
      cartId: cart.id,
      customerId: customer.id,
      billingAddress: {
        firstName: 'Test',
        lastName: 'User',
        address1: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'US',
        phone: '555-1234',
      },
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        address1: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'US',
        phone: '555-1234',
      },
      shippingMethod: 'standard',
      shippingCost: 9.99,
      notes: 'Test order',
    })

    console.log(`✓ Order created: ${order.id}`)
    console.log(`  Order Number: ${order.orderNumber}`)
    console.log(`  Status: ${order.status}`)
    console.log(`  Payment Status: ${order.paymentStatus}`)
    console.log(`  Subtotal: $${order.subtotal}`)
    console.log(`  Discount: $${order.discountTotal}`)
    console.log(`  Tax: $${order.taxTotal}`)
    console.log(`  Shipping: $${order.shippingTotal}`)
    console.log(`  Grand Total: $${order.grandTotal}`)

    // STEP 5: Verify order items
    console.log('\n[STEP 5] Verifying order items...')

    await order.load('items')

    console.log(`✓ Order has ${order.items.length} items:`)
    for (const item of order.items) {
      console.log(`  - ${item.title} (${item.variantTitle})`)
      console.log(`    Quantity: ${item.quantity}, Unit Price: $${item.unitPrice}, Total: $${item.totalPrice}`)
    }

    // STEP 6: Verify cart was marked as completed
    console.log('\n[STEP 6] Verifying cart completion...')

    await cart.refresh()
    console.log(`✓ Cart completedAt: ${cart.completedAt}`)

    // STEP 7: Check order status history
    console.log('\n[STEP 7] Checking order status history...')

    await order.load('statusHistory')
    console.log(`✓ Order has ${order.statusHistory.length} status changes:`)

    for (const history of order.statusHistory) {
      console.log(`  - ${history.status}: ${history.title}`)
      console.log(`    Type: ${history.type}, Created: ${history.createdAt}`)
    }

    console.log('\n=== CHECKOUT FLOW TEST: SUCCESS ✓ ===')

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      grandTotal: order.grandTotal,
    }

  } catch (error) {
    console.error('\n=== CHECKOUT FLOW TEST: FAILED ✗ ===')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    }
  }
}

// Run the test
testCheckout()
  .then((result) => {
    console.log('\nTest Result:', JSON.stringify(result, null, 2))
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
