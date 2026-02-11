import { BaseEvent } from '@adonisjs/core/events'
import Cart from '#models/cart'
import CartItem from '#models/cart_item'

/**
 * Cart Created Event
 */
export class CartCreated extends BaseEvent {
  constructor(public cart: Cart) {
    super()
  }
}

/**
 * Cart Item Added Event
 */
export class CartItemAdded extends BaseEvent {
  constructor(
    public cart: Cart,
    public item: CartItem
  ) {
    super()
  }
}

/**
 * Cart Item Updated Event
 */
export class CartItemUpdated extends BaseEvent {
  constructor(
    public cart: Cart,
    public item: CartItem,
    public oldQuantity: number
  ) {
    super()
  }
}

/**
 * Cart Item Removed Event
 */
export class CartItemRemoved extends BaseEvent {
  constructor(
    public cart: Cart,
    public item: CartItem
  ) {
    super()
  }
}

/**
 * Cart Coupon Applied Event
 */
export class CartCouponApplied extends BaseEvent {
  constructor(
    public cart: Cart,
    public couponCode: string
  ) {
    super()
  }
}

/**
 * Cart Coupon Removed Event
 */
export class CartCouponRemoved extends BaseEvent {
  constructor(
    public cart: Cart,
    public couponCode: string
  ) {
    super()
  }
}

/**
 * Cart Abandoned Event
 * Fired when a cart has been inactive for a configured period
 */
export class CartAbandoned extends BaseEvent {
  constructor(public cart: Cart) {
    super()
  }
}

/**
 * Cart Converted Event
 * Fired when a cart is converted to an order
 */
export class CartConverted extends BaseEvent {
  constructor(
    public cart: Cart,
    public orderId: string
  ) {
    super()
  }
}
