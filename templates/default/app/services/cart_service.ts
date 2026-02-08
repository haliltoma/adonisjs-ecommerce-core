import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import ProductVariant from '#models/product_variant'
import Product from '#models/product'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

interface AddToCartDTO {
  productId: string
  variantId?: string
  quantity: number
  metadata?: Record<string, unknown>
}

interface UpdateCartItemDTO {
  quantity: number
  metadata?: Record<string, unknown>
}

export default class CartService {
  async getOrCreateCart(storeId: string, customerId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null

    if (customerId) {
      cart = await Cart.query()
        .where('storeId', storeId)
        .where('customerId', customerId)
        .whereNull('completedAt')
        .preload('items', (query) => {
          query.preload('product').preload('variant')
        })
        .first()
    } else if (sessionId) {
      cart = await Cart.query()
        .where('storeId', storeId)
        .where('sessionId', sessionId)
        .whereNull('customerId')
        .whereNull('completedAt')
        .preload('items', (query) => {
          query.preload('product').preload('variant')
        })
        .first()
    }

    if (!cart) {
      cart = await Cart.create({
        storeId,
        customerId,
        sessionId,
        currencyCode: 'USD',
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        totalItems: 0,
        metadata: {},
      })
    }

    return cart
  }

  async addItem(cartId: string, data: AddToCartDTO): Promise<Cart> {
    return await db.transaction(async (trx) => {
      const cart = await Cart.query({ client: trx }).where('id', cartId).firstOrFail()

      const product = await Product.query({ client: trx })
        .where('id', data.productId)
        .where('status', 'active')
        .whereNull('deletedAt')
        .firstOrFail()

      let variant: ProductVariant | null = null
      let price: number
      let sku: string | null = null

      if (data.variantId) {
        variant = await ProductVariant.query({ client: trx })
          .where('id', data.variantId)
          .where('productId', data.productId)
          .firstOrFail()
        price = variant.price
        sku = variant.sku
      } else {
        price = product.price || 0
        sku = product.sku
      }

      // Check if item already exists in cart
      const existingItem = await CartItem.query({ client: trx })
        .where('cartId', cartId)
        .where('productId', data.productId)
        .where((query) => {
          if (data.variantId) {
            query.where('variantId', data.variantId)
          } else {
            query.whereNull('variantId')
          }
        })
        .first()

      if (existingItem) {
        existingItem.quantity += data.quantity
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice
        await existingItem.useTransaction(trx).save()
      } else {
        await CartItem.create(
          {
            cartId,
            productId: data.productId,
            variantId: data.variantId,
            quantity: data.quantity,
            unitPrice: price,
            totalPrice: price * data.quantity,
            sku: sku || product.id,
            title: product.title,
            metadata: data.metadata || {},
          },
          { client: trx }
        )
      }

      await this.recalculateCart(cart, trx)

      return cart
    })
  }

  async updateItem(cartId: string, itemId: string, data: UpdateCartItemDTO): Promise<Cart> {
    return await db.transaction(async (trx) => {
      const cart = await Cart.query({ client: trx }).where('id', cartId).firstOrFail()

      const item = await CartItem.query({ client: trx })
        .where('id', itemId)
        .where('cartId', cartId)
        .firstOrFail()

      if (data.quantity <= 0) {
        await item.useTransaction(trx).delete()
      } else {
        item.quantity = data.quantity
        item.totalPrice = item.quantity * item.unitPrice
        if (data.metadata) {
          item.metadata = data.metadata
        }
        await item.useTransaction(trx).save()
      }

      await this.recalculateCart(cart, trx)

      return cart
    })
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    return await db.transaction(async (trx) => {
      const cart = await Cart.query({ client: trx }).where('id', cartId).firstOrFail()

      await CartItem.query({ client: trx }).where('id', itemId).where('cartId', cartId).delete()

      await this.recalculateCart(cart, trx)

      return cart
    })
  }

  async clearCart(cartId: string): Promise<Cart> {
    return await db.transaction(async (trx) => {
      const cart = await Cart.query({ client: trx }).where('id', cartId).firstOrFail()

      await CartItem.query({ client: trx }).where('cartId', cartId).delete()

      cart.subtotal = 0
      cart.discountTotal = 0
      cart.taxTotal = 0
      cart.grandTotal = 0
      cart.totalItems = 0
      await cart.useTransaction(trx).save()

      return cart
    })
  }

  async applyDiscount(cartId: string, discountCode: string): Promise<Cart> {
    const cart = await Cart.findOrFail(cartId)
    cart.couponCode = discountCode
    // Discount calculation would be done by DiscountService
    await cart.save()
    return cart
  }

  async removeDiscount(cartId: string): Promise<Cart> {
    const cart = await Cart.findOrFail(cartId)
    cart.couponCode = null
    cart.discountTotal = 0
    await this.recalculateCart(cart)
    return cart
  }

  async mergeGuestCart(guestSessionId: string, customerId: string, storeId: string): Promise<Cart> {
    return await db.transaction(async (trx) => {
      const guestCart = await Cart.query({ client: trx })
        .where('storeId', storeId)
        .where('sessionId', guestSessionId)
        .whereNull('customerId')
        .whereNull('completedAt')
        .preload('items')
        .first()

      const customerCart = await Cart.query({ client: trx })
        .where('storeId', storeId)
        .where('customerId', customerId)
        .whereNull('completedAt')
        .preload('items')
        .first()

      if (!guestCart) {
        return customerCart || (await this.getOrCreateCart(storeId, customerId))
      }

      if (!customerCart) {
        guestCart.customerId = customerId
        guestCart.sessionId = null
        await guestCart.useTransaction(trx).save()
        return guestCart
      }

      // Merge items from guest cart to customer cart
      for (const guestItem of guestCart.items) {
        const existingItem = customerCart.items.find(
          (item) => item.productId === guestItem.productId && item.variantId === guestItem.variantId
        )

        if (existingItem) {
          existingItem.quantity += guestItem.quantity
          existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice
          await existingItem.useTransaction(trx).save()
        } else {
          await CartItem.create(
            {
              cartId: customerCart.id,
              productId: guestItem.productId,
              variantId: guestItem.variantId,
              quantity: guestItem.quantity,
              unitPrice: guestItem.unitPrice,
              totalPrice: guestItem.totalPrice,
              sku: guestItem.sku,
              title: guestItem.title,
              metadata: guestItem.metadata,
            },
            { client: trx }
          )
        }
      }

      // Delete guest cart
      await CartItem.query({ client: trx }).where('cartId', guestCart.id).delete()
      await guestCart.useTransaction(trx).delete()

      await this.recalculateCart(customerCart, trx)

      return customerCart
    })
  }

  async markAsConverted(cartId: string, _orderId: string): Promise<void> {
    const cart = await Cart.findOrFail(cartId)
    cart.completedAt = DateTime.now()
    await cart.save()
  }

  private async recalculateCart(cart: Cart, trx?: any): Promise<void> {
    const items = await CartItem.query(trx ? { client: trx } : {}).where('cartId', cart.id)

    let subtotal = 0
    let totalItems = 0

    for (const item of items) {
      subtotal += item.totalPrice
      totalItems += item.quantity
    }

    cart.subtotal = subtotal
    cart.totalItems = totalItems
    cart.grandTotal = subtotal - cart.discountTotal + cart.taxTotal

    if (trx) {
      await cart.useTransaction(trx).save()
    } else {
      await cart.save()
    }
  }
}
