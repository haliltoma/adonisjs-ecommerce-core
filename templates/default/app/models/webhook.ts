import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import WebhookLog from './webhook_log.js'
import { jsonColumn } from '#helpers/json_column'

export default class Webhook extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare name: string

  @column()
  declare url: string

  @column(jsonColumn())
  declare events: string[]

  @column({ serializeAs: null })
  declare secret: string | null

  @column(jsonColumn())
  declare headers: Record<string, string> | null

  @column()
  declare isActive: boolean

  @column()
  declare retryCount: number

  @column.dateTime()
  declare lastTriggeredAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @hasMany(() => WebhookLog)
  declare logs: HasMany<typeof WebhookLog>
}
