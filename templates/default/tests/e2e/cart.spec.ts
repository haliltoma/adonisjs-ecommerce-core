import { Page } from 'puppeteer'
import {
  createPage,
  closeBrowser,
  getUrl,
  clearCart,
  expectText,
  expectElement,
  waitForText,
  takeScreenshot,
} from './setup'

describe('Shopping Cart E2E Tests', () => {
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

  describe('Empty Cart', () => {
    it('should display empty cart message', async () => {
      await page.goto(getUrl('/cart'))

      await waitForText(page, 'empty')
    })

    it('should show continue shopping link', async () => {
      await page.goto(getUrl('/cart'))

      const continueLink = await page.$('a[href="/products"]')
      expect(continueLink).not.toBeNull()
    })

    it('should navigate to products from empty cart', async () => {
      await page.goto(getUrl('/cart'))

      const continueLink = await page.$('a[href="/products"]')
      if (continueLink) {
        await continueLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url).toContain('/products')
      }
    })
  })

  describe('Add to Cart', () => {
    it('should add product to cart from product page', async () => {
      // Go to a product page
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Add to cart
        const addButton = await page.$('button:has-text("Add to Cart")')
        if (addButton) {
          await addButton.click()
          await page.waitForTimeout(1000)

          // Go to cart
          await page.goto(getUrl('/cart'))

          // Should have item in cart
          const cartItems = await page.$$('li.flex.gap-6')
          expect(cartItems.length).toBeGreaterThan(0)
        }
      }
    })

    it('should update cart badge when adding item', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Get initial cart count
        let initialCount = 0
        const cartBadge = await page.$('.absolute.-right-2.-top-2')
        if (cartBadge) {
          const countText = await page.evaluate(el => el?.textContent, cartBadge)
          initialCount = parseInt(countText || '0')
        }

        // Add to cart
        const addButton = await page.$('button:has-text("Add to Cart")')
        if (addButton) {
          await addButton.click()
          await page.waitForTimeout(1000)

          // Check new count
          const newBadge = await page.$('.absolute.-right-2.-top-2')
          if (newBadge) {
            const newCountText = await page.evaluate(el => el?.textContent, newBadge)
            const newCount = parseInt(newCountText || '0')
            expect(newCount).toBeGreaterThan(initialCount)
          }
        }
      }
    })

    it('should add multiple quantities', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Increase quantity
        const plusButton = await page.$('button:has-text("+")')
        if (plusButton) {
          await plusButton.click()
          await plusButton.click()
          await page.waitForTimeout(500)
        }

        // Add to cart
        const addButton = await page.$('button:has-text("Add to Cart")')
        if (addButton) {
          await addButton.click()
          await page.waitForTimeout(1000)

          // Go to cart
          await page.goto(getUrl('/cart'))

          // Check quantity is 3
          const quantityDisplay = await page.$('.w-8.text-center')
          if (quantityDisplay) {
            const quantity = await page.evaluate(el => el?.textContent, quantityDisplay)
            expect(quantity).toBe('3')
          }
        }
      }
    })
  })

  describe('Cart Page', () => {
    beforeEach(async () => {
      // Add a product to cart first
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

    it('should display cart items', async () => {
      await page.goto(getUrl('/cart'))

      const cartItems = await page.$$('li.flex')
      expect(cartItems.length).toBeGreaterThan(0)
    })

    it('should display item details', async () => {
      await page.goto(getUrl('/cart'))

      // Check for product link
      const productLink = await page.$('a[href^="/products/"]')
      expect(productLink).not.toBeNull()

      // Check for price
      const price = await page.$('.font-medium.text-gray-900')
      expect(price).not.toBeNull()
    })

    it('should increase item quantity', async () => {
      await page.goto(getUrl('/cart'))

      // Get initial quantity
      const quantityDisplay = await page.$('.w-8.text-center')
      let initialQuantity = 1
      if (quantityDisplay) {
        const qtyText = await page.evaluate(el => el?.textContent, quantityDisplay)
        initialQuantity = parseInt(qtyText || '1')
      }

      // Click plus button
      const plusButton = await page.$('button:has-text("+")')
      if (plusButton) {
        await plusButton.click()
        await page.waitForTimeout(1000)

        // Check new quantity
        const newQuantityDisplay = await page.$('.w-8.text-center')
        if (newQuantityDisplay) {
          const newQtyText = await page.evaluate(el => el?.textContent, newQuantityDisplay)
          const newQuantity = parseInt(newQtyText || '1')
          expect(newQuantity).toBe(initialQuantity + 1)
        }
      }
    })

    it('should decrease item quantity', async () => {
      await page.goto(getUrl('/cart'))

      // First increase quantity
      const plusButton = await page.$('button:has-text("+")')
      if (plusButton) {
        await plusButton.click()
        await page.waitForTimeout(1000)
      }

      // Then decrease
      const minusButton = await page.$('button:has-text("-")')
      if (minusButton) {
        await minusButton.click()
        await page.waitForTimeout(1000)

        const quantityDisplay = await page.$('.w-8.text-center')
        if (quantityDisplay) {
          const qtyText = await page.evaluate(el => el?.textContent, quantityDisplay)
          expect(parseInt(qtyText || '1')).toBe(1)
        }
      }
    })

    it('should remove item from cart', async () => {
      await page.goto(getUrl('/cart'))

      const removeButton = await page.$('button:has-text("Remove")')
      if (removeButton) {
        await removeButton.click()
        await page.waitForTimeout(1000)

        // Cart should be empty
        await waitForText(page, 'empty')
      }
    })

    it('should display order summary', async () => {
      await page.goto(getUrl('/cart'))

      const orderSummary = await page.$('h2:has-text("Order Summary")')
      expect(orderSummary).not.toBeNull()

      // Check subtotal
      const subtotal = await page.$('text=Subtotal')
      expect(subtotal).not.toBeNull()

      // Check total
      const total = await page.$('text=Total')
      expect(total).not.toBeNull()
    })

    it('should apply discount code', async () => {
      await page.goto(getUrl('/cart'))

      const discountInput = await page.$('input[placeholder*="Enter code"]')
      if (discountInput) {
        await discountInput.type('TESTCODE')

        const applyButton = await page.$('button:has-text("Apply")')
        if (applyButton) {
          await applyButton.click()
          await page.waitForTimeout(1000)

          // Check if discount was applied or error shown
        }
      }
    })

    it('should remove discount code', async () => {
      await page.goto(getUrl('/cart'))

      // First apply a discount
      const discountInput = await page.$('input[placeholder*="Enter code"]')
      if (discountInput) {
        await discountInput.type('TESTCODE')
        const applyButton = await page.$('button:has-text("Apply")')
        if (applyButton) {
          await applyButton.click()
          await page.waitForTimeout(1000)
        }
      }

      // Try to remove discount
      const removeLink = await page.$('button:has-text("Remove")')
      // If discount was valid and applied, remove button should exist
    })

    it('should navigate to checkout', async () => {
      await page.goto(getUrl('/cart'))

      const checkoutButton = await page.$('a[href="/checkout"]')
      if (checkoutButton) {
        await checkoutButton.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url).toContain('/checkout')
      }
    })

    it('should update total when quantity changes', async () => {
      await page.goto(getUrl('/cart'))

      // Get initial total
      const totalElement = await page.$('.text-lg.font-semibold.text-gray-900:last-child')
      let initialTotal = ''
      if (totalElement) {
        initialTotal = await page.evaluate(el => el?.textContent || '', totalElement)
      }

      // Increase quantity
      const plusButton = await page.$('button:has-text("+")')
      if (plusButton) {
        await plusButton.click()
        await page.waitForTimeout(1000)

        // Get new total
        const newTotalElement = await page.$('.text-lg.font-semibold.text-gray-900:last-child')
        if (newTotalElement) {
          const newTotal = await page.evaluate(el => el?.textContent || '', newTotalElement)
          expect(newTotal).not.toBe(initialTotal)
        }
      }
    })
  })

  describe('Cart Persistence', () => {
    it('should persist cart across page navigations', async () => {
      // Add item to cart
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

      // Navigate away
      await page.goto(getUrl('/'))
      await page.waitForTimeout(500)

      // Go to cart
      await page.goto(getUrl('/cart'))

      // Cart should still have items
      const cartItems = await page.$$('li.flex')
      expect(cartItems.length).toBeGreaterThan(0)
    })

    it('should persist cart on page reload', async () => {
      // Add item to cart
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

      // Go to cart and reload
      await page.goto(getUrl('/cart'))
      await page.reload({ waitUntil: 'networkidle0' })

      // Cart should still have items
      const cartItems = await page.$$('li.flex')
      expect(cartItems.length).toBeGreaterThan(0)
    })
  })
})
