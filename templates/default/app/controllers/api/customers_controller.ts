import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import CustomerAddress from '#models/customer_address'
import { registerValidator, loginValidator, updateProfileValidator } from '#validators/customer_validator'
import emitter from '@adonisjs/core/services/emitter'
import { CustomerRegistered } from '#events/customer_events'

/**
 * CustomersController
 *
 * REST API controller for customer account operations.
 * Handles registration, authentication, profile, and addresses.
 */
export default class CustomersController {
  /**
   * POST /api/customers/register
   * Register a new customer
   */
  async register({ request, response, store }: HttpContext) {
    const storeId = store.id
    const payload = await request.validateUsing(registerValidator)

    // Check if email already exists
    const existing = await Customer.query()
      .where('storeId', storeId)
      .where('email', payload.email)
      .first()

    if (existing) {
      return response.conflict({ error: 'Email already registered' })
    }

    // Hash the password
    const passwordHash = await Customer.hashPassword(payload.password)

    // Create customer
    const customer = await Customer.create({
      storeId,
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      acceptsMarketing: payload.acceptsMarketing || false,
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
      tags: [],
      metadata: {},
    })

    // Emit event
    try {
      await emitter.emit(CustomerRegistered, new CustomerRegistered(customer))
    } catch {
      // Ignore event errors
    }

    return response.created({
      data: this.formatCustomer(customer),
      message: 'Registration successful',
    })
  }

  /**
   * POST /api/customers/login
   * Customer login
   */
  async login({ request, response, store }: HttpContext) {
    const storeId = store.id
    const payload = await request.validateUsing(loginValidator)

    const customer = await Customer.query()
      .where('storeId', storeId)
      .where('email', payload.email)
      .first()

    if (!customer) {
      return response.unauthorized({ error: 'Invalid credentials' })
    }

    const isValid = await customer.verifyPassword(payload.password)
    if (!isValid) {
      return response.unauthorized({ error: 'Invalid credentials' })
    }

    // Check if account is active
    if (customer.status !== 'active') {
      return response.forbidden({ error: 'Account is not active' })
    }

    // Update last activity
    await customer.save()

    // Return customer data (token generation would require proper auth setup)
    return response.json({
      data: {
        customer: this.formatCustomer(customer),
        // Note: Token generation requires auth configuration
        message: 'Login successful',
      },
    })
  }

  /**
   * POST /api/customers/logout
   * Customer logout
   */
  async logout({ response }: HttpContext) {
    return response.json({
      message: 'Logged out successfully',
    })
  }

