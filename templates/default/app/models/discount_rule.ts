/**
 * Discount Rule Model
 *
 * Defines advanced discount rules like quantity tiers, spend tiers, etc.
 */

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Discount from './discount.js'
import { jsonColumn } from '#helpers/json_column'

export interface QuantityTier {
  minQty: number
  maxQty: number | null
  discountValue: number // percentage (0-100) or fixed amount
}

export interface SpendTier {
  minAmount: number
  maxAmount: number | null
  discountValue: number // percentage (0-100) or fixed amount
}

export interface ProductCombination {
  productIds: string[]
  requiredQty: number
  discountValue: number
}

export default class DiscountRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare discountId: string

  @column()
  declare type: 'quantity_tier' | 'spend_tier' | 'customer_group' | 'product_combination'

  @column(jsonColumn())
  declare quantityTiers: QuantityTier[] | null

  @column(jsonColumn())
  declare spendTiers: SpendTier[] | null

  @column(jsonColumn())
  declare productCombinations: ProductCombination[] | null

  @column(jsonColumn())
  declare customerGroupIds: string[] | null

  @column(jsonColumn())
  declare conditions: Record<string, any> | null

  @column()
  declare priority: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Discount)
  declare discount: BelongsTo<typeof Discount>

  /**
   * Get applicable discount value for quantity tiers
   */
  getQuantityTierDiscount(quantity: number): number | null {
    if (this.type !== 'quantity_tier' || !this.quantityTiers) {
      return null
    }

    // Find the highest tier that matches
    let applicableTier: QuantityTier | null = null

    for (const tier of this.quantityTiers) {
      if (quantity >= tier.minQty) {
        if (!tier.maxQty || quantity <= tier.maxQty) {
          applicableTier = tier
        }
      }
    }

    return applicableTier?.discountValue || null
  }

  /**
   * Get applicable discount value for spend tiers
   */
  getSpendTierDiscount(amount: number): number | null {
    if (this.type !== 'spend_tier' || !this.spendTiers) {
      return null
    }

    // Find the highest tier that matches
    let applicableTier: SpendTier | null = null

    for (const tier of this.spendTiers) {
      if (amount >= tier.minAmount) {
        if (!tier.maxAmount || amount <= tier.maxAmount) {
          applicableTier = tier
        }
      }
    }

    return applicableTier?.discountValue || null
  }

  /**
   * Check if customer group matches
   */
  matchesCustomerGroups(customerGroupIds: string[]): boolean {
    if (this.type !== 'customer_group' || !this.customerGroupIds) {
      return false
    }

    return this.customerGroupIds.some(id => customerGroupIds.includes(id))
  }

  /**
   * Check if product combination matches
   */
  matchesProductCombination(cartProductIds: string[], quantities: Record<string, number>): boolean {
    if (this.type !== 'product_combination' || !this.productCombinations) {
      return false
    }

    return this.productCombinations.some(combination => {
      // Check if all required products are in cart
      const hasAllProducts = combination.productIds.every(id =>
        cartProductIds.includes(id)
      )

      if (!hasAllProducts) {
        return false
      }

      // Check if quantities are met
      return combination.productIds.every(id =>
        (quantities[id] || 0) >= combination.requiredQty
      )
    })
  }
}
