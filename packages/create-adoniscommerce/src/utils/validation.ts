import fs from 'fs-extra'
import path from 'node:path'

export interface ValidationResult {
  valid: boolean
  error?: string
  suggestions?: string[]
}

export function validateProjectName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return {
      valid: false,
      error: 'Project name is required',
      suggestions: ['Provide a name like: create-adoniscommerce my-store'],
    }
  }

  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return {
      valid: false,
      error: 'Project name can only contain alphanumeric characters, hyphens, and underscores',
      suggestions: ['Use a name like: my-store, my_store, or mystore'],
    }
  }

  if (name.length > 214) {
    return {
      valid: false,
      error: 'Project name is too long (max 214 characters)',
    }
  }

  const reserved = ['node_modules', 'favicon.ico', 'package.json', 'package-lock.json']
  if (reserved.includes(name.toLowerCase())) {
    return {
      valid: false,
      error: `"${name}" is a reserved name`,
      suggestions: ['Choose a different project name'],
    }
  }

  return { valid: true }
}

export async function checkDirectoryExists(targetDir: string): Promise<boolean> {
  return fs.pathExists(targetDir)
}

export async function isDirectoryEmpty(dir: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dir)
    return files.length === 0
  } catch {
    return true
  }
}

export function validateDatabase(db: string): ValidationResult {
  const valid = ['postgres', 'mysql', 'sqlite'].includes(db)
  if (!valid) {
    return {
      valid: false,
      error: `Invalid database: ${db}`,
      suggestions: ['Use one of: postgres, mysql, sqlite'],
    }
  }
  return { valid: true }
}

export function validatePackageManager(pm: string): ValidationResult {
  const valid = ['pnpm', 'npm', 'yarn', 'bun'].includes(pm)
  if (!valid) {
    return {
      valid: false,
      error: `Invalid package manager: ${pm}`,
      suggestions: ['Use one of: pnpm, npm, yarn, bun'],
    }
  }
  return { valid: true }
}

export function validateTemplate(template: string): ValidationResult {
  const valid = ['default'].includes(template)
  if (!valid) {
    return {
      valid: false,
      error: `Invalid template: ${template}`,
      suggestions: ['Currently only "default" template is available'],
    }
  }
  return { valid: true }
}
