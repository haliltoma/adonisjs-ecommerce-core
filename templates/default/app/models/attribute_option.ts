import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Attribute from './attribute.js'

export default class AttributeOption extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare attributeId: string

  @column()
  declare label: string

  @column()
  declare value: string

  @column()
  declare sortOrder: number

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Attribute)
  declare attribute: BelongsTo<typeof Attribute>
}
