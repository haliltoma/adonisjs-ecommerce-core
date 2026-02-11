import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Currency extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare symbol: string

  @column()
  declare symbolPosition: 'before' | 'after'

  @column()
  declare decimalPlaces: number

  @column()
  declare decimalSeparator: string

  @column()
  declare thousandsSeparator: string

  @column()
  declare exchangeRate: number

  @column()
  declare baseCurrency: string | null

  @column.dateTime()
  declare rateUpdatedAt: DateTime | null

  @column()
  declare isDefault: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  formatPrice(amount: number): string {
    const formatted = amount.toFixed(this.decimalPlaces)
    const [integer, decimal] = formatted.split('.')
    const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator)
    const finalAmount = decimal ? `${withThousands}${this.decimalSeparator}${decimal}` : withThousands
    return this.symbolPosition === 'before' ? `${this.symbol}${finalAmount}` : `${finalAmount}${this.symbol}`
  }
}
