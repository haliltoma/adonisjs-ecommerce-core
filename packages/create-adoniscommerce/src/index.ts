import { defineCommand, runMain } from 'citty'
import { create } from './commands/create.js'
import { VERSION } from './utils/constants.js'

const main = defineCommand({
  meta: {
    name: 'create-adoniscommerce',
    version: VERSION,
    description: 'Create a new AdonisCommerce e-commerce application',
  },
  args: {
    projectName: {
      type: 'positional',
      description: 'Name of the project',
      required: false,
    },
    template: {
      type: 'string',
      alias: 't',
      description: 'Template to use (default)',
      default: 'default',
    },
    pm: {
      type: 'string',
      description: 'Package manager (pnpm | npm | yarn | bun)',
    },
    db: {
      type: 'string',
      description: 'Database type (postgres | mysql | sqlite)',
    },
    docker: {
      type: 'boolean',
      description: 'Include Docker setup',
      default: true,
    },
    git: {
      type: 'boolean',
      description: 'Initialize git repository',
      default: true,
    },
    install: {
      type: 'boolean',
      description: 'Install dependencies',
      default: true,
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Non-interactive mode with defaults',
      default: false,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview without executing',
      default: false,
    },
    verbose: {
      type: 'boolean',
      alias: 'v',
      description: 'Verbose output',
      default: false,
    },
    offline: {
      type: 'boolean',
      description: 'Use cached template',
      default: false,
    },
  },
  async run({ args }) {
    await create(args)
  },
})

runMain(main)
