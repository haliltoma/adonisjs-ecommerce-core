import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Locale from './locale.js'

export default class Translation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare localeId: string

  @column()
  declare translatableType: string

  @column()
  declare translatableId: string

  @column()
  declare field: string

  @column()
  declare value: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Locale)
  declare locale: BelongsTo<typeof Locale>
}
