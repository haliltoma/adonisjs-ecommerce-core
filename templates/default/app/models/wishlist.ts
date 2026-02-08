import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'
import WishlistItem from './wishlist_item.js'

export default class Wishlist extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare customerId: string

  @column()
  declare name: string

  @column()
  declare isPublic: boolean

  @column()
  declare shareToken: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @hasMany(() => WishlistItem)
  declare items: HasMany<typeof WishlistItem>
}
