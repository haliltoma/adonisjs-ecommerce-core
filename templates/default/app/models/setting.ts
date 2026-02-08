import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class Setting extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string | null

  @column()
  declare group: string

  @column()
  declare key: string

  @column()
  declare value: unknown

  @column()
  declare type: 'string' | 'number' | 'boolean' | 'json' | 'array'

  @column()
  declare isPublic: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  getTypedValue(): unknown {
    switch (this.type) {
      case 'number':
        return Number(this.value)
      case 'boolean':
        return Boolean(this.value)
      case 'json':
      case 'array':
        return typeof this.value === 'string' ? JSON.parse(this.value) : this.value
      default:
        return this.value
    }
  }
}
