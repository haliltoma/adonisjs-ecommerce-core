#!/usr/bin/env node

import { program } from 'commander'
import prompts from 'prompts'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import validatePackageName from 'validate-npm-package-name'

const TEMPLATE_REPO = 'github:haliltoma/adonisjs-ecommerce-core/templates/default#main'
const VERSION = '1.0.1'

interface ProjectOptions {
  projectName: string
  packageManager: 'pnpm' | 'npm' | 'yarn'
  git: boolean
  install: boolean
  docker: boolean
}

function printBanner() {
  const lines = [
    '',
    '  $$\\                                         $$\\                           $$$$$$\\  ',
    '  $$ |                                        $$ |                         $$  __$$\\ ',
    '  $$ | $$$$$$\\   $$$$$$$\\  $$$$$$\\   $$$$$$\\  $$ |  $$\\  $$$$$$\\   $$$$$$\\ $$ /  \\__|',
    '  $$ | \\____$$\\ $$  _____|$$  __$$\\ $$  __$$\\ $$ | $$  |$$  __$$\\ $$  __$$\\$$$$\\     ',
    '  $$ | $$$$$$$ |\\$$$$$$\\  $$$$$$$$ |$$ |  \\__|$$$$$$  / $$ /  $$ |$$ /  $$ $$  _|    ',
    '  $$ |$$  __$$ | \\____$$\\ $$   ____|$$ |      $$  _$$<  $$ |  $$ |$$ |  $$ $$ |      ',
    '  $$ |\\$$$$$$$ |$$$$$$$  |\\$$$$$$$\\ $$ |      $$ | \\$$\\ \\$$$$$$  |$$$$$$$ $$ |      ',
    '  \\__| \\_______|\\_______/  \\_______|\\__|      \\__|  \\__| \\______/ $$ ____/ \\__|      ',
    '                                                                  $$ |                ',
    '                                                                  $$ |                ',
    '                                                                  \\__|                ',
  ]

  const gradientColors = [
    '#5E35B1', '#5C37B5', '#5939B9', '#573BBD',
    '#543DC1', '#5240C5', '#4F42C9', '#4D44CD',
    '#4A46D1', '#4748D5', '#454AD9', '#424CDD',
  ]

  for (let i = 0; i < lines.length; i++) {
    const color = gradientColors[i % gradientColors.length]
    console.log(chalk.hex(color)(lines[i]))
  }

  console.log()
  console.log(
    chalk.hex('#7C4DFF').bold('  AdonisJS E-Commerce') +
    chalk.gray('  |  ') +
    chalk.hex('#B388FF')(`v${VERSION}`)
  )
  console.log(chalk.gray('  Modern e-commerce platform powered by AdonisJS 6 + React'))
  console.log()
  console.log(chalk.gray('  ─────────────────────────────────────────────────────────'))
  console.log()
}

async function main() {
  printBanner()

  program
    .name('create-adonisjs-ecommerce-core')
    .description('Create a new AdonisJS E-Commerce application')
    .version(VERSION)
    .argument('[project-name]', 'Name of the project')
    .option('-t, --template <name>', 'Template to use', 'default')
    .option('--npm', 'Use npm as package manager')
    .option('--yarn', 'Use yarn as package manager')
    .option('--pnpm', 'Use pnpm as package manager')
    .option('--no-git', 'Skip git initialization')
    .option('--no-install', 'Skip dependency installation')
    .option('--docker', 'Initialize with Docker setup')
    .action(async (projectName, options) => {
      try {
        const config = await getProjectConfig(projectName, options)
        await createProject(config)
      } catch (error) {
        if (error instanceof Error && error.message === 'cancelled') {
          console.log(chalk.yellow('\n✖ Operation cancelled'))
          process.exit(0)
        }
        throw error
      }
    })

  program.parse()
}

