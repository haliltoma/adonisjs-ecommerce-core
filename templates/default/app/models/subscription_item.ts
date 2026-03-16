import { DateTime } from 'luxon'
import { column, BaseModel } from '@adonisjs/lucid/orm';
//, column } from 'adonis-lucid-soft-deletes'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Subscription from '#models/subscription'
import Product from '#models/product'

export default class SubscriptionItem extends compose(BaseModel, SoftDeletes) {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare subscriptionId: string

 @column()
 declare productId: string

 @column()
 declare amount: number

 @column()
 declare quantity: number

 @column()
 declare description: string | null

 @column()
 declare metadata: Record<string, any>

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 @column()
 declare deletedAt: DateTime | null

 // Relationships
 async subscription() {
 return await Subscription.findBy('id', this.subscriptionId)
 }

 async product() {
 return await Product.findBy('id', this.productId)
 }

 // Calculate total amount
 getTotalAmount(): number {
 return this.amount * this.quantity
 }
}
