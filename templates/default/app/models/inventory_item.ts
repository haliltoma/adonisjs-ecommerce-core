import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ProductVariant from './product_variant.js'
import InventoryLocation from './inventory_location.js'

export default class InventoryItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare variantId: string

  @column()
  declare locationId: string

  @column()
  declare quantity: number

  @column()
  declare reservedQuantity: number

  @column()
  declare availableQuantity: number

  @column()
  declare reorderPoint: number | null

  @column()
  declare reorderQuantity: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ProductVariant, { foreignKey: 'variantId' })
  declare variant: BelongsTo<typeof ProductVariant>

  @belongsTo(() => InventoryLocation, { foreignKey: 'locationId' })
  declare location: BelongsTo<typeof InventoryLocation>
}
