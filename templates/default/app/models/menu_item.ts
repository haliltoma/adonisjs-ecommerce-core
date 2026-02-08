import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Menu from './menu.js'

export default class MenuItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare menuId: string

  @column()
  declare parentId: string | null

  @column()
  declare title: string

  @column()
  declare url: string | null

  @column()
  declare type: 'link' | 'page' | 'category' | 'product' | 'collection'

  @column()
  declare referenceId: string | null

  @column()
  declare target: '_self' | '_blank'

  @column()
  declare icon: string | null

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Menu)
  declare menu: BelongsTo<typeof Menu>

  @belongsTo(() => MenuItem, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof MenuItem>

  @hasMany(() => MenuItem, { foreignKey: 'parentId' })
  declare children: HasMany<typeof MenuItem>
}
