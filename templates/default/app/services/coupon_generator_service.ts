/**
 * Coupon Generator Service
 *
 * Generates unique coupon codes and manages bulk coupon creation.
 */

import { randomBytes } from 'node:crypto'
import Coupon from '#models/coupon'
import Discount from '#models/discount'
import { DateTime } from 'luxon'

export interface BulkCouponOptions {
  discountId: string
  quantity: number
  prefix?: string
  length?: number
  expiresAfter?: DateTime // Duration from now
  recipientEmails?: string[]
  recipientNames?: string[]
  message?: string
}

export interface GeneratedCoupon {
  code: string
  couponId: string
  expiresAt: DateTime | null
}

export default class CouponGenerator {
  private static instance: CouponGenerator

  private constructor() {}

  static getInstance(): CouponGenerator {
    if (!CouponGenerator.instance) {
      CouponGenerator.instance = new CouponGenerator()
    }
    return CouponGenerator.instance
  }

  /**
   * Generate a random coupon code
   */
  generateCode(length: number = 8, prefix: string = ''): string {
    const random = randomBytes(Math.ceil(length / 2))
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, length)

    return `${prefix}${random}`.substring(0, length)
  }

  /**
   * Generate unique coupon code (ensures no collision)
   */
  async generateUniqueCode(
    length: number = 8,
    prefix: string = '',
    maxAttempts: number = 10
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const code = this.generateCode(length, prefix)

      // Check if code exists
      const existing = await Coupon.query().where('code', code).first()

      if (!existing) {
        return code
      }
    }

    throw new Error('Failed to generate unique code after multiple attempts')
  }

  /**
   * Generate bulk coupons
   */
  async generateBulkCoupons(
    options: BulkCouponOptions
  ): Promise<{
    coupons: GeneratedCoupon[]
    failed: string[]
  }> {
    const { discountId, quantity, prefix = '', length = 8, expiresAfter, recipientEmails, recipientNames, message } = options

    // Verify discount exists
    const discount = await Discount.find(discountId)
    if (!discount) {
      throw new Error('Discount not found')
    }

    const coupons: GeneratedCoupon[] = []
    const failed: string[] = []

    // Calculate expiry date
    let expiresAt: DateTime | null = null
    if (expiresAfter) {
      expiresAt = DateTime.now().plus(expiresAfter)
    }

    // Generate coupons
    for (let i = 0; i < quantity; i++) {
      try {
        const code = await this.generateUniqueCode(length, prefix)

        const coupon = await Coupon.create({
          code,
          discountId,
          customerId: null,
          usageCount: 0,
          status: 'active',
          isEnabled: true,
          expiresAt,
          recipientEmail: recipientEmails?.[i] || null,
          recipientName: recipientNames?.[i] || null,
          message: message || null,
        })

        coupons.push({
          code,
          couponId: coupon.id,
          expiresAt: coupon.expiresAt,
        })
      } catch (error) {
        failed.push(`Coupon ${i + 1}: ${(error as Error).message}`)
      }
    }

    return { coupons, failed }
  }

  /**
   * Generate personalized coupon for a customer
   */
  async generatePersonalizedCoupon(options: {
    discountId: string
    customerId: string
    recipientEmail: string
    recipientName?: string
    message?: string
    expiresIn?: { number: number; unit: 'days' | 'weeks' | 'months' }
    prefix?: string
  }): Promise<{
    code: string
    couponId: string
    expiresAt: DateTime | null
  }> {
    const { discountId, customerId, recipientEmail, recipientName, message, expiresIn, prefix = 'PERSONAL' } = options

    // Verify discount exists
    const discount = await Discount.find(discountId)
    if (!discount) {
      throw new Error('Discount not found')
    }

    // Calculate expiry
    let expiresAt: DateTime | null = null
    if (expiresIn) {
      expiresAt = DateTime.now().plus(expiresIn)
    }

    // Generate code
    const code = await this.generateUniqueCode(12, prefix)

    // Create coupon
    const coupon = await Coupon.create({
      code,
      discountId,
      customerId,
      usageCount: 0,
      status: 'active',
      isEnabled: true,
      expiresAt,
      recipientEmail,
      recipientName: recipientName || null,
      message: message || null,
    })

    return {
      code,
      couponId: coupon.id,
      expiresAt: coupon.expiresAt,
    }
  }

  /**
   * Generate gift card coupon
   */
  async generateGiftCardCoupon(options: {
    storeId: string
    amount: number
    currency?: string
    recipientEmail: string
    recipientName?: string
    message?: string
    expiresIn?: { number: number; unit: 'days' | 'weeks' | 'months' }
    prefix?: string
  }): Promise<{
    code: string
    couponId: string
    discountId: string
    expiresAt: DateTime | null
  }> {
    const { storeId, amount, currency = 'USD', recipientEmail, recipientName, message, expiresIn, prefix = 'GIFT' } = options

    // Create discount for gift card
    const discount = await Discount.create({
      storeId,
      name: `Gift Card ${amount} ${currency}`,
      code: prefix, // Will be replaced with unique code
      type: 'fixed_amount',
      value: amount,
      isActive: true,
      isPublic: false,
      usageLimitPerCustomer: 1,
      expiresAt: expiresIn ? DateTime.now().plus(expiresIn) : null,
    })

    // Generate personalized coupon
    const result = await this.generatePersonalizedCoupon({
      discountId: discount.id,
      customerId: '', // TODO: guest checkout
      recipientEmail,
      recipientName,
      message,
      expiresIn,
      prefix,
    })

    return {
      ...result,
      discountId: discount.id,
    }
  }

  /**
   * Validate coupon code format
   */
  validateCodeFormat(code: string): boolean {
    // Code should be alphanumeric, 4-16 characters
    return /^[A-Z0-9]{4,16}$/.test(code)
  }

  /**
   * Generate codes for A/B testing
   */
  async generateABTestCodes(
    options: {
      baseCode: string
      variants: number
      discountId: string
      expiresAfter?: { number: number; unit: 'days' | 'weeks' }
    }
  ): Promise<string[]> {
    const codes: string[] = []

    for (let i = 0; i < options.variants; i++) {
      const code = `${options.baseCode}-${i + 1}`

      // Create coupon for each variant
      await Coupon.create({
        code,
        discountId: options.discountId,
        customerId: null,
        status: 'active',
        isEnabled: true,
        expiresAt: options.expiresAfter
          ? DateTime.now().plus(options.expiresAfter)
          : null,
      })

      codes.push(code)
    }

    return codes
  }
}

/**
 * Export singleton instance
 */
export const couponGenerator = CouponGenerator.getInstance()
