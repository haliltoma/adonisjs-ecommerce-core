import { execa } from 'execa'
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
      },
    })

    if (verbose && result.stdout) {
      logger.debug(result.stdout)
    }
  } catch (error) {
    const err = error as Error & { stderr?: string }
    throw new Error(`Failed to install dependencies: ${err.message}${err.stderr ? '\n' + err.stderr : ''}`)
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
