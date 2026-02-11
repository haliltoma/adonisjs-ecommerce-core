import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Claim from './claim.js'
import OrderItem from './order_item.js'

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

  @column()
  declare images: string[]

  @column()
  declare tags: string[]

  @column()
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
