import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class Discount extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare name: string

  @column()
  declare code: string

  @column()
  declare type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'

  @column()
  declare value: number

  @column()
  declare appliesTo: 'all' | 'specific_products' | 'specific_categories'

  @column()
  declare productIds: string[] | null

  @column()
  declare categoryIds: string[] | null

  @column()
  declare customerIds: string[] | null

  @column()
  declare minimumOrderAmount: number | null

  @column()
  declare maximumOrderAmount: number | null

  @column()
  declare minimumQuantity: number | null

  @column()
  declare maximumDiscountAmount: number | null

  @column()
  declare usageLimit: number | null

  @column()
  declare usageLimitPerCustomer: number | null

  @column()
  declare usageCount: number

  @column()
  declare isActive: boolean

  @column()
  declare isPublic: boolean

  @column()
  declare firstOrderOnly: boolean

  @column.dateTime()
  declare startsAt: DateTime | null

  @column.dateTime()
  declare endsAt: DateTime | null

  // Buy X Get Y specific fields
  @column()
  declare buyQuantity: number | null

  @column()
  declare getQuantity: number | null

  @column()
  declare getDiscountPercentage: number | null

  @column()
  declare isAutomatic: boolean

  @column()
  declare priority: number

  @column()
  declare isCombinable: boolean

  // Campaign budget fields
  @column()
  declare campaignName: string | null

  @column()
  declare budgetType: 'spend' | 'usage' | null

  @column()
  declare budgetLimit: number | null

  @column()
  declare budgetUsed: number

  // Additional targeting
  @column()
  declare customerGroupIds: string[] | null

  @column()
  declare regionIds: string[] | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>
}
