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

// ── Order Events ─────────────────────────────────────────
import {
  OrderCreated,
  OrderStatusChanged,
  OrderPaid,
  OrderShipped,
  OrderDelivered,
  OrderCancelled,
  OrderRefunded,
} from '#events/order_events'

// ── Product Events ───────────────────────────────────────
import {
  ProductCreated,
  ProductUpdated,
  ProductDeleted,
  ProductLowStock,
  ProductOutOfStock,
  ProductBackInStock,
} from '#events/product_events'

// ── Inventory Events ────────────────────────────────────
import { InventoryAdjusted } from '#events/inventory_events'

// ── Customer Events ──────────────────────────────────────
import {
  CustomerRegistered,
  CustomerVerified,
  CustomerPasswordResetRequested,
  CustomerLoggedIn,
  CustomerDeactivated,
} from '#events/customer_events'

// ── Cart Events ──────────────────────────────────────────
import {
  CartItemAdded,
  CartItemRemoved,
  CartCouponApplied,
  CartAbandoned,
  CartConverted,
} from '#events/cart_events'

// ── Payment Events ───────────────────────────────────────
import {
  PaymentAuthorized,
  PaymentCaptured,
  PaymentFailed,
  PaymentRefunded,
  PaymentVoided,
} from '#events/payment_events'

// ── Review Events ────────────────────────────────────────
import { ReviewCreated, ReviewApproved, ReviewRejected } from '#events/review_events'

// ── Lazy-loaded Listeners ────────────────────────────────
const OrderListener = () => import('#listeners/order_listener')
const InventoryListener = () => import('#listeners/inventory_listener')
const CartListener = () => import('#listeners/cart_listener')
const PaymentListener = () => import('#listeners/payment_listener')
const ReviewListener = () => import('#listeners/review_listener')
const CustomerListener = () => import('#listeners/customer_listener')
const SearchIndexListener = () => import('#listeners/search_index_listener')
const CacheInvalidationListener = () => import('#listeners/cache_invalidation_listener')
const WebhookListener = () => import('#listeners/webhook_listener')

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

emitter.on(ProductCreated, [SearchIndexListener, 'handleProductCreated'])
emitter.on(ProductUpdated, [SearchIndexListener, 'handleProductUpdated'])
emitter.on(ProductDeleted, [SearchIndexListener, 'handleProductDeleted'])

emitter.on(ProductLowStock, [InventoryListener, 'handleLowStock'])
emitter.on(ProductOutOfStock, [InventoryListener, 'handleOutOfStock'])
emitter.on(ProductBackInStock, [InventoryListener, 'handleBackInStock'])

/*
|--------------------------------------------------------------------------
| Cart Event Listeners
|--------------------------------------------------------------------------
*/

emitter.on(CartItemAdded, [CartListener, 'handleItemAdded'])
emitter.on(CartItemRemoved, [CartListener, 'handleItemRemoved'])
emitter.on(CartCouponApplied, [CartListener, 'handleCouponApplied'])
emitter.on(CartAbandoned, [CartListener, 'handleAbandoned'])
emitter.on(CartConverted, [CartListener, 'handleConverted'])

/*
|--------------------------------------------------------------------------
| Payment Event Listeners
|--------------------------------------------------------------------------
*/

emitter.on(PaymentAuthorized, [PaymentListener, 'handleAuthorized'])
emitter.on(PaymentCaptured, [PaymentListener, 'handleCaptured'])
emitter.on(PaymentFailed, [PaymentListener, 'handleFailed'])
emitter.on(PaymentRefunded, [PaymentListener, 'handleRefunded'])
emitter.on(PaymentVoided, [PaymentListener, 'handleVoided'])

/*
|--------------------------------------------------------------------------
| Review Event Listeners
|--------------------------------------------------------------------------
*/

emitter.on(ReviewCreated, [ReviewListener, 'handleCreated'])
emitter.on(ReviewApproved, [ReviewListener, 'handleApproved'])
emitter.on(ReviewRejected, [ReviewListener, 'handleRejected'])

/*
|--------------------------------------------------------------------------
| Customer Event Listeners
|--------------------------------------------------------------------------
*/

emitter.on(CustomerRegistered, [CustomerListener, 'handleRegistered'])
emitter.on(CustomerVerified, [CustomerListener, 'handleVerified'])
emitter.on(CustomerPasswordResetRequested, [CustomerListener, 'handlePasswordResetRequested'])
emitter.on(CustomerLoggedIn, [CustomerListener, 'handleLoggedIn'])
emitter.on(CustomerDeactivated, [CustomerListener, 'handleDeactivated'])

/*
|--------------------------------------------------------------------------
| Cache Invalidation Listeners
|--------------------------------------------------------------------------
*/

emitter.on(ProductCreated, [CacheInvalidationListener, 'handleProductCreated'])
emitter.on(ProductUpdated, [CacheInvalidationListener, 'handleProductUpdated'])
emitter.on(ProductDeleted, [CacheInvalidationListener, 'handleProductDeleted'])
emitter.on(OrderCreated, [CacheInvalidationListener, 'handleOrderCreated'])
emitter.on(OrderStatusChanged, [CacheInvalidationListener, 'handleOrderStatusChanged'])
emitter.on(InventoryAdjusted, [CacheInvalidationListener, 'handleInventoryAdjusted'])

/*
|--------------------------------------------------------------------------
| Webhook Dispatch Listeners
|--------------------------------------------------------------------------
*/

emitter.on(OrderCreated, [WebhookListener, 'handleOrderCreated'])
emitter.on(OrderStatusChanged, [WebhookListener, 'handleOrderStatusChanged'])
emitter.on(OrderPaid, [WebhookListener, 'handleOrderPaid'])
emitter.on(OrderShipped, [WebhookListener, 'handleOrderShipped'])
emitter.on(OrderDelivered, [WebhookListener, 'handleOrderDelivered'])
emitter.on(OrderCancelled, [WebhookListener, 'handleOrderCancelled'])
emitter.on(OrderRefunded, [WebhookListener, 'handleOrderRefunded'])
emitter.on(ProductCreated, [WebhookListener, 'handleProductCreated'])
emitter.on(ProductUpdated, [WebhookListener, 'handleProductUpdated'])
emitter.on(ProductDeleted, [WebhookListener, 'handleProductDeleted'])
emitter.on(CustomerRegistered, [WebhookListener, 'handleCustomerRegistered'])
emitter.on(CustomerVerified, [WebhookListener, 'handleCustomerVerified'])
emitter.on(InventoryAdjusted, [WebhookListener, 'handleInventoryAdjusted'])
emitter.on(PaymentCaptured, [WebhookListener, 'handlePaymentCaptured'])
emitter.on(PaymentFailed, [WebhookListener, 'handlePaymentFailed'])
emitter.on(PaymentRefunded, [WebhookListener, 'handlePaymentRefunded'])
