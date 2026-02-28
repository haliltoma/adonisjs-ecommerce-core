import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from './order.js'
import { jsonColumn } from '#helpers/json_column'

export default class OrderTransaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: string

  @column()
  declare type: 'authorization' | 'capture' | 'refund' | 'void'

  @column()
  declare status: 'pending' | 'success' | 'failed'

  @column()
  declare amount: number

  @column()
  declare currencyCode: string

  @column()
  declare paymentMethod: string

  @column()
  declare gatewayTransactionId: string | null

  @column(jsonColumn())
  declare gatewayResponse: Record<string, unknown>

  @column()
  declare errorMessage: string | null

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
}
