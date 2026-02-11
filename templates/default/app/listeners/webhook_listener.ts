import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { WebhookDispatcher } from '#contracts/webhook_provider'
import type {
  OrderCreated,
  OrderStatusChanged,
  OrderPaid,
  OrderShipped,
  OrderDelivered,
  OrderCancelled,
  OrderRefunded,
} from '#events/order_events'
import type {
  ProductCreated,
  ProductUpdated,
  ProductDeleted,
} from '#events/product_events'
import type {
  CustomerRegistered,
  CustomerVerified,
} from '#events/customer_events'
import type { InventoryAdjusted } from '#events/inventory_events'
import type {
  PaymentCaptured,
  PaymentFailed,
  PaymentRefunded,
} from '#events/payment_events'

/**
 * Webhook Listener
 *
 * Dispatches webhook notifications to registered external endpoints
 * when business events occur. Runs asynchronously to avoid blocking
 * the main request flow.
 */
export default class WebhookListener {
  private async dispatch(storeId: string, event: string, payload: Record<string, unknown>) {
    try {
      const dispatcher = await app.container.make(WebhookDispatcher)
      await dispatcher.dispatch({ storeId, event, payload })
    } catch (error) {
      logger.error({ err: error }, `[WebhookListener] Failed to dispatch ${event}`)
    }
  }

  // ── Order Events ────────────────────────────────────────

  async handleOrderCreated(event: OrderCreated) {
    await this.dispatch(event.order.storeId, 'order.created', {
      id: event.order.id,
      orderNumber: event.order.orderNumber,
      status: event.order.status,
      grandTotal: event.order.grandTotal,
      currency: event.order.currency,
      email: event.order.email,
      customerId: event.customer?.id || null,
      createdAt: event.order.createdAt?.toISO(),
    })
  }

  async handleOrderStatusChanged(event: OrderStatusChanged) {
    await this.dispatch(event.order.storeId, 'order.updated', {
      id: event.order.id,
      orderNumber: event.order.orderNumber,
      oldStatus: event.oldStatus,
      newStatus: event.newStatus,
    })
  }

  async handleOrderPaid(event: OrderPaid) {
    await this.dispatch(event.order.storeId, 'order.updated', {
      id: event.order.id,
      orderNumber: event.order.orderNumber,
      event: 'paid',
      paymentMethod: event.paymentMethod,
      transactionId: event.transactionId,
    })
  }

  async handleOrderShipped(event: OrderShipped) {
    await this.dispatch(event.order.storeId, 'order.fulfilled', {
      id: event.order.id,
      orderNumber: event.order.orderNumber,
      trackingNumber: event.trackingNumber,
      carrier: event.carrier,
    })
  }

  async handleOrderDelivered(event: OrderDelivered) {
    await this.dispatch(event.order.storeId, 'order.fulfilled', {
      id: event.order.id,
      orderNumber: event.order.orderNumber,
      event: 'delivered',
    })
  }

  async handleOrderCancelled(event: OrderCancelled) {
    await this.dispatch(event.order.storeId, 'order.cancelled', {
      id: event.order.id,
      orderNumber: event.order.orderNumber,
      reason: event.reason,
    })
  }

  async handleOrderRefunded(event: OrderRefunded) {
    await this.dispatch(event.order.storeId, 'order.cancelled', {
      id: event.order.id,
      orderNumber: event.order.orderNumber,
      event: 'refunded',
      refundAmount: event.refundAmount,
      reason: event.reason,
    })
  }

  // ── Product Events ──────────────────────────────────────

  async handleProductCreated(event: ProductCreated) {
    await this.dispatch(event.product.storeId, 'product.created', {
      id: event.product.id,
      title: event.product.title,
      slug: event.product.slug,
      status: event.product.status,
    })
  }

  async handleProductUpdated(event: ProductUpdated) {
    await this.dispatch(event.product.storeId, 'product.updated', {
      id: event.product.id,
      title: event.product.title,
      slug: event.product.slug,
      changes: Object.keys(event.changes),
    })
  }

  async handleProductDeleted(event: ProductDeleted) {
    await this.dispatch(event.product.storeId, 'product.deleted', {
      id: event.product.id,
      title: event.product.title,
      slug: event.product.slug,
    })
  }

  // ── Customer Events ─────────────────────────────────────

  async handleCustomerRegistered(event: CustomerRegistered) {
    await this.dispatch(event.customer.storeId, 'customer.created', {
      id: event.customer.id,
      email: event.customer.email,
      firstName: event.customer.firstName,
      lastName: event.customer.lastName,
    })
  }

  async handleCustomerVerified(event: CustomerVerified) {
    await this.dispatch(event.customer.storeId, 'customer.updated', {
      id: event.customer.id,
      email: event.customer.email,
      event: 'verified',
    })
  }

  // ── Inventory Events ────────────────────────────────────

  async handleInventoryAdjusted(event: InventoryAdjusted) {
    const item = event.inventoryItem
    await this.dispatch(item.storeId || '', 'inventory.updated', {
      variantId: item.variantId,
      sku: item.sku,
      previousQuantity: event.previousQuantity,
      newQuantity: event.newQuantity,
      reason: event.reason,
    })
  }

  // ── Payment Events ──────────────────────────────────────

  async handlePaymentCaptured(event: PaymentCaptured) {
    await this.dispatch(event.order.storeId, 'payment.completed', {
      orderId: event.order.id,
      orderNumber: event.order.orderNumber,
      amount: event.amount,
      transactionId: event.transactionId,
    })
  }

  async handlePaymentFailed(event: PaymentFailed) {
    await this.dispatch(event.order.storeId, 'payment.failed', {
      orderId: event.order.id,
      orderNumber: event.order.orderNumber,
      error: event.error,
    })
  }

  async handlePaymentRefunded(event: PaymentRefunded) {
    await this.dispatch(event.order.storeId, 'payment.refunded', {
      orderId: event.order.id,
      orderNumber: event.order.orderNumber,
      amount: event.amount,
      transactionId: event.transactionId,
    })
  }
}
