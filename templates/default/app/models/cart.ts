import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Customer from './customer.js'
import Discount from './discount.js'
import CustomerAddress from './customer_address.js'
import CartItem from './cart_item.js'

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare customerId: string | null

  @column()
  declare sessionId: string | null

  @column()
  declare email: string | null

  @column()
  declare currencyCode: string

  @column()
  declare subtotal: number

  @column()
  declare discountTotal: number

  @column()
  declare taxTotal: number

  @column()
  declare shippingTotal: number

  @column()
  declare grandTotal: number

  @column()
  declare totalItems: number

  @column()
  declare totalQuantity: number

  @column()
  declare couponCode: string | null

  @column()
  declare discountId: string | null

  @column()
  declare billingAddressId: string | null

  @column()
  declare shippingAddressId: string | null

  @column()
  declare shippingMethod: string | null

  @column()
  declare paymentMethod: string | null

  @column()
  declare notes: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Discount)
  declare discount: BelongsTo<typeof Discount>

  @belongsTo(() => CustomerAddress, { foreignKey: 'billingAddressId' })
  declare billingAddress: BelongsTo<typeof CustomerAddress>

  @belongsTo(() => CustomerAddress, { foreignKey: 'shippingAddressId' })
  declare shippingAddress: BelongsTo<typeof CustomerAddress>

  @hasMany(() => CartItem)
  declare items: HasMany<typeof CartItem>
}
