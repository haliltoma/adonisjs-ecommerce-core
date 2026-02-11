import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PriceList from './price_list.js'
import ProductVariant from './product_variant.js'

export default class PriceListPrice extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare priceListId: string

  @column()
  declare variantId: string

  @column()
  declare amount: number

  @column()
  declare currencyCode: string

  @column()
  declare minQuantity: number | null

  @column()
  declare maxQuantity: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PriceList)
  declare priceList: BelongsTo<typeof PriceList>

  @belongsTo(() => ProductVariant, { foreignKey: 'variantId' })
  declare variant: BelongsTo<typeof ProductVariant>
}
