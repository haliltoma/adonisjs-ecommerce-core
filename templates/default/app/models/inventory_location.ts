import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import InventoryItem from './inventory_item.js'
import { jsonColumn } from '#helpers/json_column'

export default class InventoryLocation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare name: string

  @column()
  declare code: string

  @column(jsonColumn())
  declare address: Record<string, unknown>

  @column()
  declare isActive: boolean

  @column()
  declare isFulfillmentCenter: boolean

  @column()
  declare priority: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @hasMany(() => InventoryItem, { foreignKey: 'locationId' })
  declare items: HasMany<typeof InventoryItem>
}
