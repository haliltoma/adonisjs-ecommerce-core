import { ApplicationService } from '@adonisjs/core'
import type { Config } from '@japa/runner'
import { PluginFn } from '@japa/plugin-adonisjs'
import { FileSystem } from '@japa/plugin-adonisjs/build/actions/file_system'
import { Router } from '@japa/plugin-adonisjs/build/actions/router'

/**
 * Japa app file is the entry point to setup Japa tests to work
 * with AdonisJS application.
 */
export const apiClient: PluginFn<ApplicationService> = (
  app: ApplicationService,
  config: Config
) => {
  const fileSystem = new FileSystem(app.appRoot, [
    'tests/integration',
    'tests/api',
    'tests/unit',
  ])

  return {
    fileSystem,
    router: new Router(app, config),
  }
}