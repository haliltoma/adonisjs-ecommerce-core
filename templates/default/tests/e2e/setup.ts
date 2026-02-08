import puppeteer, { Browser, Page } from 'puppeteer'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3333'

let browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: parseInt(process.env.SLOW_MO || '0'),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    })
  }
  return browser
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}

export async function createPage(): Promise<Page> {
  const b = await getBrowser()
  const page = await b.newPage()

  await page.setViewport({
    width: 1280,
    height: 720,
  })

  // Set default timeout
  page.setDefaultTimeout(30000)
  page.setDefaultNavigationTimeout(30000)

  return page
}

export function getUrl(path: string): string {
  return `${BASE_URL}${path}`
}

// Test helpers
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto(getUrl('/account/login'))
  await page.waitForSelector('input[name="email"]')

  await page.type('input[name="email"]', email)
  await page.type('input[name="password"]', password)
  await page.click('button[type="submit"]')

  await page.waitForNavigation({ waitUntil: 'networkidle0' })
}

export async function adminLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto(getUrl('/admin/login'))
  await page.waitForSelector('input[name="email"]')

  await page.type('input[name="email"]', email)
  await page.type('input[name="password"]', password)
  await page.click('button[type="submit"]')

  await page.waitForNavigation({ waitUntil: 'networkidle0' })
}

export async function clearCart(page: Page): Promise<void> {
  await page.goto(getUrl('/cart'))

  // Check if cart has items
  const emptyCart = await page.$('.text-center h2')
  if (emptyCart) {
    const text = await page.evaluate(el => el?.textContent, emptyCart)
    if (text?.includes('empty')) return
  }

  // Remove all items
  const removeButtons = await page.$$('button:has-text("Remove")')
  for (const button of removeButtons) {
    await button.click()
    await page.waitForTimeout(500)
  }
}

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const dir = 'tests/e2e/screenshots'
  await page.screenshot({
    path: `${dir}/${name}-${Date.now()}.png`,
    fullPage: true,
  })
}

export async function waitForText(page: Page, text: string, timeout = 10000): Promise<void> {
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    { timeout },
    text
  )
}

export async function fillForm(page: Page, data: Record<string, string>): Promise<void> {
  for (const [name, value] of Object.entries(data)) {
    const input = await page.$(`[name="${name}"]`)
    if (input) {
      await input.click({ clickCount: 3 }) // Select all
      await input.type(value)
    }
  }
}

export async function selectOption(page: Page, selector: string, value: string): Promise<void> {
  await page.select(selector, value)
}

export async function waitForToast(page: Page, message?: string): Promise<void> {
  // Wait for toast notification
  await page.waitForSelector('[role="alert"], .toast, .notification', { timeout: 5000 })

  if (message) {
    await waitForText(page, message)
  }
}

// Generate random test data
export function generateEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`
}

export function generatePhone(): string {
  return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`
}

// Assertion helpers
export async function expectUrl(page: Page, path: string): Promise<void> {
  const url = new URL(page.url())
  if (url.pathname !== path) {
    throw new Error(`Expected URL to be ${path}, but got ${url.pathname}`)
  }
}

export async function expectText(page: Page, selector: string, text: string): Promise<void> {
  const element = await page.$(selector)
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }
  const actualText = await page.evaluate(el => el?.textContent, element)
  if (!actualText?.includes(text)) {
    throw new Error(`Expected text "${text}" not found in element ${selector}. Got: "${actualText}"`)
  }
}

export async function expectElement(page: Page, selector: string): Promise<void> {
  const element = await page.$(selector)
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }
}

export async function expectNoElement(page: Page, selector: string): Promise<void> {
  const element = await page.$(selector)
  if (element) {
    throw new Error(`Element should not exist: ${selector}`)
  }
}
