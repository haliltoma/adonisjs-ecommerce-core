import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import PriceListRule from './price_list_rule.js'
import PriceListPrice from './price_list_price.js'
import { jsonColumn } from '#helpers/json_column'

export default class PriceList extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare type: 'sale' | 'override'

  @column()
  declare status: 'active' | 'draft' | 'expired'

  @column.dateTime()
  declare startsAt: DateTime | null

  @column.dateTime()
  declare endsAt: DateTime | null

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @hasMany(() => PriceListRule)
  declare rules: HasMany<typeof PriceListRule>

  @hasMany(() => PriceListPrice)
  declare prices: HasMany<typeof PriceListPrice>
}