async function getProjectConfig(
  projectNameArg: string | undefined,
  cliOptions: Record<string, unknown>
): Promise<ProjectOptions> {
  // Determine package manager from CLI options
  let packageManager: 'pnpm' | 'npm' | 'yarn' = 'pnpm'
  if (cliOptions.npm) packageManager = 'npm'
  else if (cliOptions.yarn) packageManager = 'yarn'
  else if (cliOptions.pnpm) packageManager = 'pnpm'

  const questions: prompts.PromptObject[] = []

  // Project name
  if (!projectNameArg) {
    questions.push({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-store',
      validate: (value: string) => {
        const result = validatePackageName(value)
        if (result.validForNewPackages) return true
        return result.errors?.[0] || 'Invalid project name'
      },
    })
  }

  // Package manager (if not specified via CLI)
  if (!cliOptions.npm && !cliOptions.yarn && !cliOptions.pnpm) {
    questions.push({
      type: 'select',
      name: 'packageManager',
      message: 'Package manager:',
      choices: [
        { title: 'pnpm (recommended)', value: 'pnpm' },
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
      ],
      initial: 0,
    })
  }

  // Docker setup
  if (cliOptions.docker === undefined) {
    questions.push({
      type: 'confirm',
      name: 'docker',
      message: 'Set up Docker environment?',
      initial: true,
    })
  }

  const answers = await prompts(questions, {
    onCancel: () => {
      throw new Error('cancelled')
    },
  })

  return {
    projectName: projectNameArg || answers.projectName,
    packageManager: answers.packageManager || packageManager,
    git: cliOptions.git !== false,
    install: cliOptions.install !== false,
    docker: cliOptions.docker ?? answers.docker ?? true,
  }
}

