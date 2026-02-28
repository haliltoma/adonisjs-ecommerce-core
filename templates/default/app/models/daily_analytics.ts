import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import { jsonColumn } from '#helpers/json_column'

export default class DailyAnalytics extends BaseModel {
  static table = 'daily_analytics'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare storeId: string

  @column.date()
  declare date: DateTime

  @column()
  declare pageViews: number

  @column()
  declare uniqueVisitors: number

  @column()
  declare totalOrders: number

  @column()
  declare totalRevenue: number

  @column()
  declare averageOrderValue: number

  @column()
  declare conversionRate: number

  @column()
  declare cartAbandonment: number

  @column()
  declare newCustomers: number

  @column()
  declare returningCustomers: number

  @column(jsonColumn())
  declare topProducts: Record<string, unknown>[] | null

  @column(jsonColumn())
  declare topCategories: Record<string, unknown>[] | null

  @column(jsonColumn())
  declare trafficSources: Record<string, number> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>
}
