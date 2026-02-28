import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import hash from '@adonisjs/core/services/hash'
import Store from './store.js'
import CustomerAddress from './customer_address.js'
import Order from './order.js'
import Cart from './cart.js'
import Wishlist from './wishlist.js'
import Review from './review.js'
import CustomerGroup from './customer_group.js'
import { jsonColumn } from '#helpers/json_column'

export default class Customer extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare passwordHash: string | null

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare phone: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare status: 'active' | 'disabled' | 'banned'

  @column()
  declare acceptsMarketing: boolean

  @column()
  declare totalOrders: number

  @column()
  declare totalSpent: number

  @column.dateTime()
  declare lastOrderAt: DateTime | null

  @column(jsonColumn())
  declare tags: string[]

  @column()
  declare notes: string | null

  @column()
  declare groupId: string | null

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column()
  declare oauthProvider: string | null

  @column()
  declare oauthProviderId: string | null

  @column()
  declare oauthAvatarUrl: string | null

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @hasMany(() => CustomerAddress)
  declare addresses: HasMany<typeof CustomerAddress>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @hasMany(() => Cart)
  declare carts: HasMany<typeof Cart>

  @hasMany(() => Wishlist)
  declare wishlists: HasMany<typeof Wishlist>

  @hasMany(() => Review)
  declare reviews: HasMany<typeof Review>

  @belongsTo(() => CustomerGroup, { foreignKey: 'groupId' })
  declare group: BelongsTo<typeof CustomerGroup>

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    if (!this.passwordHash) return false
    return hash.verify(this.passwordHash, plainPassword)
  }

  static async hashPassword(password: string): Promise<string> {
    return hash.make(password)
  }
}
