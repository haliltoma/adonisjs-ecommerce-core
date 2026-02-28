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
import Region from './region.js'
import SalesChannel from './sales_channel.js'
import CustomerGroup from './customer_group.js'
import PriceList from './price_list.js'
import { jsonColumn } from '#helpers/json_column'

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

  @column(jsonColumn({ columnName: 'settings' }))
  declare config: Record<string, unknown>

  @column(jsonColumn())
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

  @hasMany(() => Region)
  declare regions: HasMany<typeof Region>

  @hasMany(() => SalesChannel)
  declare salesChannels: HasMany<typeof SalesChannel>

  @hasMany(() => CustomerGroup)
  declare customerGroups: HasMany<typeof CustomerGroup>

  @hasMany(() => PriceList)
  declare priceLists: HasMany<typeof PriceList>
}
