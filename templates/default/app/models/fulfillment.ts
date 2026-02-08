import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Order from './order.js'
import FulfillmentItem from './fulfillment_item.js'

export default class Fulfillment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: string

  @column()
  declare trackingNumber: string | null

  @column()
  declare trackingUrl: string | null

  @column()
  declare carrier: string | null

  @column()
  declare carrierName: string | null

  @column()
  declare status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'failed' | 'returned'

  @column.dateTime()
  declare shippedAt: DateTime | null

  @column.dateTime()
  declare deliveredAt: DateTime | null

  @column()
  declare notes: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @hasMany(() => FulfillmentItem)
  declare items: HasMany<typeof FulfillmentItem>
}
