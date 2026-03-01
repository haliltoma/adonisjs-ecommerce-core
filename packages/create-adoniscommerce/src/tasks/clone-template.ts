import degit from 'degit'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import type { ProjectConfig } from '../types/index.js'
import { TEMPLATE_REPO, CACHE_DIR } from '../utils/constants.js'
import { logger } from '../ui/logger.js'

export interface CloneOptions {
  offline?: boolean
  verbose?: boolean
}

export async function cloneTemplate(
  targetDir: string,
  config: ProjectConfig,
  options: CloneOptions = {}
): Promise<void> {
  const { offline = false, verbose = false } = options

  // Check if we should use cache
  if (offline) {
    const cacheDir = path.join(os.homedir(), CACHE_DIR, config.template)
    if (await fs.pathExists(cacheDir)) {
      if (verbose) {
        logger.debug(`Using cached template from ${cacheDir}`)
      }
      await fs.copy(cacheDir, targetDir)
      return
    }
    logger.warn('No cached template found. Downloading from remote...')
  }

  const emitter = degit(TEMPLATE_REPO, {
    cache: true,
    force: true,
    verbose: verbose,
  })

  emitter.on('info', (info) => {
    if (verbose) {
      logger.debug(info.message)
    }
  })

  emitter.on('warn', (warning) => {
    if (verbose) {
      logger.warn(warning.message)
    }
  })

  // Retry logic
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await emitter.clone(targetDir)
      return
    } catch (error) {
      lastError = error as Error
      if (verbose) {
        logger.debug(`Clone attempt ${attempt} failed: ${lastError.message}`)
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  throw new Error(`Failed to clone template after ${maxRetries} attempts: ${lastError?.message}`)
}

export async function cacheTemplate(sourceDir: string, templateName: string): Promise<void> {
  const cacheDir = path.join(os.homedir(), CACHE_DIR, templateName)
  await fs.ensureDir(path.dirname(cacheDir))
  await fs.copy(sourceDir, cacheDir, { overwrite: true })
}

export async function clearCache(): Promise<void> {
  const cacheDir = path.join(os.homedir(), CACHE_DIR)
  if (await fs.pathExists(cacheDir)) {
    await fs.remove(cacheDir)
  }
}
