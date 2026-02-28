import type { HttpContext } from '@adonisjs/core/http'
import CartService from '#services/cart_service'

export default class CartController {
  private cartService: CartService

  constructor() {
    this.cartService = new CartService()
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

      if (this.isApiRequest(request)) {
        await cart.load('items')
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error: unknown) {
      if (this.isApiRequest(request)) {
        return response.status(400).json({ error: (error as Error).message })
      }
      session.flash('error', (error as Error).message)
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

      if (this.isApiRequest(request)) {
        await cart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error: unknown) {
      if (this.isApiRequest(request)) {
        return response.status(400).json({ error: (error as Error).message })
      }
      session.flash('error', (error as Error).message)
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

      if (this.isApiRequest(request)) {
        await cart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error: unknown) {
      if (this.isApiRequest(request)) {
        return response.status(400).json({ error: (error as Error).message })
      }
      session.flash('error', (error as Error).message)
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

      if (this.isApiRequest(request)) {
        return response.json({ success: true, cart: null })
      }

      return response.redirect().back()
    } catch (error: unknown) {
      if (this.isApiRequest(request)) {
        return response.status(400).json({ error: (error as Error).message })
      }
      session.flash('error', (error as Error).message)
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

      // CartService.applyDiscount validates, sets couponCode, and recalculates everything
      const updatedCart = await this.cartService.applyDiscount(cart.id, code, customerId)

      session.flash('success', 'Discount applied')

      if (this.isApiRequest(request)) {
        await updatedCart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(updatedCart),
        })
      }

      return response.redirect().back()
    } catch (error: unknown) {
      if (this.isApiRequest(request)) {
        return response.status(400).json({ error: (error as Error).message })
      }
      session.flash('error', (error as Error).message)
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

      if (this.isApiRequest(request)) {
        await cart.load('items', (query) => {
          query.preload('product', (q) => q.preload('images')).preload('variant')
        })
        return response.json({
          success: true,
          cart: this.serializeCart(cart),
        })
      }

      return response.redirect().back()
    } catch (error: unknown) {
      if (this.isApiRequest(request)) {
        return response.status(400).json({ error: (error as Error).message })
      }
      session.flash('error', (error as Error).message)
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

  /**
   * Check if request is a non-Inertia AJAX call (e.g. fetch/axios from JS).
   * Inertia requests also have X-Requested-With but must receive redirects, not JSON.
   */
  private isApiRequest(request: any): boolean {
    return !request.header('x-inertia') && request.ajax()
  }

  private serializeCart(cart: any) {
    return {
      id: cart.id,
      itemCount: Number(cart.totalItems) || 0,
      subtotal: Number(cart.subtotal) || 0,
      discountTotal: Number(cart.discountTotal) || 0,
      discountCode: cart.couponCode,
      taxTotal: Number(cart.taxTotal) || 0,
      total: Number(cart.grandTotal) || 0,
      currency: cart.currencyCode,
      items: cart.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        sku: item.sku,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        thumbnail: item.product?.images?.[0]?.url,
        productSlug: item.product?.slug,
      })),
    }
  }
}
