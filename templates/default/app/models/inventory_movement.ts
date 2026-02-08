import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import InventoryItem from './inventory_item.js'
import User from './user.js'

export default class InventoryMovement extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare inventoryItemId: string

  @column()
  declare type: 'received' | 'sold' | 'returned' | 'adjusted' | 'transferred' | 'reserved' | 'released'

  @column()
  declare quantity: number

  @column()
  declare referenceType: string | null

  @column()
  declare referenceId: string | null

  @column()
  declare reason: string | null

  @column()
  declare userId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => InventoryItem)
  declare inventoryItem: BelongsTo<typeof InventoryItem>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
