import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceMakePlugin extends BaseCommand {
  static commandName = 'commerce:make-plugin'
  static description = 'Scaffold a new AdonisCommerce plugin'

  static options: CommandOptions = {
    startApp: false,
  }

  @args.string({ description: 'Plugin name (e.g., blog, loyalty)' })
  declare name: string

  async run() {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { join } = await import('node:path')

    const pluginName = this.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const className = pluginName
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('')

    const pluginDir = join(this.app.appRoot.pathname, 'plugins', pluginName)

    // Create directory structure
    const dirs = ['src', 'src/models', 'src/services', 'src/controllers', 'src/migrations']
    for (const dir of dirs) {
      await mkdir(join(pluginDir, dir), { recursive: true })
    }

    // Create package.json
    await writeFile(
      join(pluginDir, 'package.json'),
      JSON.stringify(
        {
          name: `@adoniscommerce-plugin/${pluginName}`,
          version: '1.0.0',
          type: 'module',
          main: './src/index.js',
          types: './src/index.d.ts',
        },
        null,
        2
      )
    )

    // Create main plugin file
    await writeFile(
      join(pluginDir, 'src', 'index.ts'),
      `import { CommercePlugin } from '#contracts/plugin'
import type { ApplicationService } from '@adonisjs/core/types'
import type { PluginMeta, PluginAdminMenuItem } from '#contracts/plugin'

export default class ${className}Plugin extends CommercePlugin {
  readonly meta: PluginMeta = {
    name: '@adoniscommerce-plugin/${pluginName}',
    version: '1.0.0',
    description: '${className} plugin for AdonisCommerce',
  }

  async register(_app: ApplicationService): Promise<void> {
    // Register services and bindings
  }

  adminMenuItems(): PluginAdminMenuItem[] {
    return [
      {
        label: '${className}',
        path: '/admin/${pluginName}',
        icon: 'Puzzle',
        order: 50,
      },
    ]
  }
}
`
    )

    // Create config file
    await writeFile(
      join(pluginDir, 'src', 'config.ts'),
      `export default {
  // Plugin configuration
}
`
    )

    this.logger.success(`Plugin "${pluginName}" scaffolded at plugins/${pluginName}/`)
    this.logger.info(`To enable, add '@adoniscommerce-plugin/${pluginName}' to commerce.ts plugins array`)
  }
}
