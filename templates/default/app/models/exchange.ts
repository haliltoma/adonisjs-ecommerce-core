import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Order from './order.js'
import Return from './return.js'
import { jsonColumn } from '#helpers/json_column'

export default class Exchange extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare orderId: string

  @column()
  declare returnId: string | null

  @column()
  declare status: 'pending' | 'completed' | 'cancelled'

  @column()
  declare differenceAmount: number

  @column()
  declare paymentStatus: 'not_paid' | 'paid' | 'refunded'

  @column()
  declare note: string | null

  @column(jsonColumn())
  declare newItems: Record<string, unknown>[]

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => Return)
  declare linkedReturn: BelongsTo<typeof Return>
}
