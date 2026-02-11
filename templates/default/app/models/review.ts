import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from './product.js'
import Customer from './customer.js'

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare productId: string

  @column()
  declare customerId: string

  @column()
  declare rating: number

  @column()
  declare title: string | null

  @column()
  declare content: string | null

  @column()
  declare isVerifiedPurchase: boolean

  @column()
  declare status: 'pending' | 'approved' | 'rejected'

  @column()
  declare helpfulCount: number

  @column()
  declare reportCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>
}
