import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import { jsonColumn } from '#helpers/json_column'

export default class SearchLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare query: string

  @column()
  declare resultsCount: number

  @column()
  declare customerId: string | null

  @column()
  declare sessionId: string | null

  @column(jsonColumn())
  declare filters: Record<string, unknown> | null

  @column()
  declare clickedProductId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>
}
