import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import ProductVariant from './product_variant.js'
import ProductOption from './product_option.js'
import ProductImage from './product_image.js'
import Category from './category.js'
import Tag from './tag.js'
import TaxClass from './tax_class.js'
import Review from './review.js'
import Collection from './collection.js'
import ProductAttributeValue from './product_attribute_value.js'
import SalesChannel from './sales_channel.js'
import ShippingProfile from './shipping_profile.js'
import { jsonColumn } from '#helpers/json_column'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare shortDescription: string | null

  @column()
  declare status: 'draft' | 'active' | 'archived'

  @column()
  declare type: 'simple' | 'variable' | 'digital' | 'bundle' | 'subscription'

  @column()
  declare vendor: string | null

  @column()
  declare sku: string | null

  @column()
  declare barcode: string | null

  @column()
  declare price: number | null

  @column()
  declare compareAtPrice: number | null

  @column()
  declare costPrice: number | null

  @column()
  declare isTaxable: boolean

  @column()
  declare taxClassId: string | null

  @column()
  declare shippingProfileId: string | null

  @column()
  declare weight: number | null

  @column()
  declare weightUnit: 'g' | 'kg' | 'lb' | 'oz'

  @column()
  declare requiresShipping: boolean

  @column()
  declare trackInventory: boolean

  @column()
  declare stockQuantity: number

  @column()
  declare hasVariants: boolean

  @column()
  declare isFeatured: boolean

  @column()
  declare sortOrder: number

  @column()
  declare metaTitle: string | null

  @column()
  declare metaDescription: string | null

  @column()
  declare metaKeywords: string | null

  @column(jsonColumn())
  declare customFields: Record<string, unknown>

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => TaxClass)
  declare taxClass: BelongsTo<typeof TaxClass>

  @hasMany(() => ProductVariant)
  declare variants: HasMany<typeof ProductVariant>

  @hasMany(() => ProductOption)
  declare options: HasMany<typeof ProductOption>

  @hasMany(() => ProductImage)
  declare images: HasMany<typeof ProductImage>

  @manyToMany(() => Category, {
    pivotTable: 'product_categories',
    pivotColumns: ['position'],
  })
  declare categories: ManyToMany<typeof Category>

  @manyToMany(() => Tag, {
    pivotTable: 'product_tags',
  })
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => Review)
  declare reviews: HasMany<typeof Review>

  @hasMany(() => ProductAttributeValue)
  declare attributeValues: HasMany<typeof ProductAttributeValue>

  @manyToMany(() => Collection, {
    pivotTable: 'collection_products',
    pivotColumns: ['sort_order'],
  })
  declare collections: ManyToMany<typeof Collection>

  @manyToMany(() => SalesChannel, {
    pivotTable: 'product_sales_channels',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare salesChannels: ManyToMany<typeof SalesChannel>

  @belongsTo(() => ShippingProfile)
  declare shippingProfile: BelongsTo<typeof ShippingProfile>

  // Alias for backward compatibility
  get name(): string {
    return this.title
  }

  get isOnSale(): boolean {
    return this.compareAtPrice !== null && this.price !== null && this.compareAtPrice > this.price
  }

  get discountPercentage(): number | null {
    if (!this.isOnSale || !this.compareAtPrice || !this.price) return null
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100)
  }
}
