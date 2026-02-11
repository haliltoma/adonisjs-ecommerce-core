import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Region from './region.js'
import Order from './order.js'
import GiftCardTransaction from './gift_card_transaction.js'

export default class GiftCard extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare code: string

  @column()
  declare value: number

  @column()
  declare balance: number

  @column()
  declare currencyCode: string

  @column()
  declare isDisabled: boolean

  @column()
  declare regionId: string | null

  @column()
  declare orderId: string | null

  @column.dateTime()
  declare endsAt: DateTime | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => Region)
  declare region: BelongsTo<typeof Region>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @hasMany(() => GiftCardTransaction)
  declare transactions: HasMany<typeof GiftCardTransaction>
}
