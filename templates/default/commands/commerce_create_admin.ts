import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceCreateAdmin extends BaseCommand {
  static commandName = 'commerce:create-admin'
  static description = 'Create a new admin user'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'Admin email address' })
  declare email: string

  @flags.string({ description: 'Admin password' })
  declare password: string

  @flags.string({ description: 'Admin full name' })
  declare name: string

  async run() {
    const { randomUUID } = await import('node:crypto')

    const email = this.email || (await this.prompt.ask('Enter admin email'))
    const name = this.name || (await this.prompt.ask('Enter admin name'))
    const password = this.password || (await this.prompt.secure('Enter admin password'))

    if (!email || !password || !name) {
      this.logger.error('Email, name, and password are required')
      return
    }

    const User = (await import('#models/user')).default
    const hash = (await import('@adonisjs/core/services/hash')).default
    const Role = (await import('#models/role')).default

    const existing = await User.findBy('email', email)
    if (existing) {
      this.logger.error(`User with email "${email}" already exists`)
      return
    }

    // Find or create super-admin role
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
    const lastName = lastParts.join(' ') || ''

    await User.create({
      fullName: name,
      firstName,
      lastName,
      email,
      password: await hash.make(password),
      roleId: role.id,
      isActive: true,
    })

    this.logger.success(`Admin user "${email}" created successfully`)
  }
}
