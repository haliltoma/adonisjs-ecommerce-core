import pc from 'picocolors'
import { VERSION } from '../utils/constants.js'

export function printBanner(): void {
  const banner = `
${pc.magenta('  ╭─────────────────────────────────────────────────────╮')}
${pc.magenta('  │')}                                                     ${pc.magenta('│')}
${pc.magenta('  │')}   ${pc.bold(pc.magenta('◆  AdonisCommerce'))}  ${pc.dim(`v${VERSION}`)}                       ${pc.magenta('│')}
${pc.magenta('  │')}   ${pc.dim('│')}  ${pc.dim('Modern e-commerce platform')}                     ${pc.magenta('│')}
${pc.magenta('  │')}                                                     ${pc.magenta('│')}
${pc.magenta('  ╰─────────────────────────────────────────────────────╯')}
`
  console.log(banner)
}

export function printMinimalBanner(): void {
  console.log()
  console.log(`  ${pc.bold(pc.magenta('AdonisCommerce'))} ${pc.dim(`v${VERSION}`)}`)
  console.log()
}
