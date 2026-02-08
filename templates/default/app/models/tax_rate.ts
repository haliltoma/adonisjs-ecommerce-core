import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TaxClass from './tax_class.js'

export default class TaxRate extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare taxClassId: string

  @column()
  declare name: string

  @column()
  declare rate: number

  @column()
  declare countryCode: string

  @column()
  declare stateCode: string | null

  @column()
  declare postalCode: string | null

  @column()
  declare priority: number

  @column()
  declare isCompound: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => TaxClass)
  declare taxClass: BelongsTo<typeof TaxClass>
}
