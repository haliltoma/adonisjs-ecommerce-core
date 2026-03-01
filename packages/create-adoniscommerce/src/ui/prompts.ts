import * as p from '@clack/prompts'
import pc from 'picocolors'
import type { ProjectConfig, PackageManager, DatabaseType, TemplateName, CliOptions } from '../types/index.js'
import { detectPackageManager } from '../utils/package-manager.js'

export async function runPrompts(
  projectNameArg: string | undefined,
  options: CliOptions
): Promise<ProjectConfig | null> {
  // Non-interactive mode
  if (options.yes) {
    const projectName = projectNameArg || 'my-store'
    return {
      projectName,
      template: (options.template as TemplateName) || 'default',
      packageManager: (options.pm as PackageManager) || detectPackageManager(),
      database: (options.db as DatabaseType) || 'postgres',
      docker: options.docker ?? true,
      git: options.git ?? true,
      install: options.install ?? true,
    }
  }

  p.intro(pc.bgMagenta(pc.black(' AdonisCommerce ')))

  const config = await p.group(
    {
      projectName: () => {
        if (projectNameArg) {
          return Promise.resolve(projectNameArg)
        }
        return p.text({
          message: 'Project name',
          placeholder: 'my-store',
          defaultValue: 'my-store',
          validate(value) {
            if (!value) return 'Project name is required'
            if (!/^[a-z0-9-_]+$/i.test(value)) {
              return 'Project name can only contain alphanumeric characters, hyphens, and underscores'
            }
            return undefined
          },
        })
      },

      template: () => {
        if (options.template) {
          return Promise.resolve(options.template)
        }
        return p.select({
          message: 'Template',
          options: [
            {
              value: 'default',
              label: 'Default',
              hint: 'Full-stack with admin panel',
            },
          ],
          initialValue: 'default',
        })
      },

      database: () => {
        if (options.db) {
          return Promise.resolve(options.db)
        }
        return p.select({
          message: 'Database',
          options: [
            {
              value: 'postgres',
              label: 'PostgreSQL',
              hint: 'recommended',
            },
            {
              value: 'mysql',
              label: 'MySQL',
            },
            {
              value: 'sqlite',
              label: 'SQLite',
              hint: 'development only',
            },
          ],
          initialValue: 'postgres',
        })
      },

      packageManager: () => {
        if (options.pm) {
          return Promise.resolve(options.pm)
        }
        const detected = detectPackageManager()
        return p.select({
          message: 'Package manager',
          options: [
            {
              value: 'pnpm',
              label: 'pnpm',
              hint: detected === 'pnpm' ? 'detected' : 'recommended',
            },
            {
              value: 'npm',
              label: 'npm',
              hint: detected === 'npm' ? 'detected' : undefined,
            },
            {
              value: 'yarn',
              label: 'yarn',
              hint: detected === 'yarn' ? 'detected' : undefined,
            },
            {
              value: 'bun',
              label: 'bun',
              hint: detected === 'bun' ? 'detected' : undefined,
            },
          ],
          initialValue: detected,
        })
      },

      docker: () => {
        if (options.docker !== undefined) {
          return Promise.resolve(options.docker)
        }
        return p.confirm({
          message: 'Include Docker setup?',
          initialValue: true,
        })
      },

      git: () => {
        if (options.git !== undefined) {
          return Promise.resolve(options.git)
        }
        return p.confirm({
          message: 'Initialize git repository?',
          initialValue: true,
        })
      },

      install: () => {
        if (options.install !== undefined) {
          return Promise.resolve(options.install)
        }
        return p.confirm({
          message: 'Install dependencies?',
          initialValue: true,
        })
      },
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.')
        return null
      },
    }
  )

  if (!config || p.isCancel(config)) {
    return null
  }

  return config as ProjectConfig
}
