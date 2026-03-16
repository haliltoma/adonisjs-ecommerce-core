import { DateTime } from 'luxon'
import { column, beforeCreate, BaseModel } from '@adonisjs/lucid/orm';
//, column, beforeCreate } from 'adonis-lucid-soft-deletes'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Product from '#models/product'
import Customer from '#models/customer'
import Order from '#models/order'
import { randomBytes } from 'crypto'

export default class Subscription extends compose(BaseModel, SoftDeletes) {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare subscriptionNumber: string

 @column()
 declare customerId: string

 @column()
 declare productId: string

 @column()
 declare orderId: string | null

 @column()
 declare status: 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due' | 'trialing'

 @column()
 declare billingInterval: 'daily' | 'weekly' | 'monthly' | 'yearly'

 @column()
 declare intervalCount: number

 @column()
 declare amount: number

 @column()
 declare currencyCode: string

 @column()
 declare trialPeriodDays: number | null

 @column.dateTime()
 declare trialEndsAt: DateTime | null

 @column.dateTime()
 declare startsAt: DateTime

 @column.dateTime()
 declare currentPeriodStartsAt: DateTime | null

 @column.dateTime()
 declare currentPeriodEndsAt: DateTime | null

 @column.dateTime()
 declare cancelledAt: DateTime | null

 @column.dateTime()
 declare expiresAt: DateTime | null

 @column()
 declare providerSubscriptionId: string | null

 @column()
 declare providerCustomerId: string | null

 @column()
 declare providerPlanId: string | null

 @column()
 declare metadata: Record<string, any>

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 @column()
 declare deletedAt: DateTime | null

 // Relationships
 async product() {
 return await Product.findBy('id', this.productId)
 }

 async customer() {
 return await Customer.findBy('id', this.customerId)
 }

 async order() {
 return await Order.findBy('id', this.orderId)
 }

 // Generate subscription number before create
 @beforeCreate()
 static async generateSubscriptionNumber(subscription: Subscription) {
 if (!subscription.subscriptionNumber) {
 const randomStr = randomBytes(8).toString('hex').toUpperCase()
 subscription.subscriptionNumber = `SUB-${randomStr}`
 }
 }

 // Check if subscription is active
 isActive(): boolean {
 return this.status === 'active' || this.status === 'trialing'
 }

 // Check if in trial period
 isInTrial(): boolean {
 return this.status === 'trialing' && this.trialEndsAt && this.trialEndsAt > DateTime.now()
 }

 // Get remaining trial days
 get remainingTrialDays(): number | null {
 if (!this.trialEndsAt) return null
 const now = DateTime.now()
 if (this.trialEndsAt <= now) return 0
 return Math.floor(this.trialEndsAt.diff(now, 'days').days)
 }

 // Calculate next billing date
 getNextBillingDate(): DateTime | null {
 if (!this.currentPeriodEndsAt) return null
 return this.currentPeriodEndsAt
 }

 // Pause subscription
 async pause() {
 this.status = 'paused'
 await this.save()
 }

 // Resume subscription
 async resume() {
 if (this.status === 'paused') {
 this.status = 'active'
 await this.save()
 }
 }

 // Cancel subscription
 async cancel() {
 this.status = 'cancelled'
 this.cancelledAt = DateTime.now()
 await this.save()
 }

 // Expire subscription
 async expire() {
 this.status = 'expired'
 this.expiresAt = DateTime.now()
 await this.save()
 }

 // Check if subscription can be paused
 canBePaused(): boolean {
 return this.status === 'active' && !this.trialPeriodDays
 }

 // Check if subscription can be cancelled
 canBeCancelled(): boolean {
 return ['active', 'trialing', 'paused'].includes(this.status)
 }
}