async function createProject(config: ProjectOptions) {
  const targetDir = path.resolve(process.cwd(), config.projectName)

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${chalk.cyan(config.projectName)} already exists. Overwrite?`,
      initial: false,
    })

    if (!overwrite) {
      console.log(chalk.yellow('✖ Operation cancelled'))
      process.exit(0)
    }

    await fs.remove(targetDir)
  }

  console.log()
  const spinner = ora({
    text: chalk.hex('#B388FF')('Scaffolding your store...'),
    spinner: {
      frames: ['   >', '  >>', ' >>>', '>>>>',  '>>>>', ' >>>', '  >>', '   >'],
      interval: 100,
    },
    color: 'magenta',
  }).start()

  try {
    // Clone template
    spinner.text = chalk.hex('#B388FF')('Downloading template...')
    spinner.spinner = {
      frames: ['   *', '  **', ' ***', '****', '****', ' ***', '  **', '   *'],
      interval: 100,
    }

    // Use degit to download template
    const degit = (await import('degit')).default
    const emitter = degit(TEMPLATE_REPO, {
      cache: false,
      force: true,
      verbose: false,
    })

    await emitter.clone(targetDir)

    // Update package.json
    spinner.text = chalk.hex('#B388FF')('Configuring project...')
    spinner.spinner = {
      frames: ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[ ===]', '[  ==]', '[   =]', '[    ]'],
      interval: 100,
    }
    const packageJsonPath = path.join(targetDir, 'package.json')
    const packageJson = await fs.readJson(packageJsonPath)

    packageJson.name = config.projectName
    packageJson.version = '0.0.1'
    packageJson.private = true

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

    // Create .env from template
    const envDockerPath = path.join(targetDir, '.env.docker')
    const envPath = path.join(targetDir, '.env')

    if (await fs.pathExists(envDockerPath)) {
      await fs.copy(envDockerPath, envPath)

      // Generate a random APP_KEY
      const appKey = generateAppKey()
      let envContent = await fs.readFile(envPath, 'utf-8')
      envContent = envContent.replace(
        /APP_KEY=.*/,
        `APP_KEY=${appKey}`
      )
      await fs.writeFile(envPath, envContent)
    }

    // Remove Docker files if not needed
    if (!config.docker) {
      const dockerFiles = [
        'Dockerfile',
        'Dockerfile.dev',
        'docker-compose.yml',
        'docker-compose.prod.yml',
        '.dockerignore',
        '.env.docker',
        '.env.docker.prod',
        'docker',
      ]

      for (const file of dockerFiles) {
        const filePath = path.join(targetDir, file)
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath)
        }
      }

      // Update package.json to remove docker scripts
      const pkgJson = await fs.readJson(packageJsonPath)
      const scripts = pkgJson.scripts || {}
      Object.keys(scripts).forEach((key) => {
        if (key.startsWith('docker:')) {
          delete scripts[key]
        }
      })
      pkgJson.scripts = scripts
      await fs.writeJson(packageJsonPath, pkgJson, { spaces: 2 })
    }

    spinner.succeed(chalk.hex('#7C4DFF')('Project created'))

    // Initialize git
    if (config.git) {
      spinner.start({
        text: chalk.hex('#B388FF')('Initializing git...'),
        spinner: 'dots',
        color: 'magenta',
      })
      try {
        execSync('git init', { cwd: targetDir, stdio: 'ignore' })
        execSync('git add -A', { cwd: targetDir, stdio: 'ignore' })
        execSync('git commit -m "Initial commit from @adonisjs-ecommerce-core/create"', {
          cwd: targetDir,
          stdio: 'ignore',
        })
        spinner.succeed(chalk.hex('#7C4DFF')('Git initialized'))
      } catch {
        spinner.warn(chalk.yellow('Git initialization failed'))
      }
    }

    // Install dependencies
    if (config.install) {
      spinner.start({
        text: chalk.hex('#B388FF')('Installing dependencies... (this may take a moment)'),
        spinner: {
          frames: ['[>         ]', '[=>        ]', '[==>       ]', '[ ==>      ]', '[  ==>     ]', '[   ==>    ]', '[    ==>   ]', '[     ==>  ]', '[      ==> ]', '[       ==>]', '[        =>]', '[         >]'],
          interval: 80,
        },
        color: 'magenta',
      })
      try {
        const installCmd = getInstallCommand(config.packageManager)
        execSync(installCmd, { cwd: targetDir, stdio: 'ignore' })
        spinner.succeed(chalk.hex('#7C4DFF')('Dependencies installed'))
      } catch {
        spinner.warn(chalk.yellow('Dependency installation failed. Run install manually.'))
      }
    }

    // Success message
    console.log()
    console.log(chalk.gray('  ─────────────────────────────────────────────────────────'))
    console.log()
    console.log(chalk.hex('#7C4DFF').bold('  Your store is ready!'))
    console.log()
    console.log(chalk.white('  Next steps:'))
    console.log()
    console.log(chalk.hex('#B388FF')(`    $ cd ${config.projectName}`))

    if (!config.install) {
      console.log(chalk.hex('#B388FF')(`    $ ${config.packageManager} install`))
    }

    if (config.docker) {
      console.log()
      console.log(chalk.gray('    # Start with Docker (recommended):'))
      console.log(chalk.hex('#B388FF')('    $ make docker-dev'))
      console.log(chalk.hex('#B388FF')('    $ make docker-db-reset'))
      console.log()
      console.log(chalk.gray('    # Or without Docker:'))
    }

    console.log(chalk.hex('#B388FF')(`    $ ${config.packageManager === 'npm' ? 'npm run' : config.packageManager} dev`))
    console.log()
    console.log(chalk.gray('  Docs  ') + chalk.hex('#7C4DFF').underline('https://github.com/haliltoma/adonisjs-ecommerce-core'))
    console.log(chalk.gray('  Web   ') + chalk.hex('#7C4DFF').underline('https://laserkopf.com'))
    console.log(chalk.gray('  Made with ') + chalk.hex('#E040FB')('<3') + chalk.gray(' by ') + chalk.hex('#7C4DFF').bold('laserkopf'))
    console.log()

  } catch (error) {
    spinner.fail('Failed to create project')
    throw error
  }
}

function getInstallCommand(pm: 'pnpm' | 'npm' | 'yarn'): string {
  switch (pm) {
    case 'yarn':
      return 'yarn install'
    case 'npm':
      return 'npm install'
    case 'pnpm':
    default:
      return 'pnpm install'
  }
}

function generateAppKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = ''
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error.message)
  process.exit(1)
})
