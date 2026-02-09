import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Product from './product.js'
import ProductImage from './product_image.js'
import InventoryItem from './inventory_item.js'

export default class ProductVariant extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare productId: string

  @column()
  declare title: string

  @column()
  declare sku: string

  @column()
  declare barcode: string | null

  @column()
  declare price: number

  @column()
  declare compareAtPrice: number | null

  @column()
  declare costPrice: number | null

  @column()
  declare weight: number | null

  @column({ columnName: 'option_1' })
  declare option1: string | null

  @column({ columnName: 'option_2' })
  declare option2: string | null

  @column({ columnName: 'option_3' })
  declare option3: string | null

  @column()
  declare imageId: string | null

  @column()
  declare position: number

  @column()
  declare isActive: boolean

  @column()
  declare inventoryQuantity: number

  @column()
  declare stockQuantity: number

  @column()
  declare trackInventory: boolean

  @column()
  declare allowBackorder: boolean

  @column()
  declare requiresShipping: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductImage, { foreignKey: 'imageId' })
  declare image: BelongsTo<typeof ProductImage>

  @hasMany(() => InventoryItem, { foreignKey: 'variantId' })
  declare inventoryItems: HasMany<typeof InventoryItem>

  // Alias for backward compatibility
  get name(): string {
    return this.title
  }
}
