import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Region from './region.js'

export default class RegionCountry extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare regionId: string

  @column()
  declare countryCode: string

  @column()
  declare countryName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Region)
  declare region: BelongsTo<typeof Region>
}
