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

  // Update .env file with correct database configuration
  await updateEnvDatabaseConfig(targetDir, config.database, config.docker)
}

async function updateDockerCompose(targetDir: string, database: DatabaseType): Promise<void> {
  const dockerComposePath = path.join(targetDir, 'docker-compose.yml')

  if (!(await fs.pathExists(dockerComposePath))) {
    logger.debug('docker-compose.yml not found, skipping')
    return
  }

  const dbConfig = DATABASE_CONFIGS[database]

  // Generate new docker-compose content based on database type
  const newContent = generateDockerComposeContent(database, dbConfig)

  await fs.writeFile(dockerComposePath, newContent, 'utf-8')
  logger.debug(`Docker compose updated for ${database}`)
}

function generateDockerComposeContent(database: DatabaseType, dbConfig: typeof DATABASE_CONFIGS['postgres']): string {
  const dbService = generateDatabaseService(database, dbConfig)

  return `# AdonisCommerce Docker Services
# Database: ${database.toUpperCase()}

services:
${dbService}
  # Redis Cache & Session Store
  redis:
    image: redis:7-alpine
    container_name: \${COMPOSE_PROJECT_NAME:-adoniscommerce}-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD:-redis123}
    ports:
      - "\${REDIS_PORT:-6380}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "\${REDIS_PASSWORD:-redis123}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - default_network

volumes:
  redis_data:
    driver: local

networks:
  default_network:
    driver: bridge
`
}

function generateDatabaseService(database: DatabaseType, dbConfig: typeof DATABASE_CONFIGS['postgres']): string {
  switch (database) {
    case 'postgres':
      return `  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: \${COMPOSE_PROJECT_NAME:-adoniscommerce}-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${DB_USER:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-postgres}
      POSTGRES_DB: \${DB_DATABASE:-adoniscommerce}
    ports:
      - "\${DB_PORT:-5433}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - default_network

volumes:
  postgres_data:
    driver: local
`

    case 'mysql':
      return `  # MySQL Database
  mysql:
    image: mysql:8-alpine
    container_name: \${COMPOSE_PROJECT_NAME:-adoniscommerce}-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_PASSWORD:-root}
      MYSQL_DATABASE: \${DB_DATABASE:-adoniscommerce}
      MYSQL_USER: \${DB_USER:-root}
      MYSQL_PASSWORD: \${DB_PASSWORD:-root}
    ports:
      - "\${DB_PORT:-3307}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\${DB_PASSWORD:-root}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - default_network

volumes:
  mysql_data:
    driver: local
`

    case 'sqlite':
      // SQLite doesn't need a database container - file-based
      return ''
  }
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
  logger.debug(`Database dependencies updated: ${dbConfig.package}`)
}

async function updateEnvDatabaseConfig(targetDir: string, database: DatabaseType, docker: boolean): Promise<void> {
  const envPath = path.join(targetDir, '.env')
  const envDockerPath = path.join(targetDir, '.env.docker')

  // Always update .env as it's the actual file used by the app
  // .env.docker is just a template
  const targetEnvPath = envPath

  if (!(await fs.pathExists(targetEnvPath))) {
    logger.debug('.env file not found, skipping database config update')
    return
  }

  const content = await fs.readFile(targetEnvPath, 'utf-8')
  const dbConfig = DATABASE_CONFIGS[database]

  let updatedContent = content

  // Update DB_CONNECTION
  updatedContent = updatedContent.replace(
    /^DB_CONNECTION=.*$/m,
    `DB_CONNECTION=${dbConfig.client}`
  )

  // Update DB_HOST based on docker mode
  // For docker: use container name (postgres/mysql) or empty for sqlite
  // For local: use localhost
  let dbHost: string
  if (database === 'sqlite') {
    dbHost = ''
  } else if (docker) {
    dbHost = database // postgres or mysql
  } else {
    dbHost = '127.0.0.1'
  }
  updatedContent = updatedContent.replace(
    /^DB_HOST=.*$/m,
    dbHost ? `DB_HOST=${dbHost}` : 'DB_HOST='
  )

  // Update DB_PORT - use correct default ports
  let dbPort = ''
  if (database === 'postgres') {
    dbPort = docker ? '' : '5432' // Docker uses internal container port, local uses standard
  } else if (database === 'mysql') {
    dbPort = docker ? '' : '3306'
  }
  updatedContent = updatedContent.replace(
    /^DB_PORT=.*$/m,
    dbPort ? `DB_PORT=${dbPort}` : 'DB_PORT='
  )

  // Update DB_DATABASE for SQLite
  if (database === 'sqlite') {
    updatedContent = updatedContent.replace(
      /^DB_DATABASE=.*$/m,
      `DB_DATABASE=./database.sqlite`
    )
  }

  // Handle SQLite specific settings
  if (database === 'sqlite') {
    updatedContent = updatedContent.replace(/^DB_USER=.*$/m, '# DB_USER=')
    updatedContent = updatedContent.replace(/^DB_PASSWORD=.*$/m, '# DB_PASSWORD=')
  }

  await fs.writeFile(targetEnvPath, updatedContent, 'utf-8')
  logger.debug(`.env updated for ${database} (docker: ${docker})`)
}

function getDriverVersion(driver: string): string {
  const versions: Record<string, string> = {
    pg: '^8.18.0',
    mysql2: '^3.11.0',
    'better-sqlite3': '^11.5.0',
  }
  return versions[driver] || '*'
}