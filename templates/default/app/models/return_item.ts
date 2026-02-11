import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Return from './return.js'
import OrderItem from './order_item.js'
import ReturnReason from './return_reason.js'

export default class ReturnItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare returnId: string

  @column()
  declare orderItemId: string

  @column()
  declare returnReasonId: string | null

  @column()
  declare quantity: number

  @column()
  declare receivedQuantity: number

  @column()
  declare note: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Return)
  declare return: BelongsTo<typeof Return>

  @belongsTo(() => OrderItem)
  declare orderItem: BelongsTo<typeof OrderItem>

  @belongsTo(() => ReturnReason)
  declare reason: BelongsTo<typeof ReturnReason>
}
