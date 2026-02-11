import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Order from './order.js'
import ReturnItem from './return_item.js'

export default class Return extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare orderId: string

  @column()
  declare status: 'requested' | 'received' | 'requires_action' | 'completed' | 'cancelled'

  @column()
  declare refundAmount: number | null

  @column()
  declare shippingMethod: string | null

  @column()
  declare trackingNumber: string | null

  @column()
  declare note: string | null

  @column()
  declare internalNote: string | null

  @column()
  declare receivedBy: string | null

  @column.dateTime()
  declare receivedAt: DateTime | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @hasMany(() => ReturnItem)
  declare items: HasMany<typeof ReturnItem>
}
