import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { jsonColumn } from '#helpers/json_column'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: number | null

  @column()
  declare type: string

  @column()
  declare title: string

  @column()
  declare message: string

  @column(jsonColumn())
  declare data: Record<string, unknown> | null

  @column()
  declare channel: 'database' | 'email' | 'sms' | 'push'

  @column()
  declare isRead: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
