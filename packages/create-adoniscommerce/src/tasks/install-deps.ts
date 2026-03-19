import { execa } from 'execa'
import fs from 'fs-extra'
import path from 'node:path'
import type { ProjectConfig } from '../types/index.js'
import { getInstallCommand } from '../utils/package-manager.js'
import { logger } from '../ui/logger.js'

export interface InstallOptions {
  verbose?: boolean
}

export async function installDependencies(
  targetDir: string,
  config: ProjectConfig,
  options: InstallOptions = {}
): Promise<void> {
  const { verbose = false } = options

  // Check and fix directory permissions before installing
  await ensureDirectoryWritable(targetDir)

  const command = getInstallCommand(config.packageManager)
  const [cmd, ...args] = command.split(' ')

  if (verbose) {
    logger.debug(`Running: ${command}`)
  }

  try {
    const result = await execa(cmd, args, {
      cwd: targetDir,
      stdio: verbose ? 'inherit' : 'pipe',
      env: {
        ...process.env,
        // Disable interactive prompts
        CI: 'true',
        // Fix for npm permission issues
        npm_config_cache: path.join(targetDir, '.npm-cache'),
      },
    })

    if (verbose && result.stdout) {
      logger.debug(result.stdout)
    }
  } catch (error) {
    const err = error as Error & { stderr?: string }
    const errorMessage = err.stderr || err.message

    // Check for permission errors and provide better message
    if (errorMessage.includes('EACCES') || errorMessage.includes('permission denied')) {
      throw new Error(
        `Permission denied while installing dependencies. This is usually caused by incorrect file ownership or npm cache permissions.\n\n` +
        `Try these solutions:\n` +
        `1. Fix npm permissions: npm config set prefix '~/.npm-global'\n` +
        `2. Or run: sudo chown -R $(whoami) ~/.npm\n` +
        `3. Or use a different package manager (pnpm recommended): --pm pnpm\n\n` +
        `Error: ${err.message}`
      )
    }

    throw new Error(`Failed to install dependencies: ${err.message}${err.stderr ? '\n' + err.stderr : ''}`)
  }
}

async function ensureDirectoryWritable(dir: string): Promise<void> {
  try {
    const stats = await fs.stat(dir)

    // Check if directory is writable
    const writable = await checkDirWritable(dir)
    if (!writable) {
      logger.debug(`Directory ${dir} may have permission issues, attempting to fix...`)
      // Try to make it writable - this might not work without elevated permissions
      await fs.chmod(dir, 0o755)
    }

    // Also check and clean node_modules if it exists with wrong permissions
    const nodeModulesPath = path.join(dir, 'node_modules')
    if (await fs.pathExists(nodeModulesPath)) {
      const nodeModulesWritable = await checkDirWritable(nodeModulesPath)
      if (!nodeModulesWritable) {
        logger.debug('Removing potentially corrupted node_modules...')
        await fs.remove(nodeModulesPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist or other error - let npm handle it
    logger.debug(`Could not check directory permissions: ${(error as Error).message}`)
  }
}

async function checkDirWritable(dir: string): Promise<boolean> {
  try {
    await fs.access(dir, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

export async function checkPackageManagerAvailable(pm: string): Promise<boolean> {
  try {
    await execa(pm, ['--version'], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}
