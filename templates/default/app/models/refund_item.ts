import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Refund from './refund.js'
import OrderItem from './order_item.js'

export default class RefundItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare refundId: string

  @column()
  declare orderItemId: string

  @column()
  declare quantity: number

  @column()
  declare amount: number

  @column()
  declare restock: boolean

  @belongsTo(() => Refund)
  declare refund: BelongsTo<typeof Refund>

  @belongsTo(() => OrderItem)
  declare orderItem: BelongsTo<typeof OrderItem>
}
