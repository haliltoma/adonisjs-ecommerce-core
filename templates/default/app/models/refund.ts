import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Order from './order.js'
import User from './user.js'
import RefundItem from './refund_item.js'

export default class Refund extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: string

  @column()
  declare amount: number

  @column()
  declare reason: string | null

  @column()
  declare notes: string | null

  @column()
  declare status: 'pending' | 'processed' | 'failed'

  @column()
  declare refundedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User, { foreignKey: 'refundedBy' })
  declare refundedByUser: BelongsTo<typeof User>

  @hasMany(() => RefundItem)
  declare items: HasMany<typeof RefundItem>
}
