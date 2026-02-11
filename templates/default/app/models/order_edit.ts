import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Order from './order.js'
import User from './user.js'

export default class OrderEdit extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare orderId: string

  @column()
  declare createdBy: string | null

  @column()
  declare status: 'created' | 'requested' | 'confirmed' | 'declined' | 'cancelled'

  @column()
  declare internalNote: string | null

  @column()
  declare differenceAmount: number

  @column()
  declare changes: Record<string, unknown>[]

  @column.dateTime()
  declare requestedAt: DateTime | null

  @column.dateTime()
  declare confirmedAt: DateTime | null

  @column.dateTime()
  declare declinedAt: DateTime | null

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

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>
}
