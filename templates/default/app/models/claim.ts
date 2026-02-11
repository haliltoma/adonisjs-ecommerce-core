import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Order from './order.js'
import ClaimItem from './claim_item.js'

export default class Claim extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare orderId: string

  @column()
  declare type: 'replace' | 'refund'

  @column()
  declare status: 'pending' | 'processing' | 'completed' | 'cancelled'

  @column()
  declare refundAmount: number | null

  @column()
  declare note: string | null

  @column()
  declare internalNote: string | null

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

  @hasMany(() => ClaimItem)
  declare items: HasMany<typeof ClaimItem>
}
