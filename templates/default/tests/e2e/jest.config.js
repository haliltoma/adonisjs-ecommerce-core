import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'))

/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['./jest.setup.ts'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  maxWorkers: 1, // Run tests serially for E2E
  globals: {
    'ts-jest': {
      tsconfig: '../../tsconfig.json',
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^#tests/(.*)$': '<rootDir>/tests/$1',
    '^#app/(.*)$': '<rootDir>/app/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '../../tsconfig.json',
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-reports/e2e',
        filename: 'report.html',
        openReport: false,
        expand: true,
      },
    ],
  ],
}
