import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import AttributeOption from './attribute_option.js'

export default class Attribute extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare name: string

  @column()
  declare code: string

  @column()
  declare type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'color'

  @column()
  declare isRequired: boolean

  @column()
  declare isFilterable: boolean

  @column()
  declare isSearchable: boolean

  @column()
  declare isVisibleOnFront: boolean

  @column()
  declare sortOrder: number

  @column()
  declare validationRules: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @hasMany(() => AttributeOption)
  declare options: HasMany<typeof AttributeOption>
}
