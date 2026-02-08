import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Wishlist from './wishlist.js'
import Product from './product.js'
import ProductVariant from './product_variant.js'

export default class WishlistItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare wishlistId: string

  @column()
  declare productId: string

  @column()
  declare variantId: string | null

  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Wishlist)
  declare wishlist: BelongsTo<typeof Wishlist>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductVariant, { foreignKey: 'variantId' })
  declare variant: BelongsTo<typeof ProductVariant>
}
