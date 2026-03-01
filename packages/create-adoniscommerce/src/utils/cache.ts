import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import { CACHE_DIR } from './constants.js'

export interface CacheInfo {
  exists: boolean
  path: string
  templates: string[]
  size: number
  lastModified?: Date
}

export async function getCacheInfo(): Promise<CacheInfo> {
  const cacheDir = path.join(os.homedir(), CACHE_DIR)
  const info: CacheInfo = {
    exists: false,
    path: cacheDir,
    templates: [],
    size: 0,
  }

  if (!(await fs.pathExists(cacheDir))) {
    return info
  }

  info.exists = true

  try {
    const entries = await fs.readdir(cacheDir)
    info.templates = entries

    // Calculate total size
    for (const entry of entries) {
      const entryPath = path.join(cacheDir, entry)
      const stat = await fs.stat(entryPath)
      if (stat.isDirectory()) {
        info.size += await getDirectorySize(entryPath)
      }
    }

    const stat = await fs.stat(cacheDir)
    info.lastModified = stat.mtime
  } catch {
    // Ignore errors
  }

  return info
}

async function getDirectorySize(dir: string): Promise<number> {
  let size = 0

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        size += await getDirectorySize(entryPath)
      } else {
        const stat = await fs.stat(entryPath)
        size += stat.size
      }
    }
  } catch {
    // Ignore errors
  }

  return size
}

export async function clearTemplateCache(templateName?: string): Promise<void> {
  const cacheDir = path.join(os.homedir(), CACHE_DIR)

  if (!(await fs.pathExists(cacheDir))) {
    return
  }

  if (templateName) {
    const templatePath = path.join(cacheDir, templateName)
    if (await fs.pathExists(templatePath)) {
      await fs.remove(templatePath)
    }
  } else {
    await fs.remove(cacheDir)
  }
}

export async function isCached(templateName: string): Promise<boolean> {
  const cacheDir = path.join(os.homedir(), CACHE_DIR, templateName)
  return fs.pathExists(cacheDir)
}

export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
