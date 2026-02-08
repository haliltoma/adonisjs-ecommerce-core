import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from './order.js'
import Product from './product.js'
import ProductVariant from './product_variant.js'

export default class OrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: string

  @column()
  declare productId: string

  @column()
  declare variantId: string | null

  @column()
  declare sku: string

  @column()
  declare title: string

  @column()
  declare variantTitle: string | null

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare totalPrice: number

  @column()
  declare discountAmount: number

  @column()
  declare taxAmount: number

  @column()
  declare taxRate: number

  @column()
  declare weight: number | null

  @column()
  declare fulfilledQuantity: number

  @column()
  declare returnedQuantity: number

  @column()
  declare thumbnailUrl: string | null

  @column()
  declare properties: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductVariant, { foreignKey: 'variantId' })
  declare variant: BelongsTo<typeof ProductVariant>
}
