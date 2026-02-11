import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Product from './product.js'

export default class SalesChannel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare isActive: boolean

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @manyToMany(() => Product, {
    pivotTable: 'product_sales_channels',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare products: ManyToMany<typeof Product>
}
