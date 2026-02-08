import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Product from './product.js'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare parentId: string | null

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare imageUrl: string | null

  @column()
  declare position: number

  @column()
  declare depth: number

  @column()
  declare path: string | null

  @column()
  declare isActive: boolean

  @column()
  declare metaTitle: string | null

  @column()
  declare metaDescription: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => Category, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof Category>

  @hasMany(() => Category, { foreignKey: 'parentId' })
  declare children: HasMany<typeof Category>

  @manyToMany(() => Product, {
    pivotTable: 'product_categories',
    pivotColumns: ['position'],
  })
  declare products: ManyToMany<typeof Product>
}
