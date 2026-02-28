import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import { jsonColumn } from '#helpers/json_column'

export default class NotificationTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string | null

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare subject: string | null

  @column()
  declare body: string

  @column()
  declare channel: 'email' | 'sms' | 'push'

  @column(jsonColumn())
  declare variables: string[] | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>
}
