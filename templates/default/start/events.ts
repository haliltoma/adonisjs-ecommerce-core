/*
|--------------------------------------------------------------------------
| Events Configuration
|--------------------------------------------------------------------------
|
| Register event listeners for the application. Events allow you to
| decouple different parts of the application and execute side effects
| asynchronously.
|
*/

import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'

// Order Events
import {
  OrderCreated,
  OrderStatusChanged,
  OrderPaid,
  OrderShipped,
  OrderDelivered,
  OrderCancelled,
  OrderRefunded,
} from '#events/order_events'

// Product Events
import {
  ProductLowStock,
  ProductOutOfStock,
  ProductBackInStock,
} from '#events/product_events'

// Customer Events
import {
  CustomerRegistered,
  CustomerVerified,
  CustomerPasswordResetRequested,
} from '#events/customer_events'

// Listeners
const OrderListener = () => import('#listeners/order_listener')
const InventoryListener = () => import('#listeners/inventory_listener')

/*
|--------------------------------------------------------------------------
| Order Event Listeners
|--------------------------------------------------------------------------
*/

emitter.on(OrderCreated, [OrderListener, 'handleOrderCreated'])
emitter.on(OrderStatusChanged, [OrderListener, 'handleOrderStatusChanged'])
emitter.on(OrderPaid, [OrderListener, 'handleOrderPaid'])
emitter.on(OrderShipped, [OrderListener, 'handleOrderShipped'])
emitter.on(OrderDelivered, [OrderListener, 'handleOrderDelivered'])
emitter.on(OrderCancelled, [OrderListener, 'handleOrderCancelled'])
emitter.on(OrderRefunded, [OrderListener, 'handleOrderRefunded'])

/*
|--------------------------------------------------------------------------
| Inventory Event Listeners
|--------------------------------------------------------------------------
*/

emitter.on(ProductLowStock, [InventoryListener, 'handleLowStock'])
emitter.on(ProductOutOfStock, [InventoryListener, 'handleOutOfStock'])
emitter.on(ProductBackInStock, [InventoryListener, 'handleBackInStock'])

/*
|--------------------------------------------------------------------------
| Customer Event Listeners
|--------------------------------------------------------------------------
|
| Customer events can be used for:
| - Sending welcome emails
| - Logging authentication activities
| - Triggering marketing automations
|
*/

emitter.on(CustomerRegistered, async (event) => {
  logger.info(`[CustomerEvent] New customer registered: ${event.customer.email}`)
  // TODO: Send welcome email
  // TODO: Add to newsletter if opted in
})

emitter.on(CustomerVerified, async (event) => {
  logger.info(`[CustomerEvent] Customer verified: ${event.customer.email}`)
  // TODO: Send verification success email
})

emitter.on(CustomerPasswordResetRequested, async (event) => {
  logger.info(`[CustomerEvent] Password reset requested: ${event.customer.email}`)
  // TODO: Send password reset email with token
})
