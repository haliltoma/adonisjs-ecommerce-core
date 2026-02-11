import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import RegionCountry from './region_country.js'

export default class Region extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare name: string

  @column()
  declare currencyCode: string

  @column()
  declare taxRate: number

  @column()
  declare taxCode: string | null

  @column()
  declare includesTax: boolean

  @column()
  declare paymentProviders: string[]

  @column()
  declare fulfillmentProviders: string[]

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

  @hasMany(() => RegionCountry)
  declare countries: HasMany<typeof RegionCountry>
}
