import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from './product.js'
import Attribute from './attribute.js'

export default class ProductAttributeValue extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare productId: string

  @column()
  declare attributeId: string

  @column()
  declare textValue: string | null

  @column()
  declare numberValue: number | null

  @column()
  declare booleanValue: boolean | null

  @column.dateTime()
  declare dateValue: DateTime | null

  @column()
  declare jsonValue: unknown | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Attribute)
  declare attribute: BelongsTo<typeof Attribute>

  getValue(): unknown {
    switch (true) {
      case this.textValue !== null:
        return this.textValue
      case this.numberValue !== null:
        return this.numberValue
      case this.booleanValue !== null:
        return this.booleanValue
      case this.dateValue !== null:
        return this.dateValue
      case this.jsonValue !== null:
        return this.jsonValue
      default:
        return null
    }
  }
}
