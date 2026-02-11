import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceMakeProvider extends BaseCommand {
  static commandName = 'commerce:make-provider'
  static description = 'Scaffold a new payment/shipping/notification provider'

  static options: CommandOptions = {
    startApp: false,
  }

  @args.string({ description: 'Provider name (e.g., stripe, sendgrid)' })
  declare name: string

  async run() {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { join } = await import('node:path')

    const providerName = this.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const className = providerName
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('')

    const type = await this.prompt.choice('Provider type', [
      { name: 'payment', message: 'Payment Provider' },
      { name: 'shipping', message: 'Shipping Provider' },
      { name: 'notification', message: 'Notification Provider' },
      { name: 'search', message: 'Search Provider' },
    ])

    const contractMap: Record<string, { contract: string; importPath: string }> = {
      payment: { contract: 'PaymentProvider', importPath: '#contracts/payment_provider' },
      shipping: { contract: 'ShippingProvider', importPath: '#contracts/shipping_provider' },
      notification: { contract: 'NotificationProvider', importPath: '#contracts/notification_provider' },
      search: { contract: 'SearchProvider', importPath: '#contracts/search_provider' },
    }

    const { contract, importPath } = contractMap[type]
    const dir = join(this.app.appRoot.pathname, 'app', 'services', type)
    await mkdir(dir, { recursive: true })

    const filePath = join(dir, `${providerName}_${type}_provider.ts`)
    await writeFile(
      filePath,
      `import { ${contract} } from '${importPath}'

export class ${className}${contract} extends ${contract} {
  // TODO: Implement all abstract methods
}
`
    )

    this.logger.success(`Provider created at app/services/${type}/${providerName}_${type}_provider.ts`)
    this.logger.info(`Register it in providers/commerce_provider.ts to use it`)
  }
}
