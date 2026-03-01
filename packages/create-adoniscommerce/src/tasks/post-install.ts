import fs from 'fs-extra'
import path from 'node:path'
import type { ProjectConfig } from '../types/index.js'
import { logger } from '../ui/logger.js'

export interface PostInstallOptions {
  verbose?: boolean
}

export async function runPostInstall(
  targetDir: string,
  config: ProjectConfig,
  options: PostInstallOptions = {}
): Promise<void> {
  const { verbose = false } = options

  // Clean up template-specific files
  await cleanupTemplateFiles(targetDir, verbose)

  // Update README if exists
  await updateReadme(targetDir, config, verbose)

  // Remove package-lock.json if using different package manager
  await cleanupLockFiles(targetDir, config, verbose)
}

async function cleanupTemplateFiles(targetDir: string, verbose: boolean): Promise<void> {
  const filesToRemove = [
    'template.json',
    '.github/workflows/template-sync.yml',
  ]

  for (const file of filesToRemove) {
    const filePath = path.join(targetDir, file)
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath)
      if (verbose) {
        logger.debug(`Removed ${file}`)
      }
    }
  }
}

async function updateReadme(targetDir: string, config: ProjectConfig, verbose: boolean): Promise<void> {
  const readmePath = path.join(targetDir, 'README.md')

  if (!(await fs.pathExists(readmePath))) {
    return
  }

  let content = await fs.readFile(readmePath, 'utf-8')

  // Replace template placeholders
  content = content.replace(/{{PROJECT_NAME}}/g, config.projectName)
  content = content.replace(/@adoniscommerce\/template/g, config.projectName)

  await fs.writeFile(readmePath, content, 'utf-8')

  if (verbose) {
    logger.debug('Updated README.md')
  }
}

async function cleanupLockFiles(targetDir: string, config: ProjectConfig, verbose: boolean): Promise<void> {
  const lockFiles: Record<string, string[]> = {
    pnpm: ['package-lock.json', 'yarn.lock', 'bun.lockb'],
    npm: ['pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'],
    yarn: ['package-lock.json', 'pnpm-lock.yaml', 'bun.lockb'],
    bun: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
  }

  const filesToRemove = lockFiles[config.packageManager] || []

  for (const file of filesToRemove) {
    const filePath = path.join(targetDir, file)
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath)
      if (verbose) {
        logger.debug(`Removed ${file}`)
      }
    }
  }
}
