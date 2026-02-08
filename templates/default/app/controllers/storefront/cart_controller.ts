import type { HttpContext } from '@adonisjs/core/http'
import CartService from '#services/cart_service'
import DiscountService from '#services/discount_service'

export default class CartController {
  private cartService: CartService
  private discountService: DiscountService

  constructor() {
    this.cartService = new CartService()
    this.discountService = new DiscountService()
  }

  async index({ inertia, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)
    await cart.load('items', (query) => {
      query.preload('product', (q) => q.preload('images')).preload('variant')
    })

    return inertia.render('storefront/Cart', {
      cart: this.serializeCart(cart),
    })
  }

  async add({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    const { productId, variantId, quantity } = request.only(['productId', 'variantId', 'quantity'])

    try {
      const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)

      await this.cartService.addItem(cart.id, {
        productId,
        variantId,
        quantity: quantity || 1,
      })

      session.flash('success', 'Item added to cart')

      // For AJAX requests, return JSON
      if (request.ajax()) {
        await cart.load('items')
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error) {
      if (request.ajax()) {
        return response.status(400).json({ error: error.message })
      }
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async update({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    const { quantity } = request.only(['quantity'])

    try {
      const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)

      await this.cartService.updateItem(cart.id, params.itemId, {
        quantity: Number(quantity),
      })

      if (request.ajax()) {
        await cart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error) {
      if (request.ajax()) {
        return response.status(400).json({ error: error.message })
      }
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async remove({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    try {
      const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)

      await this.cartService.removeItem(cart.id, params.itemId)

      session.flash('success', 'Item removed from cart')

      if (request.ajax()) {
        await cart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error) {
      if (request.ajax()) {
        return response.status(400).json({ error: error.message })
      }
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async clear({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    try {
      const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)
      await this.cartService.clearCart(cart.id)

      session.flash('success', 'Cart cleared')

      if (request.ajax()) {
        return response.json({ success: true, cart: null })
      }

      return response.redirect().back()
    } catch (error) {
      if (request.ajax()) {
        return response.status(400).json({ error: error.message })
      }
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async applyDiscount({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    const { code } = request.only(['code'])

    try {
      const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)

      const result = await this.discountService.validateAndApply(storeId, code, cart, customerId)

      if (!result.valid) {
        if (request.ajax()) {
          return response.status(400).json({ error: result.error || 'Invalid discount code' })
        }
        session.flash('error', result.error || 'Invalid discount code')
        return response.redirect().back()
      }

      // Apply discount to cart
      cart.couponCode = code.toUpperCase()
      cart.discountTotal = result.discountAmount
      cart.grandTotal = cart.subtotal - result.discountAmount + cart.taxTotal
      await cart.save()

      session.flash('success', 'Discount applied')

      if (request.ajax()) {
        await cart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
          discount: {
            code: result.discount!.code,
            type: result.discount!.type,
            value: result.discount!.value,
            amount: result.discountAmount,
          },
        })
      }

      return response.redirect().back()
    } catch (error) {
      if (request.ajax()) {
        return response.status(400).json({ error: error.message })
      }
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async removeDiscount({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    try {
      const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)
      await this.cartService.removeDiscount(cart.id)

      session.flash('success', 'Discount removed')

      if (request.ajax()) {
        await cart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error) {
      if (request.ajax()) {
        return response.status(400).json({ error: error.message })
      }
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async getCartData({ response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)
    await cart.load('items', (query) => {
      query.preload('product', (q) => q.preload('images')).preload('variant')
    })

    return response.json(this.serializeCart(cart))
  }

  private serializeCart(cart: any) {
    return {
      id: cart.id,
      itemCount: cart.totalItems,
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      discountCode: cart.couponCode,
      taxTotal: cart.taxTotal,
      total: cart.grandTotal,
      currency: cart.currencyCode,
      items: cart.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        thumbnail: item.product?.images?.[0]?.url,
        productSlug: item.product?.slug,
      })),
    }
  }
}
