/**
 * Coupon Model
 *
 * Represents a coupon code that customers can use to claim discounts.
 */

import { DateTime } from 'luxon'
import { column, BaseModel , belongsTo} from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Discount from './discount.js'
import Customer from './customer.js'

export default class Coupon extends BaseModel {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare code: string

 @column()
 declare discountId: string

 @column()
 declare customerId: string | null

 @column()
 declare usageCount: number

 @column.dateTime()
 declare firstUsedAt: DateTime | null

 @column.dateTime()
 declare lastUsedAt: DateTime | null

 @column()
 declare status: 'active' | 'disabled' | 'expired' | 'fully_redeemed'

 @column()
 declare isEnabled: boolean

 @column.dateTime()
 declare expiresAt: DateTime | null

 @column()
 declare recipientEmail: string | null

 @column()
 declare recipientName: string | null

 @column()
 declare message: string | null

 @column()
 declare metadata: Record<string, any> | null

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 @belongsTo(() => Discount)
 declare discount: BelongsTo<typeof Discount>

 @belongsTo(() => Customer)
 declare customer: BelongsTo<typeof Customer>

 /**
 * Check if coupon is expired
 */
 get isExpired(): boolean {
 if (!this.expiresAt) return false
 return DateTime.now() > this.expiresAt
 }

 /**
 * Check if coupon is fully redeemed
 */
 get isFullyRedeemed(): boolean {
 const discount = this.$extras.discount as Discount | undefined
 if (!discount) return false

 const usageLimit = discount.usageLimitPerCustomer || discount.usageLimit
 return usageLimit !== null && this.usageCount >= usageLimit
 }

 /**
 * Check if coupon can be used
 */
 get canBeUsed(): boolean {
 return this.isEnabled &&
 this.status === 'active' &&
 !this.isExpired &&
 !this.isFullyRedeemed
 }

 /**
 * Increment usage count
 */
 async incrementUsage(): Promise<void> {
 this.usageCount++
 this.lastUsedAt = DateTime.now()

 if (!this.firstUsedAt) {
 this.firstUsedAt = DateTime.now()
 }

 await this.save()

 // Check if fully redeemed
 if (this.isFullyRedeemed) {
 this.status = 'fully_redeemed'
 await this.save()
 }
 }

 /**
 * Mark as disabled
 */
 async disable(): Promise<void> {
 this.isEnabled = false
 this.status = 'disabled'
 await this.save()
 }
}
