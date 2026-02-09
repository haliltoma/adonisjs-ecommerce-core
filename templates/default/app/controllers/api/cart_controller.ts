import type { HttpContext } from '@adonisjs/core/http'
import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'
import { discountEngine } from '#helpers/discount_engine'
import { money } from '#helpers/money'

/**
 * CartController
 *
 * REST API controller for shopping cart operations.
 * Handles cart CRUD, line items, and discount code application.
 */
export default class CartController {
  /**
   * GET /api/cart
   * Get current cart
   */
  async show({ response, session, store }: HttpContext) {
    const storeId = store.id
    const cartId = session.get('cart_id')

    if (!cartId) {
      return response.json({
        data: this.emptyCart(),
      })
    }

    const cart = await Cart.query()
      .where('id', cartId)
      .where('storeId', storeId)
      .preload('items', (q) => {
        q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
        q.preload('variant')
      })
      .preload('discount')
      .first()

    if (!cart) {
      session.forget('cart_id')
      return response.json({
        data: this.emptyCart(),
      })
    }

    return response.json({
      data: await this.formatCart(cart),
    })
  }

  /**
   * POST /api/cart/items
   * Add item to cart
   */
  async addItem({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { productId, variantId, quantity = 1 } = request.body()

    // Validate product exists
    const product = await Product.query()
      .where('id', productId)
      .where('storeId', storeId)
      .where('status', 'active')
      .first()

    if (!product) {
      return response.badRequest({ error: 'Product not found' })
    }

    // Validate variant if provided
    let variant: ProductVariant | null = null
    if (variantId) {
      variant = await ProductVariant.query()
        .where('id', variantId)
        .where('productId', productId)
        .where('isActive', true)
        .first()

      if (!variant) {
        return response.badRequest({ error: 'Variant not found' })
      }
    } else if (product.hasVariants) {
      return response.badRequest({ error: 'Variant selection required' })
    }

    // Check inventory
    const itemToCheck = variant || product
    if (itemToCheck.trackInventory && (itemToCheck.stockQuantity || 0) < quantity) {
      return response.badRequest({ error: 'Insufficient stock' })
    }

    // Get or create cart
    let cartId = session.get('cart_id')
    let cart: Cart

    if (cartId) {
      const existingCart = await Cart.find(cartId)
      if (existingCart && existingCart.storeId === storeId) {
        cart = existingCart
      } else {
        cart = await Cart.create({
          storeId,
          currencyCode: 'USD',
        })
        session.put('cart_id', cart.id)
      }
    } else {
      cart = await Cart.create({
        storeId,
        currencyCode: 'USD',
      })
      session.put('cart_id', cart.id)
    }

    // Check if item already in cart
    const existingItem = await CartItem.query()
      .where('cartId', cart.id)
      .where('productId', productId)
      .if(variantId, (q) => q.where('variantId', variantId))
      .if(!variantId, (q) => q.whereNull('variantId'))
      .first()

    const price = variant?.price ?? product.price ?? 0

    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.totalPrice = money.multiply(price, existingItem.quantity)
      await existingItem.save()
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        unitPrice: price,
        totalPrice: money.multiply(price, quantity),
      })
    }

    // Recalculate cart totals
    await this.recalculateCart(cart)

    // Reload cart with relations
    await cart.load('items', (q) => {
      q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
      q.preload('variant')
    })
    await cart.load('discount')

    return response.json({
      data: await this.formatCart(cart),
      message: 'Item added to cart',
    })
  }

  /**
   * PATCH /api/cart/items/:id
   * Update cart item quantity
   */
  async updateItem({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const cartId = session.get('cart_id')
    const { quantity } = request.body()

    if (!cartId) {
      return response.notFound({ error: 'Cart not found' })
    }

    const cart = await Cart.query()
      .where('id', cartId)
      .where('storeId', storeId)
      .first()

    if (!cart) {
      return response.notFound({ error: 'Cart not found' })
    }

    const item = await CartItem.query()
      .where('id', params.id)
      .where('cartId', cart.id)
      .preload('product')
      .preload('variant')
      .first()

    if (!item) {
      return response.notFound({ error: 'Item not found' })
    }

    if (quantity <= 0) {
      await item.delete()
    } else {
      // Check inventory
      const itemToCheck = item.variant || item.product
      if (itemToCheck.trackInventory && (itemToCheck.stockQuantity || 0) < quantity) {
        return response.badRequest({ error: 'Insufficient stock' })
      }

      item.quantity = quantity
      item.totalPrice = money.multiply(item.unitPrice, quantity)
      await item.save()
    }

    // Recalculate cart totals
    await this.recalculateCart(cart)

    // Reload cart
    await cart.load('items', (q) => {
      q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
      q.preload('variant')
    })
    await cart.load('discount')

    return response.json({
      data: await this.formatCart(cart),
      message: 'Cart updated',
    })
  }

  /**
   * DELETE /api/cart/items/:id
   * Remove item from cart
   */
  async removeItem({ params, response, session, store }: HttpContext) {
    const storeId = store.id
    const cartId = session.get('cart_id')

    if (!cartId) {
      return response.notFound({ error: 'Cart not found' })
    }

    const cart = await Cart.query()
      .where('id', cartId)
      .where('storeId', storeId)
      .first()

    if (!cart) {
      return response.notFound({ error: 'Cart not found' })
    }

    const item = await CartItem.query()
      .where('id', params.id)
      .where('cartId', cart.id)
      .first()

    if (!item) {
      return response.notFound({ error: 'Item not found' })
    }

    await item.delete()

    // Recalculate cart totals
    await this.recalculateCart(cart)

    // Reload cart
    await cart.load('items', (q) => {
      q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
      q.preload('variant')
    })
    await cart.load('discount')

    return response.json({
      data: await this.formatCart(cart),
      message: 'Item removed from cart',
    })
  }

  /**
   * DELETE /api/cart
   * Clear entire cart
   */
  async clear({ response, session, store }: HttpContext) {
    const storeId = store.id
    const cartId = session.get('cart_id')

    if (!cartId) {
      return response.json({
        data: this.emptyCart(),
        message: 'Cart cleared',
      })
    }

    const cart = await Cart.query()
      .where('id', cartId)
      .where('storeId', storeId)
      .first()

    if (cart) {
      await CartItem.query().where('cartId', cart.id).delete()
      await this.recalculateCart(cart)
    }

    return response.json({
      data: this.emptyCart(),
      message: 'Cart cleared',
    })
  }

  /**
   * POST /api/cart/discount
   * Apply discount code
   */
  async applyDiscount({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const cartId = session.get('cart_id')
    const { code } = request.body()

    if (!cartId) {
      return response.notFound({ error: 'Cart not found' })
    }

    const cart = await Cart.query()
      .where('id', cartId)
      .where('storeId', storeId)
      .preload('items', (q) => {
        q.preload('product', (pq) => pq.preload('categories'))
      })
      .first()

    if (!cart) {
      return response.notFound({ error: 'Cart not found' })
    }

    // Build discount context
    const items = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId || undefined,
      categoryIds: item.product.categories?.map((c) => c.id) || [],
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }))

    const result = await discountEngine.applyDiscount(code, {
      storeId,
      customerId: cart.customerId || undefined,
      items,
      subtotal: cart.subtotal,
      shippingAmount: cart.shippingTotal,
    })

    if (!result.isValid) {
      return response.badRequest({
        error: result.errors[0] || 'Invalid discount code',
      })
    }

    // Apply discount to cart
    cart.discountId = result.appliedDiscount!.id
    cart.couponCode = result.appliedDiscount!.code
    cart.discountTotal = result.discountAmount
    await cart.save()

    // Recalculate cart totals
    await this.recalculateCart(cart)

    // Reload cart
    await cart.load('items', (q) => {
      q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
      q.preload('variant')
    })
    await cart.load('discount')

    return response.json({
      data: await this.formatCart(cart),
      message: 'Discount applied',
    })
  }

  /**
   * DELETE /api/cart/discount
   * Remove discount code
   */
  async removeDiscount({ response, session, store }: HttpContext) {
    const storeId = store.id
    const cartId = session.get('cart_id')

    if (!cartId) {
      return response.notFound({ error: 'Cart not found' })
    }

    const cart = await Cart.query()
      .where('id', cartId)
      .where('storeId', storeId)
      .first()

    if (!cart) {
      return response.notFound({ error: 'Cart not found' })
    }

    cart.discountId = null
    cart.couponCode = null
    cart.discountTotal = 0
    await cart.save()

    // Recalculate cart totals
    await this.recalculateCart(cart)

    // Reload cart
    await cart.load('items', (q) => {
      q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
      q.preload('variant')
    })

    return response.json({
      data: await this.formatCart(cart),
      message: 'Discount removed',
    })
  }

  // Helper methods
  private async recalculateCart(cart: Cart) {
    const items = await CartItem.query().where('cartId', cart.id)

    const subtotal = items.reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalItems = items.length

    cart.subtotal = subtotal
    cart.totalQuantity = totalQuantity
    cart.totalItems = totalItems
    cart.grandTotal = money.subtract(
      money.add(subtotal, cart.shippingTotal || 0),
      cart.discountTotal || 0
    )
    cart.grandTotal = money.add(cart.grandTotal, cart.taxTotal || 0)

    await cart.save()
  }

  private async formatCart(cart: Cart) {
    return {
      id: cart.id,
      items: cart.items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.title,
        variantName: item.variant?.title,
        sku: item.variant?.sku || item.product.sku,
        price: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        image: item.product.images?.[0]?.url || null,
      })),
      itemCount: cart.totalItems,
      totalQuantity: cart.totalQuantity,
      subtotal: cart.subtotal,
      discountCode: cart.couponCode,
      discountAmount: cart.discountTotal,
      shippingAmount: cart.shippingTotal,
      taxAmount: cart.taxTotal,
      total: cart.grandTotal,
      currency: cart.currencyCode,
    }
  }

  private emptyCart() {
    return {
      id: null,
      items: [],
      itemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      discountCode: null,
      discountAmount: 0,
      shippingAmount: 0,
      taxAmount: 0,
      total: 0,
      currency: 'USD',
    }
  }
}
