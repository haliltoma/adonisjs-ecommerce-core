import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class AnalyticsEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare sessionId: string | null

  @column()
  declare customerId: string | null

  @column()
  declare eventType: string

  @column()
  declare eventData: Record<string, unknown> | null

  @column()
  declare pageUrl: string | null

  @column()
  declare referrer: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare ipAddress: string | null

  @column()
  declare country: string | null

  @column()
  declare city: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>
}