  /**
   * GET /api/customers/me
   * Get current customer profile
   */
  async me({ response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    // Find customer by user email or ID
    const customer = await Customer.query()
      .where('email', user.email)
      .preload('addresses')
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    return response.json({
      data: this.formatCustomerDetailed(customer),
    })
  }

  /**
   * PATCH /api/customers/me
   * Update customer profile
   */
  async update({ request, response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const payload = await request.validateUsing(updateProfileValidator)

    // Update fields
    if (payload.firstName) customer.firstName = payload.firstName
    if (payload.lastName) customer.lastName = payload.lastName
    if (payload.phone) customer.phone = payload.phone
    if (payload.acceptsMarketing !== undefined) {
      customer.acceptsMarketing = payload.acceptsMarketing
    }

    // Update password if provided
    if (payload.newPassword && payload.currentPassword) {
      const isValid = await customer.verifyPassword(payload.currentPassword)
      if (!isValid) {
        return response.badRequest({ error: 'Current password is incorrect' })
      }
      customer.passwordHash = await Customer.hashPassword(payload.newPassword)
    }

    await customer.save()

    return response.json({
      data: this.formatCustomer(customer),
      message: 'Profile updated',
    })
  }

  /**
   * GET /api/customers/me/addresses
   * Get customer addresses
   */
  async addresses({ response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const addresses = await CustomerAddress.query()
      .where('customerId', customer.id)
      .orderBy('isDefault', 'desc')
      .orderBy('createdAt', 'desc')

    return response.json({
      data: addresses.map((a) => this.formatAddress(a)),
    })
  }

  /**
   * POST /api/customers/me/addresses
   * Add a new address
   */
  async addAddress({ request, response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const payload = request.body()

    // If setting as default, unset other defaults
    if (payload.isDefault) {
      await CustomerAddress.query()
        .where('customerId', customer.id)
        .where('type', payload.type || 'shipping')
        .update({ isDefault: false })
    }

    const address = await CustomerAddress.create({
      customerId: customer.id,
      type: payload.type || 'shipping',
      firstName: payload.firstName,
      lastName: payload.lastName,
      company: payload.company,
      addressLine1: payload.addressLine1 || payload.address1,
      addressLine2: payload.addressLine2 || payload.address2,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      countryCode: payload.countryCode || payload.country,
      phone: payload.phone,
      isDefault: payload.isDefault || false,
    })

    return response.created({
      data: this.formatAddress(address),
      message: 'Address added',
    })
  }

  /**
   * PATCH /api/customers/me/addresses/:id
   * Update an address
   */
  async updateAddress({ params, request, response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const address = await CustomerAddress.query()
      .where('id', params.id)
      .where('customerId', customer.id)
      .first()

    if (!address) {
      return response.notFound({ error: 'Address not found' })
    }

    const payload = request.body()

    // If setting as default, unset other defaults
    if (payload.isDefault && !address.isDefault) {
      await CustomerAddress.query()
        .where('customerId', customer.id)
        .where('type', address.type)
        .whereNot('id', address.id)
        .update({ isDefault: false })
    }

    // Map old field names to new ones
    const updateData: Record<string, unknown> = {}
    if (payload.firstName !== undefined) updateData.firstName = payload.firstName
    if (payload.lastName !== undefined) updateData.lastName = payload.lastName
    if (payload.company !== undefined) updateData.company = payload.company
    if (payload.addressLine1 !== undefined) updateData.addressLine1 = payload.addressLine1
    if (payload.address1 !== undefined) updateData.addressLine1 = payload.address1
    if (payload.addressLine2 !== undefined) updateData.addressLine2 = payload.addressLine2
    if (payload.address2 !== undefined) updateData.addressLine2 = payload.address2
    if (payload.city !== undefined) updateData.city = payload.city
    if (payload.state !== undefined) updateData.state = payload.state
    if (payload.postalCode !== undefined) updateData.postalCode = payload.postalCode
    if (payload.countryCode !== undefined) updateData.countryCode = payload.countryCode
    if (payload.country !== undefined) updateData.countryCode = payload.country
    if (payload.phone !== undefined) updateData.phone = payload.phone
    if (payload.isDefault !== undefined) updateData.isDefault = payload.isDefault
    if (payload.type !== undefined) updateData.type = payload.type

    address.merge(updateData)
    await address.save()

    return response.json({
      data: this.formatAddress(address),
      message: 'Address updated',
    })
  }

  /**
   * DELETE /api/customers/me/addresses/:id
   * Delete an address
   */
  async deleteAddress({ params, response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const address = await CustomerAddress.query()
      .where('id', params.id)
      .where('customerId', customer.id)
      .first()

    if (!address) {
      return response.notFound({ error: 'Address not found' })
    }

    await address.delete()

    return response.json({
      message: 'Address deleted',
    })
  }

  /**
   * GET /api/customers/me/wishlist
   * Get customer wishlist
   */
  async wishlist({ response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const Wishlist = (await import('#models/wishlist')).default
    const WishlistItem = (await import('#models/wishlist_item')).default
    const Product = (await import('#models/product')).default

    // Get or create default wishlist
    let wishlist = await Wishlist.query()
      .where('customerId', customer.id)
      .first()

    if (!wishlist) {
      return response.json({
        data: [],
      })
    }

    const items = await WishlistItem.query()
      .where('wishlistId', wishlist.id)
      .orderBy('createdAt', 'desc')

    const productIds = items.map((item) => item.productId)
    const products = await Product.query()
      .whereIn('id', productIds)
      .preload('images', (q) => q.orderBy('position', 'asc').limit(1))
      .preload('variants', (q) => q.orderBy('position', 'asc').limit(1))

    const productMap = new Map(products.map((p) => [p.id, p]))

    return response.json({
      data: items.map((item) => {
        const product = productMap.get(item.productId)
        return {
          id: item.id,
          product: product
            ? {
                id: product.id,
                name: product.title,
                slug: product.slug,
                price: product.variants?.[0]?.price ?? product.price,
                compareAtPrice: product.variants?.[0]?.compareAtPrice ?? product.compareAtPrice,
                image: product.images?.[0]?.url || null,
              }
            : null,
          addedAt: item.createdAt,
        }
      }),
    })
  }

  /**
   * POST /api/customers/me/wishlist
   * Add product to wishlist
   */
  async addToWishlist({ request, response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const { productId } = request.body()

    const Wishlist = (await import('#models/wishlist')).default
    const WishlistItem = (await import('#models/wishlist_item')).default

    // Get or create default wishlist
    let wishlist = await Wishlist.query()
      .where('customerId', customer.id)
      .first()

    if (!wishlist) {
      wishlist = await Wishlist.create({
        customerId: customer.id,
        name: 'My Wishlist',
        isPublic: false,
      })
    }

    // Check if already in wishlist
    const existing = await WishlistItem.query()
      .where('wishlistId', wishlist.id)
      .where('productId', productId)
      .first()

    if (existing) {
      return response.json({
        message: 'Already in wishlist',
      })
    }

    await WishlistItem.create({
      wishlistId: wishlist.id,
      productId,
    })

    return response.created({
      message: 'Added to wishlist',
    })
  }

  /**
   * DELETE /api/customers/me/wishlist/:productId
   * Remove product from wishlist
   */
  async removeFromWishlist({ params, response, auth }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }

    const customer = await Customer.query()
      .where('email', user.email)
      .first()

    if (!customer) {
      return response.notFound({ error: 'Customer not found' })
    }

    const Wishlist = (await import('#models/wishlist')).default
    const WishlistItem = (await import('#models/wishlist_item')).default

    const wishlist = await Wishlist.query()
      .where('customerId', customer.id)
      .first()

    if (wishlist) {
      await WishlistItem.query()
        .where('wishlistId', wishlist.id)
        .where('productId', params.productId)
        .delete()
    }

    return response.json({
      message: 'Removed from wishlist',
    })
  }

  // Helper methods
  private formatCustomer(customer: Customer) {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`.trim(),
      phone: customer.phone,
      acceptsMarketing: customer.acceptsMarketing,
      createdAt: customer.createdAt,
    }
  }

  private formatCustomerDetailed(customer: Customer) {
    return {
      ...this.formatCustomer(customer),
      orderCount: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      addresses: customer.addresses?.map((a) => this.formatAddress(a)),
      lastOrderAt: customer.lastOrderAt?.toISO(),
    }
  }

  private formatAddress(address: CustomerAddress) {
    return {
      id: address.id,
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      countryCode: address.countryCode,
      phone: address.phone,
      isDefault: address.isDefault,
    }
  }
}
