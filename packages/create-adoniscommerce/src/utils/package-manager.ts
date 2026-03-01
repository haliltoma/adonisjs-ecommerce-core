import type { PackageManager } from '../types/index.js'

export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || ''

  if (userAgent.startsWith('pnpm')) return 'pnpm'
  if (userAgent.startsWith('yarn')) return 'yarn'
  if (userAgent.startsWith('bun')) return 'bun'

  return 'pnpm'
}

export function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case 'yarn':
      return 'yarn install'
    case 'bun':
      return 'bun install'
    case 'npm':
      return 'npm install'
    case 'pnpm':
    default:
      return 'pnpm install'
  }
}

export function getRunCommand(pm: PackageManager, script: string): string {
  switch (pm) {
    case 'npm':
      return `npm run ${script}`
    case 'yarn':
      return `yarn ${script}`
    case 'bun':
      return `bun run ${script}`
    case 'pnpm':
    default:
      return `pnpm ${script}`
  }
}

export function getAddCommand(pm: PackageManager, packages: string[], dev = false): string {
  const devFlag = dev ? '-D' : ''

  switch (pm) {
    case 'yarn':
      return `yarn add ${devFlag} ${packages.join(' ')}`.trim()
    case 'bun':
      return `bun add ${devFlag} ${packages.join(' ')}`.trim()
    case 'npm':
      return `npm install ${devFlag} ${packages.join(' ')}`.trim()
    case 'pnpm':
    default:
      return `pnpm add ${devFlag} ${packages.join(' ')}`.trim()
  }
}

export function getRemoveCommand(pm: PackageManager, packages: string[]): string {
  switch (pm) {
    case 'yarn':
      return `yarn remove ${packages.join(' ')}`
    case 'bun':
      return `bun remove ${packages.join(' ')}`
    case 'npm':
      return `npm uninstall ${packages.join(' ')}`
    case 'pnpm':
    default:
      return `pnpm remove ${packages.join(' ')}`
  }
}
