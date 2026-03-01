import * as p from '@clack/prompts'
import pc from 'picocolors'
import fs from 'fs-extra'
import path from 'node:path'
import type { CliOptions, ProjectConfig } from '../types/index.js'
import { printBanner } from '../ui/banner.js'
import { runPrompts } from '../ui/prompts.js'
import { printSummary, printDryRunSummary, printErrorSummary } from '../ui/summary.js'
import { logger, setVerbose, formatPath } from '../ui/logger.js'
import { validateProjectName, validateDatabase, validatePackageManager, validateTemplate } from '../utils/validation.js'
import { cloneTemplate, cacheTemplate } from '../tasks/clone-template.js'
import { configureProject } from '../tasks/configure-project.js'
import { setupDatabase } from '../tasks/setup-database.js'
import { installDependencies, checkPackageManagerAvailable } from '../tasks/install-deps.js'
import { initGit } from '../tasks/init-git.js'
import { handleDocker } from '../tasks/handle-docker.js'
import { runPostInstall } from '../tasks/post-install.js'

export async function create(args: CliOptions & { projectName?: string }): Promise<void> {
  const { verbose = false } = args
  const dryRun = args['dry-run'] || args.dryRun || false

  setVerbose(verbose)

  // Print banner
  printBanner()

  // Validate CLI arguments if provided
  if (args.projectName) {
    const validation = validateProjectName(args.projectName)
    if (!validation.valid) {
      printErrorSummary(validation.error!, validation.suggestions || [])
      process.exit(1)
    }
  }

  if (args.db) {
    const validation = validateDatabase(args.db)
    if (!validation.valid) {
      printErrorSummary(validation.error!, validation.suggestions || [])
      process.exit(1)
    }
  }

  if (args.pm) {
    const validation = validatePackageManager(args.pm)
    if (!validation.valid) {
      printErrorSummary(validation.error!, validation.suggestions || [])
      process.exit(1)
    }
  }

  if (args.template) {
    const validation = validateTemplate(args.template)
    if (!validation.valid) {
      printErrorSummary(validation.error!, validation.suggestions || [])
      process.exit(1)
    }
  }

  // Run prompts
  const config = await runPrompts(args.projectName, args)

  if (!config) {
    process.exit(0)
  }

  // Dry run mode
  if (dryRun) {
    printDryRunSummary(config)
    process.exit(0)
  }

  const targetDir = path.resolve(process.cwd(), config.projectName)

  // Check if directory exists
  if (await fs.pathExists(targetDir)) {
    const shouldOverwrite = await p.confirm({
      message: `Directory ${pc.cyan(config.projectName)} already exists. Overwrite?`,
      initialValue: false,
    })

    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      p.cancel('Operation cancelled.')
      process.exit(0)
    }

    await fs.remove(targetDir)
  }

  // Check if package manager is available
  if (config.install) {
    const pmAvailable = await checkPackageManagerAvailable(config.packageManager)
    if (!pmAvailable) {
      logger.warn(`${config.packageManager} is not installed. Dependencies will not be installed.`)
      config.install = false
    }
  }

  console.log()

  // Start the spinner
  const spinner = p.spinner()

  try {
    // Clone template
    spinner.start('Cloning template...')
    await cloneTemplate(targetDir, config, { offline: args.offline, verbose })
    spinner.stop('Template cloned')

    // Configure project
    spinner.start('Configuring project...')
    await configureProject(targetDir, config)
    spinner.stop('Project configured')

    // Setup database
    spinner.start('Setting up database...')
    await setupDatabase(targetDir, config)
    spinner.stop('Database configured')

    // Handle Docker
    spinner.start('Handling Docker setup...')
    await handleDocker(targetDir, config)
    spinner.stop(config.docker ? 'Docker setup complete' : 'Docker files removed')

    // Install dependencies
    if (config.install) {
      spinner.start('Installing dependencies...')
      await installDependencies(targetDir, config, { verbose })
      spinner.stop('Dependencies installed')
    }

    // Initialize git
    if (config.git) {
      spinner.start('Initializing git...')
      await initGit(targetDir, { verbose })
      spinner.stop('Git initialized')
    }

    // Post-install cleanup
    spinner.start('Running post-install tasks...')
    await runPostInstall(targetDir, config, { verbose })
    spinner.stop('Post-install complete')

    // Cache template for offline use
    if (!args.offline) {
      try {
        await cacheTemplate(targetDir, config.template)
      } catch {
        // Silently fail caching
      }
    }

    // Print success summary
    p.outro(pc.green('Project created successfully!'))
    printSummary(config)

  } catch (error) {
    spinner.stop('Failed')

    const err = error as Error
    printErrorSummary(err.message, getSuggestions(err))

    // Cleanup on failure
    if (await fs.pathExists(targetDir)) {
      try {
        await fs.remove(targetDir)
        logger.dim('Cleaned up partial project')
      } catch {
        // Ignore cleanup errors
      }
    }

    process.exit(1)
  }
}

function getSuggestions(error: Error): string[] {
  const message = error.message.toLowerCase()
  const suggestions: string[] = []

  if (message.includes('network') || message.includes('fetch') || message.includes('clone')) {
    suggestions.push('Check your internet connection')
    suggestions.push('Try using --offline flag if you have a cached template')
    suggestions.push('Check if GitHub is accessible')
  }

  if (message.includes('permission') || message.includes('access')) {
    suggestions.push('Check file permissions')
    suggestions.push('Try running with elevated privileges')
  }

  if (message.includes('disk') || message.includes('space')) {
    suggestions.push('Check available disk space')
    suggestions.push('Clear temporary files and try again')
  }

  if (message.includes('npm') || message.includes('pnpm') || message.includes('yarn')) {
    suggestions.push('Check if your package manager is installed correctly')
    suggestions.push('Try using a different package manager with --pm flag')
    suggestions.push('Clear package manager cache and try again')
  }

  if (suggestions.length === 0) {
    suggestions.push('Try running with --verbose flag for more details')
    suggestions.push('Report this issue at: https://github.com/haliltoma/adonisjs-ecommerce-core/issues')
  }

  return suggestions
}
