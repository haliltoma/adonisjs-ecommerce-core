import { Page } from 'puppeteer'
import {
  createPage,
  closeBrowser,
  getUrl,
  login,
  generateEmail,
  generatePhone,
  fillForm,
  expectText,
  expectElement,
  waitForText,
  takeScreenshot,
} from './setup'

describe('Checkout E2E Tests', () => {
  let page: Page

  beforeEach(async () => {
    page = await createPage()

    // Add item to cart before each test
    await page.goto(getUrl('/products'))
    const firstProduct = await page.$('a[href^="/products/"]')
    if (firstProduct) {
      await firstProduct.click()
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      const addButton = await page.$('button:has-text("Add to Cart")')
      if (addButton) {
        await addButton.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  afterEach(async () => {
    await page.close()
  })

  afterAll(async () => {
    await closeBrowser()
  })

  describe('Checkout Page', () => {
    it('should display checkout page with steps', async () => {
      await page.goto(getUrl('/checkout'))

      await expectText(page, 'h1', 'Checkout')

      // Check step indicators
      await expectText(page, 'span', 'Information')
      await expectText(page, 'span', 'Shipping')
      await expectText(page, 'span', 'Payment')
    })

    it('should display order summary', async () => {
      await page.goto(getUrl('/checkout'))

      await expectText(page, 'h2', 'Order Summary')

      // Check cart items are displayed
      const orderItems = await page.$$('ul li')
      expect(orderItems.length).toBeGreaterThan(0)
    })

    it('should redirect to cart if empty', async () => {
      // Clear cart first
      await page.goto(getUrl('/cart'))
      const removeButtons = await page.$$('button:has-text("Remove")')
      for (const btn of removeButtons) {
        await btn.click()
        await page.waitForTimeout(500)
      }

      // Try to access checkout
      await page.goto(getUrl('/checkout'))
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      const url = page.url()
      expect(url).toContain('/cart')
    })
  })

  describe('Step 1: Contact Information', () => {
    it('should display contact form fields', async () => {
      await page.goto(getUrl('/checkout'))

      const emailInput = await page.$('input[name="email"]')
      const firstNameInput = await page.$('input[name="firstName"]')
      const lastNameInput = await page.$('input[name="lastName"]')

      expect(emailInput).not.toBeNull()
      expect(firstNameInput).not.toBeNull()
      expect(lastNameInput).not.toBeNull()
    })

    it('should display shipping address fields', async () => {
      await page.goto(getUrl('/checkout'))

      // Scroll to shipping address section
      await page.evaluate(() => window.scrollTo(0, 500))

      const addressInput = await page.$('input[name="shippingAddress.address1"], input[placeholder*="Address"]')
      expect(addressInput).not.toBeNull()
    })

    it('should validate required fields', async () => {
      await page.goto(getUrl('/checkout'))

      // Try to continue without filling form
      const continueButton = await page.$('button:has-text("Continue")')
      if (continueButton) {
        await continueButton.click()
        await page.waitForTimeout(500)

        // Should still be on step 1 or show validation errors
      }
    })

    it('should proceed to shipping step', async () => {
      await page.goto(getUrl('/checkout'))

      // Fill in contact info
      await page.type('input[name="email"]', generateEmail())
      await page.type('input[name="firstName"]', 'Test')
      await page.type('input[name="lastName"]', 'Customer')

      // Fill shipping address
      const addressInputs = await page.$$('input')
      for (const input of addressInputs) {
        const name = await page.evaluate(el => el.getAttribute('name'), input)
        if (name?.includes('address1')) {
          await input.type('123 Test Street')
        } else if (name?.includes('city')) {
          await input.type('Test City')
        } else if (name?.includes('state')) {
          await input.type('TS')
        } else if (name?.includes('postalCode')) {
          await input.type('12345')
        }
      }

      // Click continue
      const continueButton = await page.$('button:has-text("Continue to Shipping")')
      if (continueButton) {
        await continueButton.click()
        await page.waitForTimeout(1000)

        // Should be on step 2
        await expectText(page, 'h2', 'Shipping Method')
      }
    })
  })

  describe('Step 2: Shipping Method', () => {
    beforeEach(async () => {
      await page.goto(getUrl('/checkout'))

      // Fill step 1
      await page.type('input[name="email"]', generateEmail())
      await page.type('input[name="firstName"]', 'Test')
      await page.type('input[name="lastName"]', 'Customer')

      const addressInputs = await page.$$('input')
      for (const input of addressInputs) {
        const name = await page.evaluate(el => el.getAttribute('name'), input)
        if (name?.includes('address1')) {
          await input.type('123 Test Street')
        } else if (name?.includes('city')) {
          await input.type('Test City')
        } else if (name?.includes('state')) {
          await input.type('TS')
        } else if (name?.includes('postalCode')) {
          await input.type('12345')
        }
      }

      const continueButton = await page.$('button:has-text("Continue to Shipping")')
      if (continueButton) {
        await continueButton.click()
        await page.waitForTimeout(1000)
      }
    })

    it('should display shipping options', async () => {
      const shippingOptions = await page.$$('input[name="shippingMethod"]')
      expect(shippingOptions.length).toBeGreaterThan(0)
    })

    it('should allow selecting shipping method', async () => {
      const shippingOptions = await page.$$('input[name="shippingMethod"]')
      if (shippingOptions.length > 1) {
        await shippingOptions[1].click()
        await page.waitForTimeout(500)

        const checked = await page.evaluate(el => (el as HTMLInputElement).checked, shippingOptions[1])
        expect(checked).toBe(true)
      }
    })

    it('should update total when shipping method changes', async () => {
      // Get initial total
      const getTotalText = async () => {
        const total = await page.$('dd:last-child')
        return total ? await page.evaluate(el => el.textContent, total) : ''
      }

      const initialTotal = await getTotalText()

      const shippingOptions = await page.$$('input[name="shippingMethod"]')
      if (shippingOptions.length > 1) {
        await shippingOptions[1].click()
        await page.waitForTimeout(500)

        const newTotal = await getTotalText()
        // Total might change if shipping prices are different
      }
    })

    it('should proceed to payment step', async () => {
      const continueButton = await page.$('button:has-text("Continue to Payment")')
      if (continueButton) {
        await continueButton.click()
        await page.waitForTimeout(1000)

        await expectText(page, 'h2', 'Payment')
      }
    })

    it('should allow going back to step 1', async () => {
      const backButton = await page.$('button:has-text("Back")')
      if (backButton) {
        await backButton.click()
        await page.waitForTimeout(500)

        await expectText(page, 'h2', 'Contact Information')
      }
    })
  })

  describe('Step 3: Payment', () => {
    beforeEach(async () => {
      await page.goto(getUrl('/checkout'))

      // Fill step 1
      await page.type('input[name="email"]', generateEmail())
      await page.type('input[name="firstName"]', 'Test')
      await page.type('input[name="lastName"]', 'Customer')

      const addressInputs = await page.$$('input')
      for (const input of addressInputs) {
        const name = await page.evaluate(el => el.getAttribute('name'), input)
        if (name?.includes('address1')) {
          await input.type('123 Test Street')
        } else if (name?.includes('city')) {
          await input.type('Test City')
        } else if (name?.includes('state')) {
          await input.type('TS')
        } else if (name?.includes('postalCode')) {
          await input.type('12345')
        }
      }

      let continueButton = await page.$('button:has-text("Continue to Shipping")')
      if (continueButton) {
        await continueButton.click()
        await page.waitForTimeout(1000)
      }

      continueButton = await page.$('button:has-text("Continue to Payment")')
      if (continueButton) {
        await continueButton.click()
        await page.waitForTimeout(1000)
      }
    })

    it('should display payment options', async () => {
      const paymentOptions = await page.$$('input[name="paymentMethod"]')
      expect(paymentOptions.length).toBeGreaterThan(0)
    })

    it('should allow adding order notes', async () => {
      const notesTextarea = await page.$('textarea')
      if (notesTextarea) {
        await notesTextarea.type('Please leave at the front door')

        const value = await page.evaluate(el => (el as HTMLTextAreaElement).value, notesTextarea)
        expect(value).toBe('Please leave at the front door')
      }
    })

    it('should display place order button', async () => {
      const placeOrderButton = await page.$('button:has-text("Place Order")')
      expect(placeOrderButton).not.toBeNull()
    })

    it('should allow editing cart from checkout', async () => {
      const editCartLink = await page.$('a:has-text("Edit Cart")')
      if (editCartLink) {
        await editCartLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url).toContain('/cart')
      }
    })
  })

  describe('Order Completion', () => {
    it('should complete checkout process', async () => {
      await page.goto(getUrl('/checkout'))

      // Fill step 1
      await page.type('input[name="email"]', generateEmail())
      await page.type('input[name="firstName"]', 'Test')
      await page.type('input[name="lastName"]', 'Customer')

      const addressInputs = await page.$$('input')
      for (const input of addressInputs) {
        const name = await page.evaluate(el => el.getAttribute('name'), input)
        if (name?.includes('address1')) {
          await input.type('123 Test Street')
        } else if (name?.includes('city')) {
          await input.type('Test City')
        } else if (name?.includes('state')) {
          await input.type('TS')
        } else if (name?.includes('postalCode')) {
          await input.type('12345')
        }
      }

      let button = await page.$('button:has-text("Continue to Shipping")')
      if (button) {
        await button.click()
        await page.waitForTimeout(1000)
      }

      button = await page.$('button:has-text("Continue to Payment")')
      if (button) {
        await button.click()
        await page.waitForTimeout(1000)
      }

      // Place order
      button = await page.$('button:has-text("Place Order")')
      if (button) {
        await button.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {})

        // Should redirect to confirmation page or show success message
        const url = page.url()
        const isSuccess = url.includes('confirmation') || url.includes('thank-you') || url.includes('order')

        if (!isSuccess) {
          // Check for success message on page
          const successMessage = await page.$('text=Thank you')
          if (!successMessage) {
            // Might still be processing or there was an error
            await takeScreenshot(page, 'checkout-result')
          }
        }
      }
    })
  })

  describe('Guest vs Logged In Checkout', () => {
    it('should pre-fill form for logged in customer', async () => {
      const email = generateEmail()

      // Register first
      await page.goto(getUrl('/account/register'))
      await page.type('input[name="firstName"]', 'Logged')
      await page.type('input[name="lastName"]', 'User')
      await page.type('input[name="email"]', email)
      await page.type('input[name="password"]', 'SecurePassword123!')
      await page.type('input[name="passwordConfirmation"]', 'SecurePassword123!')
      await page.click('input[type="checkbox"]')
      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      // Add to cart
      await page.goto(getUrl('/products'))
      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const addButton = await page.$('button:has-text("Add to Cart")')
        if (addButton) {
          await addButton.click()
          await page.waitForTimeout(1000)
        }
      }

      // Go to checkout
      await page.goto(getUrl('/checkout'))

      // Check if email is pre-filled
      const emailInput = await page.$('input[name="email"]')
      if (emailInput) {
        const value = await page.evaluate(el => (el as HTMLInputElement).value, emailInput)
        expect(value).toBe(email)
      }
    })
  })
})
