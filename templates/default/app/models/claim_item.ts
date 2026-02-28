import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Claim from './claim.js'
import OrderItem from './order_item.js'
import { jsonColumn } from '#helpers/json_column'

export default class ClaimItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare claimId: string

  @column()
  declare orderItemId: string

  @column()
  declare quantity: number

  @column()
  declare reason: 'missing_item' | 'wrong_item' | 'production_failure' | 'damaged' | 'other'

  @column()
  declare note: string | null

  @column(jsonColumn())
  declare images: string[]

  @column(jsonColumn())
  declare tags: string[]

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Claim)
  declare claim: BelongsTo<typeof Claim>

  @belongsTo(() => OrderItem)
  declare orderItem: BelongsTo<typeof OrderItem>
}
