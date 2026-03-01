import fs from 'fs-extra'
import path from 'node:path'
import type { DatabaseType, ProjectConfig } from '../types/index.js'
import { DATABASE_CONFIGS } from '../types/index.js'
import { generateAppKey } from './key-generator.js'

export interface EnvConfig {
  APP_KEY: string
  DB_HOST: string
  DB_PORT: string
  DB_USER: string
  DB_PASSWORD: string
  DB_DATABASE: string
  [key: string]: string
}

export function generateEnvConfig(config: ProjectConfig): EnvConfig {
  const dbConfig = DATABASE_CONFIGS[config.database]

  return {
    APP_KEY: generateAppKey(),
    ...dbConfig.envDefaults,
  }
}

export async function createEnvFile(targetDir: string, config: ProjectConfig): Promise<void> {
  const envExamplePath = path.join(targetDir, '.env.example')
  const envDockerPath = path.join(targetDir, '.env.docker')
  const envPath = path.join(targetDir, '.env')

  let envContent: string

  // Try to use .env.docker if docker is enabled, otherwise use .env.example
  if (config.docker && (await fs.pathExists(envDockerPath))) {
    envContent = await fs.readFile(envDockerPath, 'utf-8')
  } else if (await fs.pathExists(envExamplePath)) {
    envContent = await fs.readFile(envExamplePath, 'utf-8')
  } else {
    // Generate minimal .env
    const envConfig = generateEnvConfig(config)
    envContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
  }

  // Replace APP_KEY with a generated one
  const appKey = generateAppKey()
  envContent = envContent.replace(/APP_KEY=.*/, `APP_KEY=${appKey}`)

  // Update database config based on selection
  const dbConfig = DATABASE_CONFIGS[config.database]
  envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${dbConfig.envDefaults.DB_HOST}`)
  envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${dbConfig.envDefaults.DB_PORT}`)
  envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${dbConfig.envDefaults.DB_USER}`)
  envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${dbConfig.envDefaults.DB_PASSWORD}`)
  envContent = envContent.replace(/DB_DATABASE=.*/, `DB_DATABASE=${dbConfig.envDefaults.DB_DATABASE}`)

  await fs.writeFile(envPath, envContent, 'utf-8')
}

export function getEnvVariables(database: DatabaseType): Record<string, string> {
  return DATABASE_CONFIGS[database].envDefaults
}
