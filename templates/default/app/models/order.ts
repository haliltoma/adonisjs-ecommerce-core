import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Customer from './customer.js'
import Discount from './discount.js'
import OrderItem from './order_item.js'
import OrderTransaction from './order_transaction.js'
import OrderStatusHistory from './order_status_history.js'
import Fulfillment from './fulfillment.js'
import Refund from './refund.js'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare orderNumber: string

  @column()
  declare customerId: string | null

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded'

  @column()
  declare paymentStatus: 'pending' | 'authorized' | 'paid' | 'partially_refunded' | 'refunded' | 'failed' | 'voided'

  @column()
  declare fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned' | 'partially_returned'

  @column()
  declare currencyCode: string

  @column()
  declare subtotal: number

  @column()
  declare discountTotal: number

  @column()
  declare taxTotal: number

  @column()
  declare shippingTotal: number

  @column()
  declare grandTotal: number

  @column()
  declare totalPaid: number

  @column()
  declare totalRefunded: number

  @column()
  declare couponCode: string | null

  @column()
  declare discountId: string | null

  @column()
  declare billingAddress: Record<string, unknown>

  @column()
  declare shippingAddress: Record<string, unknown>

  @column()
  declare shippingMethod: string | null

  @column()
  declare shippingMethodTitle: string | null

  @column()
  declare paymentMethod: string | null

  @column()
  declare paymentMethodTitle: string | null

  @column()
  declare notes: string | null

  @column()
  declare internalNotes: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column.dateTime()
  declare cancelledAt: DateTime | null

  @column()
  declare cancelReason: string | null

  @column.dateTime()
  declare placedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Discount)
  declare discount: BelongsTo<typeof Discount>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @hasMany(() => OrderTransaction)
  declare transactions: HasMany<typeof OrderTransaction>

  @hasMany(() => OrderStatusHistory)
  declare statusHistory: HasMany<typeof OrderStatusHistory>

  @hasMany(() => Fulfillment)
  declare fulfillments: HasMany<typeof Fulfillment>

  @hasMany(() => Refund)
  declare refunds: HasMany<typeof Refund>
}
