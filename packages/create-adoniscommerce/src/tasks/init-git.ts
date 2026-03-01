import { execa } from 'execa'
import { logger } from '../ui/logger.js'

export interface GitOptions {
  verbose?: boolean
}

export async function initGit(targetDir: string, options: GitOptions = {}): Promise<void> {
  const { verbose = false } = options

  try {
    // Check if git is available
    await execa('git', ['--version'], { stdio: 'pipe' })
  } catch {
    logger.warn('Git is not installed. Skipping git initialization.')
    return
  }

  try {
    // Check if already a git repo
    try {
      await execa('git', ['rev-parse', '--git-dir'], { cwd: targetDir, stdio: 'pipe' })
      if (verbose) {
        logger.debug('Directory is already a git repository')
      }
      return
    } catch {
      // Not a git repo, continue with init
    }

    // Initialize git
    await execa('git', ['init'], { cwd: targetDir, stdio: 'pipe' })

    if (verbose) {
      logger.debug('Git repository initialized')
    }

    // Stage all files
    await execa('git', ['add', '-A'], { cwd: targetDir, stdio: 'pipe' })

    if (verbose) {
      logger.debug('Files staged')
    }

    // Create initial commit
    await execa(
      'git',
      ['commit', '-m', 'Initial commit from create-adoniscommerce'],
      {
        cwd: targetDir,
        stdio: 'pipe',
        env: {
          ...process.env,
          // Set default git config if not set
          GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || 'AdonisCommerce',
          GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || 'noreply@adoniscommerce.dev',
          GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME || 'AdonisCommerce',
          GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL || 'noreply@adoniscommerce.dev',
        },
      }
    )

    if (verbose) {
      logger.debug('Initial commit created')
    }
  } catch (error) {
    const err = error as Error
    logger.warn(`Git initialization failed: ${err.message}`)
  }
}

export async function isGitInstalled(): Promise<boolean> {
  try {
    await execa('git', ['--version'], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}
