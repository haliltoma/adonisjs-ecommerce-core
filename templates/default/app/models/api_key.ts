import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import User from './user.js'
import SalesChannel from './sales_channel.js'
import { jsonColumn } from '#helpers/json_column'

export default class ApiKey extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare title: string

  @column()
  declare type: 'publishable' | 'secret'

  @column()
  declare tokenHash: string

  @column()
  declare last4: string

  @column()
  declare prefix: string

  @column()
  declare createdBy: string | null

  @column.dateTime()
  declare revokedAt: DateTime | null

  @column.dateTime()
  declare lastUsedAt: DateTime | null

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @manyToMany(() => SalesChannel, {
    pivotTable: 'api_key_sales_channels',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare salesChannels: ManyToMany<typeof SalesChannel>
}
