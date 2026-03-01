import pc from 'picocolors'

export interface Logger {
  info: (message: string) => void
  success: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
  step: (message: string) => void
  dim: (message: string) => void
}

let verboseMode = false

export function setVerbose(verbose: boolean): void {
  verboseMode = verbose
}

export const logger: Logger = {
  info(message: string) {
    console.log(`  ${pc.blue('●')} ${message}`)
  },

  success(message: string) {
    console.log(`  ${pc.green('✔')} ${message}`)
  },

  warn(message: string) {
    console.log(`  ${pc.yellow('⚠')} ${pc.yellow(message)}`)
  },

  error(message: string) {
    console.log(`  ${pc.red('✖')} ${pc.red(message)}`)
  },

  debug(message: string) {
    if (verboseMode) {
      console.log(`  ${pc.dim('▸')} ${pc.dim(message)}`)
    }
  },

  step(message: string) {
    console.log(`  ${pc.magenta('◇')} ${message}`)
  },

  dim(message: string) {
    console.log(`  ${pc.dim(message)}`)
  },
}

export function formatCommand(cmd: string): string {
  return pc.cyan(cmd)
}

export function formatPath(path: string): string {
  return pc.green(path)
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
