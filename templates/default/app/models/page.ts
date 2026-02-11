import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class Page extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare content: Record<string, unknown> | null

  @column()
  declare template: string

  @column()
  declare status: 'draft' | 'published'

  @column()
  declare isSystem: boolean

  @column()
  declare metaTitle: string | null

  @column()
  declare metaDescription: string | null

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>
}
