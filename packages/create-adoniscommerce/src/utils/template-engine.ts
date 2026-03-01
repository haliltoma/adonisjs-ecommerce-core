import fs from 'fs-extra'
import path from 'node:path'
import type { ProjectConfig } from '../types/index.js'
import { generateAppKey } from './key-generator.js'

export interface TemplateVariables {
  PROJECT_NAME: string
  DB_TYPE: string
  APP_KEY: string
  [key: string]: string
}

const TEMPLATE_FILES = [
  'package.json',
  'README.md',
  '.env',
  '.env.example',
  '.env.docker',
  'config/database.ts',
]

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g

export function getTemplateVariables(config: ProjectConfig): TemplateVariables {
  return {
    PROJECT_NAME: config.projectName,
    DB_TYPE: config.database,
    APP_KEY: generateAppKey(),
  }
}

export async function processTemplateFiles(targetDir: string, variables: TemplateVariables): Promise<void> {
  for (const file of TEMPLATE_FILES) {
    const filePath = path.join(targetDir, file)

    if (await fs.pathExists(filePath)) {
      await processFile(filePath, variables)
    }
  }
}

async function processFile(filePath: string, variables: TemplateVariables): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8')
  const processed = replaceVariables(content, variables)

  if (content !== processed) {
    await fs.writeFile(filePath, processed, 'utf-8')
  }
}

export function replaceVariables(content: string, variables: TemplateVariables): string {
  return content.replace(VARIABLE_PATTERN, (match, key) => {
    if (key in variables) {
      return variables[key]
    }
    return match
  })
}

export async function processDirectory(
  dir: string,
  variables: TemplateVariables,
  extensions = ['.ts', '.js', '.json', '.md', '.env', '.yml', '.yaml']
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip node_modules and .git
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        await processDirectory(entryPath, variables, extensions)
      }
    } else {
      const ext = path.extname(entry.name)
      const basename = path.basename(entry.name)

      // Process files with matching extensions or dotfiles like .env
      if (extensions.includes(ext) || basename.startsWith('.env')) {
        await processFile(entryPath, variables)
      }
    }
  }
}
