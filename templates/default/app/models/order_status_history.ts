import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from './order.js'
import User from './user.js'
import { jsonColumn } from '#helpers/json_column'

export default class OrderStatusHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: string

  @column()
  declare status: string

  @column()
  declare previousStatus: string | null

  @column()
  declare type: 'status_change' | 'note' | 'payment' | 'fulfillment' | 'refund' | 'system'

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare userId: number | null

  @column()
  declare isCustomerNotified: boolean

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
