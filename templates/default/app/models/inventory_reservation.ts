import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import ProductVariant from './product_variant.js'
import InventoryLocation from './inventory_location.js'
import { jsonColumn } from '#helpers/json_column'

export default class InventoryReservation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare variantId: string

  @column()
  declare locationId: string | null

  @column()
  declare lineItemId: string | null

  @column()
  declare type: 'order' | 'cart' | 'transfer'

  @column()
  declare quantity: number

  @column()
  declare description: string | null

  @column()
  declare createdBy: string | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => ProductVariant, { foreignKey: 'variantId' })
  declare variant: BelongsTo<typeof ProductVariant>

  @belongsTo(() => InventoryLocation, { foreignKey: 'locationId' })
  declare location: BelongsTo<typeof InventoryLocation>
}
