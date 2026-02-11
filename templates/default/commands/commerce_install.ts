import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceInstall extends BaseCommand {
  static commandName = 'commerce:install'
  static description = 'Run the initial setup wizard for AdonisCommerce'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { randomUUID } = await import('node:crypto')
    this.logger.info('Welcome to AdonisCommerce Setup Wizard')
    this.logger.info('─'.repeat(40))

    // Step 1: Store settings
    const storeName = await this.prompt.ask('Store name', { default: 'My Store' })
    const currency = await this.prompt.ask('Default currency code', { default: 'USD' })
    const locale = await this.prompt.ask('Default locale', { default: 'en' })

    // Step 2: Create store
    const Store = (await import('#models/store')).default
    let store = await Store.first()

    if (!store) {
      store = await Store.create({
        id: randomUUID(),
        name: storeName,
        slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        defaultCurrency: currency,
        defaultLocale: locale,
        timezone: 'UTC',
        isActive: true,
        config: {},
        meta: {},
      })
      this.logger.success('Store created')
    } else {
      store.name = storeName
      store.defaultCurrency = currency
      store.defaultLocale = locale
      await store.save()
      this.logger.success('Store updated')
    }

    // Step 3: Create admin
    const createAdmin = await this.prompt.confirm('Create admin user?', { default: true })
    if (createAdmin) {
      const email = await this.prompt.ask('Admin email')
      const name = await this.prompt.ask('Admin name')
      const password = await this.prompt.secure('Admin password')

      const User = (await import('#models/user')).default
      const hash = (await import('@adonisjs/core/services/hash')).default
      const Role = (await import('#models/role')).default

      let role = await Role.query().where('slug', 'super-admin').first()
      if (!role) {
        role = await Role.create({
          id: randomUUID(),
          name: 'Super Admin',
          slug: 'super-admin',
          description: 'Full access to all features',
          isSystem: true,
        })
      }

      const [firstName, ...lastParts] = name.split(' ')
      await User.create({
        fullName: name,
        firstName,
        lastName: lastParts.join(' ') || '',
        email,
        password: await hash.make(password),
        roleId: role.id,
        isActive: true,
      })
      this.logger.success('Admin user created')
    }

    // Step 4: Seed demo data
    const seedData = await this.prompt.confirm('Seed demo data?', { default: false })
    if (seedData) {
      await this.kernel.exec('db:seed', [])
      this.logger.success('Demo data seeded')
    }

    this.logger.info('')
    this.logger.success('AdonisCommerce setup complete!')
    this.logger.info('Visit http://localhost:3333/admin to get started')
  }
}
