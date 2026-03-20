import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, beforeCreate, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class Setting extends BaseModel {
  static table = 'settings'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'store_id' })
  declare storeId: string | null

  @column()
  declare group: string

  @column()
  declare key: string

  @column({
    prepare: (value: unknown) => {
      // For jsonb columns, we need to serialize properly
      if (value === null || value === undefined) {
        return null
      }
      // If already a string, check if it's valid JSON
      if (typeof value === 'string') {
        try {
          // Check if it's already valid JSON
          JSON.parse(value)
          return value
        } catch {
          // If not valid JSON, wrap it as a JSON string
          return JSON.stringify(value)
        }
      }
      // For objects/arrays, stringify them
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      // For primitives, convert to string
      return JSON.stringify(value)
    },
  })
  declare value: unknown

  @column({ columnName: 'type', default: 'string' })
  declare type: 'string' | 'number' | 'boolean' | 'json' | 'array'

  @column({ columnName: 'is_public', default: false })
  declare isPublic: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @beforeCreate()
  static setTimestamps(record: Setting) {
    const now = DateTime.now().toUTC()
    record.createdAt = now
    record.updatedAt = now
  }

  getTypedValue(): unknown {
    let rawValue = this.value

    // If value is stored as JSON string, parse it
    if (typeof rawValue === 'string') {
      try {
        rawValue = JSON.parse(rawValue)
      } catch {
        // Keep as string if not valid JSON
      }
    }

    switch (this.type) {
      case 'number':
        return Number(rawValue)
      case 'boolean':
        return Boolean(rawValue)
      case 'json':
      case 'array':
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue
      default:
        return rawValue
    }
  }
}
