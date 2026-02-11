import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceMakeModule extends BaseCommand {
  static commandName = 'commerce:make-module'
  static description = 'Scaffold a new commerce module'

  static options: CommandOptions = {
    startApp: false,
  }

  @args.string({ description: 'Module name (e.g., loyalty, subscriptions)' })
  declare name: string

  async run() {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { join } = await import('node:path')

    const moduleName = this.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const className = moduleName
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('')

    const baseDir = this.app.appRoot.pathname

    // Create module files in the appropriate directories
    const files = [
      {
        path: join(baseDir, 'app', 'services', `${moduleName}_service.ts`),
        content: `export default class ${className}Service {
  // TODO: Implement service methods
}
`,
      },
      {
        path: join(baseDir, 'app', 'controllers', 'admin', `${moduleName}_controller.ts`),
        content: `import type { HttpContext } from '@adonisjs/core/http'
import ${className}Service from '#services/${moduleName}_service'

export default class ${className}Controller {
  private service = new ${className}Service()

  async index({ inertia }: HttpContext) {
    return inertia.render('admin/${moduleName}/Index', {})
  }
}
`,
      },
      {
        path: join(baseDir, 'app', 'events', `${moduleName}_events.ts`),
        content: `import { BaseEvent } from '@adonisjs/core/events'

export class ${className}Created extends BaseEvent {
  constructor(public data: { id: string }) {
    super()
  }
}
`,
      },
    ]

    for (const file of files) {
      await mkdir(join(file.path, '..'), { recursive: true })
      await writeFile(file.path, file.content)
    }

    this.logger.success(`Module "${moduleName}" scaffolded:`)
    this.logger.info(`  - app/services/${moduleName}_service.ts`)
    this.logger.info(`  - app/controllers/admin/${moduleName}_controller.ts`)
    this.logger.info(`  - app/events/${moduleName}_events.ts`)
    this.logger.info('Add routes in start/routes.ts to complete the setup')
  }
}
