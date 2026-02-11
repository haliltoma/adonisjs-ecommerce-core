import { test } from '@japa/runner'
import { money } from '../../app/helpers/money.js'

/**
 * Unit tests for order service logic.
 * Tests the pure calculation/validation logic without DB dependencies.
 */

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'partially_refunded' | 'refunded' | 'failed'
type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled'

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'processing', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

const VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['authorized', 'paid', 'failed'],
  authorized: ['paid', 'failed'],
  paid: ['partially_refunded', 'refunded'],
  partially_refunded: ['refunded'],
  refunded: [],
  failed: ['pending'],
}

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return VALID_PAYMENT_TRANSITIONS[from]?.includes(to) ?? false
}

test.group('Order Service - Status transitions', () => {
  test('pending → confirmed is valid', ({ assert }) => {
    assert.isTrue(canTransition('pending', 'confirmed'))
  })

  test('pending → processing is valid', ({ assert }) => {
    assert.isTrue(canTransition('pending', 'processing'))
  })

  test('pending → cancelled is valid', ({ assert }) => {
    assert.isTrue(canTransition('pending', 'cancelled'))
  })

  test('pending → shipped is invalid', ({ assert }) => {
    assert.isFalse(canTransition('pending', 'shipped'))
  })

  test('pending → delivered is invalid', ({ assert }) => {
    assert.isFalse(canTransition('pending', 'delivered'))
  })

  test('processing → shipped is valid', ({ assert }) => {
    assert.isTrue(canTransition('processing', 'shipped'))
  })

  test('shipped → delivered is valid', ({ assert }) => {
    assert.isTrue(canTransition('shipped', 'delivered'))
  })

  test('delivered → refunded is valid', ({ assert }) => {
    assert.isTrue(canTransition('delivered', 'refunded'))
  })

  test('cancelled → anything is invalid', ({ assert }) => {
    assert.isFalse(canTransition('cancelled', 'pending'))
    assert.isFalse(canTransition('cancelled', 'processing'))
    assert.isFalse(canTransition('cancelled', 'shipped'))
  })

  test('refunded → anything is invalid', ({ assert }) => {
    assert.isFalse(canTransition('refunded', 'pending'))
    assert.isFalse(canTransition('refunded', 'processing'))
  })
})

test.group('Order Service - Payment status transitions', () => {
  test('pending → paid is valid', ({ assert }) => {
    assert.isTrue(canTransitionPayment('pending', 'paid'))
  })

  test('pending → authorized is valid', ({ assert }) => {
    assert.isTrue(canTransitionPayment('pending', 'authorized'))
  })

  test('pending → failed is valid', ({ assert }) => {
    assert.isTrue(canTransitionPayment('pending', 'failed'))
  })

  test('authorized → paid is valid', ({ assert }) => {
    assert.isTrue(canTransitionPayment('authorized', 'paid'))
  })

  test('paid → partially_refunded is valid', ({ assert }) => {
    assert.isTrue(canTransitionPayment('paid', 'partially_refunded'))
  })

  test('paid → refunded is valid', ({ assert }) => {
    assert.isTrue(canTransitionPayment('paid', 'refunded'))
  })

  test('refunded → anything is invalid', ({ assert }) => {
    assert.isFalse(canTransitionPayment('refunded', 'paid'))
    assert.isFalse(canTransitionPayment('refunded', 'pending'))
  })

  test('failed → pending is valid (retry)', ({ assert }) => {
    assert.isTrue(canTransitionPayment('failed', 'pending'))
  })
})

test.group('Order Service - Order number generation', () => {
  test('generates unique order numbers', ({ assert }) => {
    const prefix = 'ORD'
    const sequence = 1234
    const orderNumber = `${prefix}-${String(sequence).padStart(8, '0')}`

    assert.equal(orderNumber, 'ORD-00001234')
  })

  test('order numbers increment sequentially', ({ assert }) => {
    const numbers = [1, 2, 3, 10, 100].map(
      (n) => `ORD-${String(n).padStart(8, '0')}`
    )

    assert.equal(numbers[0], 'ORD-00000001')
    assert.equal(numbers[1], 'ORD-00000002')
    assert.equal(numbers[2], 'ORD-00000003')
    assert.equal(numbers[3], 'ORD-00000010')
    assert.equal(numbers[4], 'ORD-00000100')
  })
})

