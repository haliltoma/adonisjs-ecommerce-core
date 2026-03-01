import fs from 'fs-extra'
import path from 'node:path'
import type { ProjectConfig } from '../types/index.js'
import { createEnvFile } from '../utils/env-generator.js'
import { logger } from '../ui/logger.js'

export async function configureProject(targetDir: string, config: ProjectConfig): Promise<void> {
  // Update package.json
  await updatePackageJson(targetDir, config)

  // Create .env file
  await createEnvFile(targetDir, config)

  // Update database config if needed
  await updateDatabaseConfig(targetDir, config)
}

async function updatePackageJson(targetDir: string, config: ProjectConfig): Promise<void> {
  const packageJsonPath = path.join(targetDir, 'package.json')

  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error('package.json not found in template')
  }

  const packageJson = await fs.readJson(packageJsonPath)

  // Update project name
  packageJson.name = config.projectName
  packageJson.version = '0.0.1'
  packageJson.private = true

  // Remove description to make it project-specific
  delete packageJson.description

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

async function updateDatabaseConfig(targetDir: string, config: ProjectConfig): Promise<void> {
  const dbConfigPath = path.join(targetDir, 'config', 'database.ts')

  if (!(await fs.pathExists(dbConfigPath))) {
    logger.debug('database.ts not found, skipping database config update')
    return
  }

  let content = await fs.readFile(dbConfigPath, 'utf-8')

  // Update connection name based on database type
  switch (config.database) {
    case 'mysql':
      content = content.replace(/connection: ['"]postgres['"]/, "connection: 'mysql'")
      content = content.replace(/client: ['"]pg['"]/, "client: 'mysql2'")
      content = generateMysqlConfig()
      break
    case 'sqlite':
      content = generateSqliteConfig()
      break
    case 'postgres':
    default:
      // Default template is already postgres
      break
  }

  await fs.writeFile(dbConfigPath, content, 'utf-8')
}

function generateMysqlConfig(): string {
  return `import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
`
}

function generateSqliteConfig(): string {
  return `import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import app from '@adonisjs/core/services/app'

const dbConfig = defineConfig({
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.makePath(env.get('DB_DATABASE', 'database.sqlite')),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
`
}
