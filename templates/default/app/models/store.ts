import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Product from './product.js'
import Category from './category.js'
import Customer from './customer.js'
import Order from './order.js'
import Collection from './collection.js'
import Page from './page.js'
import Menu from './menu.js'
import Banner from './banner.js'
import Discount from './discount.js'
import Webhook from './webhook.js'
import Setting from './setting.js'

export default class Store extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare domain: string | null

  @column()
  declare logoUrl: string | null

  @column()
  declare defaultLocale: string

  @column()
  declare defaultCurrency: string

  @column()
  declare timezone: string

  @column()
  declare isActive: boolean

  @column({ columnName: 'settings' })
  declare config: Record<string, unknown>

  @column()
  declare meta: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @hasMany(() => Category)
  declare categories: HasMany<typeof Category>

  @hasMany(() => Customer)
  declare customers: HasMany<typeof Customer>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @hasMany(() => Collection)
  declare collections: HasMany<typeof Collection>

  @hasMany(() => Page)
  declare pages: HasMany<typeof Page>

  @hasMany(() => Menu)
  declare menus: HasMany<typeof Menu>

  @hasMany(() => Banner)
  declare banners: HasMany<typeof Banner>

  @hasMany(() => Discount)
  declare discounts: HasMany<typeof Discount>

  @hasMany(() => Webhook)
  declare webhooks: HasMany<typeof Webhook>

  @hasMany(() => Setting)
  declare settings: HasMany<typeof Setting>
}
