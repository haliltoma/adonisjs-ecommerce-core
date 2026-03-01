import pc from 'picocolors'
import type { ProjectConfig } from '../types/index.js'

export function printSummary(config: ProjectConfig): void {
  const runCmd = config.packageManager === 'npm' ? 'npm run' : config.packageManager

  console.log()
  console.log(pc.magenta('  ╭─────────────────────────────────────────────────────╮'))
  console.log(pc.magenta('  │') + '                                                     ' + pc.magenta('│'))
  console.log(pc.magenta('  │') + `   ${pc.green('✔')}  ${pc.bold('Your store is ready!')}                          ` + pc.magenta('│'))
  console.log(pc.magenta('  │') + '                                                     ' + pc.magenta('│'))
  console.log(pc.magenta('  │') + `   ${pc.dim('Next steps:')}                                       ` + pc.magenta('│'))
  console.log(pc.magenta('  │') + `   ${pc.cyan(`$ cd ${config.projectName}`)}${' '.repeat(Math.max(0, 36 - config.projectName.length))}` + pc.magenta('│'))

  if (!config.install) {
    console.log(pc.magenta('  │') + `   ${pc.cyan(`$ ${config.packageManager} install`)}                              ` + pc.magenta('│'))
  }

  if (config.docker) {
    console.log(pc.magenta('  │') + `   ${pc.cyan(`$ ${runCmd} docker:dev`)}                           ` + pc.magenta('│'))
    console.log(pc.magenta('  │') + `   ${pc.cyan(`$ ${runCmd} docker:db:reset`)}                      ` + pc.magenta('│'))
  } else {
    console.log(pc.magenta('  │') + `   ${pc.cyan(`$ ${runCmd} db:migrate && ${runCmd} db:seed`)}      ` + pc.magenta('│'))
  }

  console.log(pc.magenta('  │') + `   ${pc.cyan(`$ ${runCmd} dev`)}                                    ` + pc.magenta('│'))
  console.log(pc.magenta('  │') + '                                                     ' + pc.magenta('│'))
  console.log(pc.magenta('  │') + `   ${pc.dim('Open:')} ${pc.underline('http://localhost:3333')}                  ` + pc.magenta('│'))
  console.log(pc.magenta('  │') + '                                                     ' + pc.magenta('│'))
  console.log(pc.magenta('  ╰─────────────────────────────────────────────────────╯'))
  console.log()
}

export function printDryRunSummary(config: ProjectConfig): void {
  console.log()
  console.log(pc.yellow('  ╭─────────────────────────────────────────────────────╮'))
  console.log(pc.yellow('  │') + `   ${pc.bold(pc.yellow('DRY RUN'))} - No changes made                        ` + pc.yellow('│'))
  console.log(pc.yellow('  ╰─────────────────────────────────────────────────────╯'))
  console.log()
  console.log(pc.dim('  Would create project with:'))
  console.log()
  console.log(`  ${pc.dim('•')} Project name: ${pc.cyan(config.projectName)}`)
  console.log(`  ${pc.dim('•')} Template: ${pc.cyan(config.template)}`)
  console.log(`  ${pc.dim('•')} Database: ${pc.cyan(config.database)}`)
  console.log(`  ${pc.dim('•')} Package manager: ${pc.cyan(config.packageManager)}`)
  console.log(`  ${pc.dim('•')} Docker: ${config.docker ? pc.green('yes') : pc.yellow('no')}`)
  console.log(`  ${pc.dim('•')} Git: ${config.git ? pc.green('yes') : pc.yellow('no')}`)
  console.log(`  ${pc.dim('•')} Install deps: ${config.install ? pc.green('yes') : pc.yellow('no')}`)
  console.log()
}

export function printErrorSummary(error: string, suggestions: string[]): void {
  console.log()
  console.log(pc.red('  ╭─────────────────────────────────────────────────────╮'))
  console.log(pc.red('  │') + `   ${pc.bold(pc.red('Error'))}                                            ` + pc.red('│'))
  console.log(pc.red('  ╰─────────────────────────────────────────────────────╯'))
  console.log()
  console.log(`  ${pc.red(error)}`)
  console.log()

  if (suggestions.length > 0) {
    console.log(pc.dim('  Suggestions:'))
    for (const suggestion of suggestions) {
      console.log(`  ${pc.dim('•')} ${suggestion}`)
    }
    console.log()
  }
}
