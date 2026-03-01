export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'
export type DatabaseType = 'postgres' | 'mysql' | 'sqlite'
export type TemplateName = 'default'

export interface ProjectConfig {
  projectName: string
  template: TemplateName
  packageManager: PackageManager
  database: DatabaseType
  docker: boolean
  git: boolean
  install: boolean
}

export interface CliOptions {
  template?: TemplateName
  pm?: PackageManager
  db?: DatabaseType
  docker?: boolean
  git?: boolean
  install?: boolean
  yes?: boolean
  'dry-run'?: boolean
  dryRun?: boolean
  verbose?: boolean
  offline?: boolean
}

export interface TemplateMetadata {
  name: string
  version: string
  description: string
  minCliVersion: string
  features: string[]
  variables: Record<string, TemplateVariable>
}

export interface TemplateVariable {
  type: 'string' | 'enum' | 'boolean'
  required?: boolean
  values?: string[]
  default?: string | boolean
}

export interface DatabaseConfig {
  client: string
  package: string
  port: number
  dockerImage?: string
  envDefaults: Record<string, string>
}

export const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  postgres: {
    client: 'pg',
    package: 'pg',
    port: 5432,
    dockerImage: 'postgres:16',
    envDefaults: {
      DB_HOST: '127.0.0.1',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_DATABASE: 'adoniscommerce',
    },
  },
  mysql: {
    client: 'mysql2',
    package: 'mysql2',
    port: 3306,
    dockerImage: 'mysql:8',
    envDefaults: {
      DB_HOST: '127.0.0.1',
      DB_PORT: '3306',
      DB_USER: 'root',
      DB_PASSWORD: 'root',
      DB_DATABASE: 'adoniscommerce',
    },
  },
  sqlite: {
    client: 'better-sqlite3',
    package: 'better-sqlite3',
    port: 0,
    envDefaults: {
      DB_HOST: '',
      DB_PORT: '',
      DB_USER: '',
      DB_PASSWORD: '',
      DB_DATABASE: './database.sqlite',
    },
  },
}
