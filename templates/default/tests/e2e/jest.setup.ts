import { closeBrowser } from './setup'

// Increase timeout for all tests
jest.setTimeout(60000)

// Clean up browser after all tests
afterAll(async () => {
  await closeBrowser()
})

// Add custom matchers if needed
expect.extend({
  toContainText(received: string, expected: string) {
    const pass = received.includes(expected)
    return {
      message: () =>
        pass
          ? `expected "${received}" not to contain "${expected}"`
          : `expected "${received}" to contain "${expected}"`,
      pass,
    }
  },
})

// Global test helpers
declare global {
  namespace jest {
    interface Matchers<R> {
      toContainText(expected: string): R
    }
  }
}
