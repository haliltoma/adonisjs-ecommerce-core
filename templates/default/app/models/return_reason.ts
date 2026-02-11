import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class ReturnReason extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare parentId: string | null

  @column()
  declare value: string

  @column()
  declare label: string

  @column()
  declare description: string | null

  @column()
  declare sortOrder: number

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => ReturnReason, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof ReturnReason>

  @hasMany(() => ReturnReason, { foreignKey: 'parentId' })
  declare children: HasMany<typeof ReturnReason>
}
