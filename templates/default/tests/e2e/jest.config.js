/** @type {import('jest').Config} */
module.exports = {
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
    },
  },
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
