import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Customer from './customer.js'
import Region from './region.js'
import Order from './order.js'
import User from './user.js'

export default class DraftOrder extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare displayId: string

  @column()
  declare status: 'open' | 'completed' | 'cancelled'

  @column()
  declare customerId: string | null

  @column()
  declare email: string | null

  @column()
  declare regionId: string | null

  @column()
  declare currencyCode: string

  @column()
  declare items: Record<string, unknown>[]

  @column()
  declare shippingAddress: Record<string, unknown> | null

  @column()
  declare billingAddress: Record<string, unknown> | null

  @column()
  declare shippingMethod: string | null

  @column()
  declare shippingTotal: number

  @column()
  declare discountTotal: number

  @column()
  declare taxTotal: number

  @column()
  declare subtotal: number

  @column()
  declare grandTotal: number

  @column()
  declare note: string | null

  @column()
  declare orderId: string | null

  @column()
  declare createdBy: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Region)
  declare region: BelongsTo<typeof Region>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>
}
