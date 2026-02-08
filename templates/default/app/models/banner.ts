import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class Banner extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare title: string

  @column()
  declare subtitle: string | null

  @column()
  declare imageUrl: string

  @column()
  declare mobileImageUrl: string | null

  @column()
  declare linkUrl: string | null

  @column()
  declare linkTarget: '_self' | '_blank'

  @column()
  declare position: string | null

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare startsAt: DateTime | null

  @column.dateTime()
  declare endsAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>
}
