import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Webhook from './webhook.js'

export default class WebhookLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare webhookId: string

  @column()
  declare event: string

  @column()
  declare payload: Record<string, unknown>

  @column()
  declare responseStatus: number | null

  @column()
  declare responseBody: string | null

  @column()
  declare status: 'pending' | 'success' | 'failed'

  @column()
  declare attempts: number

  @column.dateTime()
  declare nextRetryAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Webhook)
  declare webhook: BelongsTo<typeof Webhook>
}