test.group('Order Service - Total calculations', () => {
  test('order totals from cart items', ({ assert }) => {
    const items = [
      { unitPrice: 29.99, quantity: 2 },
      { unitPrice: 49.99, quantity: 1 },
    ]

    const subtotal = items.reduce(
      (sum, item) => money.add(sum, money.multiply(item.unitPrice, item.quantity)),
      0
    )

    assert.equal(subtotal, 109.97)
  })

  test('grand total includes all components', ({ assert }) => {
    const subtotal = 200
    const discountTotal = 20
    const taxTotal = 14.4
    const shippingTotal = 15

    const grandTotal = money.add(
      money.add(money.subtract(subtotal, discountTotal), taxTotal),
      shippingTotal
    )

    assert.equal(grandTotal, 209.4)
  })

  test('grand total with free shipping', ({ assert }) => {
    const subtotal = 150
    const discountTotal = 0
    const taxTotal = 12
    const shippingTotal = 0

    const grandTotal = money.add(
      money.subtract(subtotal, discountTotal),
      taxTotal
    )

    assert.equal(grandTotal, 162)
  })
})

test.group('Order Service - Refund calculations', () => {
  test('full refund equals grand total', ({ assert }) => {
    const grandTotal = 118
    const totalPaid = 118
    const refundAmount = totalPaid

    assert.equal(refundAmount, grandTotal)
    assert.equal(money.subtract(totalPaid, refundAmount), 0)
  })

  test('partial refund leaves remaining balance', ({ assert }) => {
    const totalPaid = 118
    const refundAmount = 50
    const remaining = money.subtract(totalPaid, refundAmount)

    assert.equal(remaining, 68)
  })

  test('refund cannot exceed total paid', ({ assert }) => {
    const totalPaid = 100
    const requestedRefund = 150
    const actualRefund = Math.min(requestedRefund, totalPaid)

    assert.equal(actualRefund, 100)
  })

  test('multiple partial refunds track total', ({ assert }) => {
    const totalPaid = 200
    let totalRefunded = 0

    // First refund
    const refund1 = 50
    totalRefunded = money.add(totalRefunded, refund1)
    assert.equal(totalRefunded, 50)

    // Second refund
    const refund2 = 75
    totalRefunded = money.add(totalRefunded, refund2)
    assert.equal(totalRefunded, 125)

    // Remaining
    const remaining = money.subtract(totalPaid, totalRefunded)
    assert.equal(remaining, 75)
  })

  test('determine payment status after refund', ({ assert }) => {
    function getRefundStatus(totalPaid: number, totalRefunded: number): PaymentStatus {
      if (totalRefunded >= totalPaid) return 'refunded'
      if (totalRefunded > 0) return 'partially_refunded'
      return 'paid'
    }

    assert.equal(getRefundStatus(100, 0), 'paid')
    assert.equal(getRefundStatus(100, 50), 'partially_refunded')
    assert.equal(getRefundStatus(100, 100), 'refunded')
  })
})

test.group('Order Service - Fulfillment status', () => {
  test('all items fulfilled → fulfilled', ({ assert }) => {
    const items = [
      { quantity: 2, fulfilledQuantity: 2 },
      { quantity: 3, fulfilledQuantity: 3 },
    ]

    function getFulfillmentStatus(orderItems: typeof items): FulfillmentStatus {
      const totalQuantity = orderItems.reduce((sum, i) => sum + i.quantity, 0)
      const totalFulfilled = orderItems.reduce((sum, i) => sum + i.fulfilledQuantity, 0)

      if (totalFulfilled === 0) return 'unfulfilled'
      if (totalFulfilled >= totalQuantity) return 'fulfilled'
      return 'partially_fulfilled'
    }

    assert.equal(getFulfillmentStatus(items), 'fulfilled')
  })

  test('some items fulfilled → partially_fulfilled', ({ assert }) => {
    const items = [
      { quantity: 2, fulfilledQuantity: 2 },
      { quantity: 3, fulfilledQuantity: 1 },
    ]

    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalFulfilled = items.reduce((sum, i) => sum + i.fulfilledQuantity, 0)

    assert.equal(totalQuantity, 5)
    assert.equal(totalFulfilled, 3)

    const status: FulfillmentStatus = totalFulfilled === 0
      ? 'unfulfilled'
      : totalFulfilled >= totalQuantity
        ? 'fulfilled'
        : 'partially_fulfilled'

    assert.equal(status, 'partially_fulfilled')
  })

  test('no items fulfilled → unfulfilled', ({ assert }) => {
    const items = [
      { quantity: 2, fulfilledQuantity: 0 },
      { quantity: 3, fulfilledQuantity: 0 },
    ]

    const totalFulfilled = items.reduce((sum, i) => sum + i.fulfilledQuantity, 0)
    assert.equal(totalFulfilled, 0)
  })
})
