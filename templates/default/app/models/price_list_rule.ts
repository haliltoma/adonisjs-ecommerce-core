import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PriceList from './price_list.js'

export default class PriceListRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare priceListId: string

  @column()
  declare attribute: string

  @column()
  declare operator: 'eq' | 'ne' | 'in' | 'gt' | 'gte' | 'lt' | 'lte'

  @column()
  declare value: unknown

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PriceList)
  declare priceList: BelongsTo<typeof PriceList>
}
