import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class UrlRedirect extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column({ columnName: 'source_path' })
  declare fromPath: string

  @column({ columnName: 'target_path' })
  declare toPath: string

  @column()
  declare type: 'permanent' | 'temporary'

  @column()
  declare isActive: boolean

  @column()
  declare hitCount: number

  @column.dateTime()
  declare lastHitAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  /**
   * Get the HTTP status code based on the redirect type.
   */
  get statusCode(): 301 | 302 {
    return this.type === 'permanent' ? 301 : 302
  }
}
