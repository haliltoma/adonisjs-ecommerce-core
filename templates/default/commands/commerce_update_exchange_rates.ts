import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceUpdateExchangeRates extends BaseCommand {
  static commandName = 'commerce:update-exchange-rates'
  static description = 'Update currency exchange rates'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Updating exchange rates...')

    const Currency = (await import('#models/currency')).default
    const currencies = await Currency.query().where('isActive', true)

    if (currencies.length === 0) {
      this.logger.warning('No active currencies found')
      return
    }

    const baseCurrency = currencies.find((c) => c.isDefault) || currencies[0]
    this.logger.info(`Base currency: ${baseCurrency.code}`)

    // Try fetching from a free exchange rate API
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency.code}`
      )

      if (!response.ok) {
        this.logger.error(`API returned ${response.status}`)
        return
      }

      const data = (await response.json()) as { rates: Record<string, number> }

      let updated = 0
      for (const currency of currencies) {
        if (currency.code === baseCurrency.code) {
          currency.exchangeRate = 1
          await currency.save()
          continue
        }

        const rate = data.rates[currency.code]
        if (rate) {
          currency.exchangeRate = rate
          await currency.save()
          updated++
          this.logger.info(`  ${currency.code}: ${rate}`)
        } else {
          this.logger.warning(`  ${currency.code}: rate not found`)
        }
      }

      this.logger.success(`Updated ${updated} exchange rates`)
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rates: ${(error as Error).message}`)
      this.logger.info('You can manually update rates in the admin panel')
    }
  }
}
