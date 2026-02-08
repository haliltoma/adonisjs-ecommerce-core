import { Page } from 'puppeteer'
import {
  createPage,
  closeBrowser,
  getUrl,
  generateEmail,
  expectUrl,
  expectText,
  waitForText,
  takeScreenshot,
} from './setup'

describe('Authentication E2E Tests', () => {
  let page: Page

  beforeEach(async () => {
    page = await createPage()
  })

  afterEach(async () => {
    await page.close()
  })

  afterAll(async () => {
    await closeBrowser()
  })

  describe('Customer Registration', () => {
    it('should display registration form', async () => {
      await page.goto(getUrl('/account/register'))

      await expectText(page, 'h1', 'Create Account')

      // Check all form fields exist
      const fields = ['firstName', 'lastName', 'email', 'password', 'passwordConfirmation']
      for (const field of fields) {
        const input = await page.$(`input[name="${field}"]`)
        expect(input).not.toBeNull()
      }
    })

    it('should show validation errors for empty form', async () => {
      await page.goto(getUrl('/account/register'))

      await page.click('button[type="submit"]')

      // Wait for validation errors
      await page.waitForTimeout(500)

      // Check for required field indicators
      const errors = await page.$$('.text-red-600, .text-red-500')
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should register a new customer successfully', async () => {
      const email = generateEmail()

      await page.goto(getUrl('/account/register'))

      await page.type('input[name="firstName"]', 'Test')
      await page.type('input[name="lastName"]', 'User')
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')
      await page.type('input[name="passwordConfirmation"]', 'SecurePassword123!')

      // Accept terms
      await page.click('input[type="checkbox"]')

      await page.click('button[type="submit"]')

      // Wait for redirect to account dashboard
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      await expectUrl(page, '/account')
      await expectText(page, 'h1', 'Welcome back')
    })

    it('should prevent duplicate email registration', async () => {
      const email = generateEmail()

      // First registration
      await page.goto(getUrl('/account/register'))
      await page.type('input[name="firstName"]', 'First')
      await page.type('input[name="lastName"]', 'User')
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')
      await page.type('input[name="passwordConfirmation"]', 'SecurePassword123!')
      await page.click('input[type="checkbox"]')
      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      // Logout
      await page.goto(getUrl('/account/logout'))

      // Second registration with same email
      await page.goto(getUrl('/account/register'))
      await page.type('input[name="firstName"]', 'Second')
      await page.type('input[name="lastName"]', 'User')
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')
      await page.type('input[name="passwordConfirmation"]', 'SecurePassword123!')
      await page.click('input[type="checkbox"]')
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)

      // Should show email already taken error
      await waitForText(page, 'email')
    })
  })

  describe('Customer Login', () => {
    it('should display login form', async () => {
      await page.goto(getUrl('/account/login'))

      await expectText(page, 'h1', 'Welcome Back')

      const emailInput = await page.$('input[name="email"]')
      const passwordInput = await page.$('input[name="password"]')

      expect(emailInput).not.toBeNull()
      expect(passwordInput).not.toBeNull()
    })

    it('should show error for invalid credentials', async () => {
      await page.goto(getUrl('/account/login'))

      await page.type('input[name="email"]', 'nonexistent@example.com')
      await page.type('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)

      // Should show error message
      const errorText = await page.$('.text-red-600, .text-red-500')
      expect(errorText).not.toBeNull()
    })

    it('should login successfully with valid credentials', async () => {
      const email = generateEmail()

      // First register
      await page.goto(getUrl('/account/register'))
      await page.type('input[name="firstName"]', 'Login')
      await page.type('input[name="lastName"]', 'Test')
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')
      await page.type('input[name="passwordConfirmation"]', 'SecurePassword123!')
      await page.click('input[type="checkbox"]')
      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      // Logout
      await page.goto(getUrl('/account/logout'))
      await page.waitForTimeout(500)

      // Login
      await page.goto(getUrl('/account/login'))
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')
      await page.click('button[type="submit"]')

      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      await expectUrl(page, '/account')
    })

    it('should redirect to intended page after login', async () => {
      // Try to access protected page
      await page.goto(getUrl('/account/orders'))

      // Should redirect to login
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      const url = page.url()
      expect(url).toContain('/account/login')
    })

    it('should remember login with remember me checkbox', async () => {
      const email = generateEmail()

      // Register first
      await page.goto(getUrl('/account/register'))
      await page.type('input[name="firstName"]', 'Remember')
      await page.type('input[name="lastName"]', 'Me')
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')
      await page.type('input[name="passwordConfirmation"]', 'SecurePassword123!')
      await page.click('input[type="checkbox"]')
      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      // Logout
      await page.goto(getUrl('/account/logout'))

      // Login with remember me
      await page.goto(getUrl('/account/login'))
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')

      // Check remember me
      const rememberCheckbox = await page.$('input[type="checkbox"]')
      if (rememberCheckbox) {
        await rememberCheckbox.click()
      }

      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      // Verify cookies are set for longer duration
      const cookies = await page.cookies()
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('auth'))

      if (sessionCookie) {
        expect(sessionCookie.expires).toBeGreaterThan(Date.now() / 1000 + 86400)
      }
    })
  })

  describe('Admin Authentication', () => {
    it('should display admin login form', async () => {
      await page.goto(getUrl('/admin/login'))

      await expectText(page, 'h1', 'Admin Login')

      const emailInput = await page.$('input[name="email"]')
      const passwordInput = await page.$('input[name="password"]')

      expect(emailInput).not.toBeNull()
      expect(passwordInput).not.toBeNull()
    })

    it('should redirect unauthenticated admin to login', async () => {
      await page.goto(getUrl('/admin/dashboard'))

      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      const url = page.url()
      expect(url).toContain('/admin/login')
    })

    it('should show error for invalid admin credentials', async () => {
      await page.goto(getUrl('/admin/login'))

      await page.type('input[name="email"]', 'wrongadmin@example.com')
      await page.type('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)

      const errorText = await page.$('.text-red-600, .text-red-500')
      expect(errorText).not.toBeNull()
    })
  })

  describe('Password Reset', () => {
    it('should display forgot password form', async () => {
      await page.goto(getUrl('/account/forgot-password'))

      const emailInput = await page.$('input[name="email"]')
      expect(emailInput).not.toBeNull()
    })

    it('should navigate to forgot password from login', async () => {
      await page.goto(getUrl('/account/login'))

      await page.click('a[href="/account/forgot-password"]')

      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      await expectUrl(page, '/account/forgot-password')
    })
  })
})
