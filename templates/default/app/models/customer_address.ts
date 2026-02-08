import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'

export default class CustomerAddress extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare customerId: string

  @column()
  declare type: 'billing' | 'shipping' | 'both'

  @column()
  declare isDefault: boolean

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare company: string | null

  @column()
  declare addressLine1: string

  @column()
  declare addressLine2: string | null

  @column()
  declare city: string

  @column()
  declare state: string | null

  @column()
  declare postalCode: string

  @column()
  declare countryCode: string

  @column()
  declare phone: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  get formattedAddress() {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.postalCode,
      this.countryCode,
    ].filter(Boolean)
    return parts.join(', ')
  }
}
