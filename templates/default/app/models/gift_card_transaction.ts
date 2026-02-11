import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GiftCard from './gift_card.js'
import Order from './order.js'

export default class GiftCardTransaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare giftCardId: string

  @column()
  declare orderId: string | null

  @column()
  declare amount: number

  @column()
  declare type: 'usage' | 'refund' | 'adjustment'

  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => GiftCard)
  declare giftCard: BelongsTo<typeof GiftCard>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
}
