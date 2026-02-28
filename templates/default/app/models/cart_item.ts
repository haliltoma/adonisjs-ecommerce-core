import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Cart from './cart.js'
import Product from './product.js'
import ProductVariant from './product_variant.js'
import { jsonColumn } from '#helpers/json_column'

export default class CartItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare cartId: string

  @column()
  declare productId: string

  @column()
  declare variantId: string | null

  @column()
  declare sku: string

  @column()
  declare title: string

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
  declare weight: number | null

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Cart)
  declare cart: BelongsTo<typeof Cart>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductVariant, { foreignKey: 'variantId' })
  declare variant: BelongsTo<typeof ProductVariant>
}
