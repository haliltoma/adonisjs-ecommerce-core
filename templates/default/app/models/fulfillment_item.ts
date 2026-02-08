import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Fulfillment from './fulfillment.js'
import OrderItem from './order_item.js'

export default class FulfillmentItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fulfillmentId: string

  @column()
  declare orderItemId: string

  @column()
  declare quantity: number

  @belongsTo(() => Fulfillment)
  declare fulfillment: BelongsTo<typeof Fulfillment>

  @belongsTo(() => OrderItem)
  declare orderItem: BelongsTo<typeof OrderItem>
}
