import fs from 'fs-extra'
import path from 'node:path'
import type { ProjectConfig, DatabaseType } from '../types/index.js'
import { DATABASE_CONFIGS } from '../types/index.js'
import { logger } from '../ui/logger.js'

export async function setupDatabase(targetDir: string, config: ProjectConfig): Promise<void> {
  // Update docker-compose.yml if docker is enabled
  if (config.docker) {
    await updateDockerCompose(targetDir, config.database)
  }

  // Update package.json dependencies for the selected database
  await updateDatabaseDependencies(targetDir, config.database)
}

async function updateDockerCompose(targetDir: string, database: DatabaseType): Promise<void> {
  const dockerComposePath = path.join(targetDir, 'docker-compose.yml')

  if (!(await fs.pathExists(dockerComposePath))) {
    logger.debug('docker-compose.yml not found, skipping')
    return
  }

  let content = await fs.readFile(dockerComposePath, 'utf-8')
  const dbConfig = DATABASE_CONFIGS[database]

  // For SQLite, we might want to remove database service
  if (database === 'sqlite') {
    // SQLite doesn't need a database container
    logger.debug('SQLite selected, database container may not be needed')
    return
  }

  // Update the database service image if needed
  if (database === 'mysql' && dbConfig.dockerImage) {
    content = content.replace(/postgres:\d+/g, dbConfig.dockerImage)
    content = content.replace(/POSTGRES_/g, 'MYSQL_')
  }

  await fs.writeFile(dockerComposePath, content, 'utf-8')
}

async function updateDatabaseDependencies(targetDir: string, database: DatabaseType): Promise<void> {
  const packageJsonPath = path.join(targetDir, 'package.json')

  if (!(await fs.pathExists(packageJsonPath))) {
    return
  }

  const packageJson = await fs.readJson(packageJsonPath)
  const dbConfig = DATABASE_CONFIGS[database]

  // Remove other database drivers
  const allDrivers = ['pg', 'mysql2', 'better-sqlite3']
  for (const driver of allDrivers) {
    if (driver !== dbConfig.package) {
      delete packageJson.dependencies?.[driver]
      delete packageJson.devDependencies?.[driver]
    }
  }

  // Ensure the correct driver is present
  if (!packageJson.dependencies?.[dbConfig.package]) {
    packageJson.dependencies = packageJson.dependencies || {}
    packageJson.dependencies[dbConfig.package] = getDriverVersion(dbConfig.package)
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

function getDriverVersion(driver: string): string {
  const versions: Record<string, string> = {
    pg: '^8.18.0',
    mysql2: '^3.11.0',
    'better-sqlite3': '^11.5.0',
  }
  return versions[driver] || '*'
}
