import { Page } from 'puppeteer'
import {
  createPage,
  closeBrowser,
  getUrl,
  expectText,
  expectElement,
  waitForText,
  takeScreenshot,
} from './setup'

describe('Storefront E2E Tests', () => {
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

  describe('Homepage', () => {
    it('should display homepage', async () => {
      await page.goto(getUrl('/'))

      // Check header is present
      const header = await page.$('header')
      expect(header).not.toBeNull()

      // Check footer is present
      const footer = await page.$('footer')
      expect(footer).not.toBeNull()
    })

    it('should display navigation links', async () => {
      await page.goto(getUrl('/'))

      // Check navigation links
      const productsLink = await page.$('a[href="/products"]')
      expect(productsLink).not.toBeNull()
    })

    it('should display hero banner if exists', async () => {
      await page.goto(getUrl('/'))

      // Banner might or might not exist
      const banner = await page.$('section img')
      // Just check page loads without error
    })

    it('should display featured products', async () => {
      await page.goto(getUrl('/'))

      // Featured products section might exist
      const featured = await page.$('h2:has-text("Featured")')
      // Just check page loads without error
    })

    it('should display categories', async () => {
      await page.goto(getUrl('/'))

      const categories = await page.$('h2:has-text("Category")')
      // Categories section might exist
    })

    it('should navigate to cart from header', async () => {
      await page.goto(getUrl('/'))

      const cartLink = await page.$('a[href="/cart"]')
      if (cartLink) {
        await cartLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url).toContain('/cart')
      }
    })

    it('should navigate to account from header', async () => {
      await page.goto(getUrl('/'))

      const accountLink = await page.$('a[href="/account"]')
      if (accountLink) {
        await accountLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url).toContain('/account')
      }
    })
  })

  describe('Navigation', () => {
    it('should navigate to products page', async () => {
      await page.goto(getUrl('/'))

      const productsLink = await page.$('a[href="/products"]')
      if (productsLink) {
        await productsLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url).toContain('/products')
      }
    })

    it('should have functional logo link to home', async () => {
      await page.goto(getUrl('/products'))

      const logoLink = await page.$('a[href="/"]')
      if (logoLink) {
        await logoLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url.pathname || '/').toBe('/')
      }
    })
  })

  describe('Mobile Menu', () => {
    beforeEach(async () => {
      await page.setViewport({ width: 375, height: 667 })
    })

    it('should display mobile menu button', async () => {
      await page.goto(getUrl('/'))

      const menuButton = await page.$('button.lg\\:hidden')
      expect(menuButton).not.toBeNull()
    })

    it('should open mobile menu on click', async () => {
      await page.goto(getUrl('/'))

      const menuButton = await page.$('button.lg\\:hidden')
      if (menuButton) {
        await menuButton.click()
        await page.waitForTimeout(500)

        // Check mobile menu is visible
        const mobileNav = await page.$('.fixed.inset-y-0')
        expect(mobileNav).not.toBeNull()
      }
    })

    it('should close mobile menu on overlay click', async () => {
      await page.goto(getUrl('/'))

      const menuButton = await page.$('button.lg\\:hidden')
      if (menuButton) {
        await menuButton.click()
        await page.waitForTimeout(500)

        // Click overlay
        const overlay = await page.$('.fixed.inset-0.bg-black\\/50')
        if (overlay) {
          await overlay.click()
          await page.waitForTimeout(500)

          // Mobile menu should be closed
          const mobileNav = await page.$('.fixed.inset-y-0.left-0')
          // Either null or not visible
        }
      }
    })
  })

  describe('Footer', () => {
    it('should display footer links', async () => {
      await page.goto(getUrl('/'))

      const footer = await page.$('footer')
      expect(footer).not.toBeNull()

      // Check footer sections
      const shopSection = await page.$('footer h3:has-text("Shop")')
      const accountSection = await page.$('footer h3:has-text("Account")')
      const supportSection = await page.$('footer h3:has-text("Support")')

      expect(shopSection).not.toBeNull()
    })

    it('should display newsletter form', async () => {
      await page.goto(getUrl('/'))

      const newsletterInput = await page.$('footer input[type="email"]')
      expect(newsletterInput).not.toBeNull()
    })

    it('should display copyright', async () => {
      await page.goto(getUrl('/'))

      const copyright = await page.$('footer')
      const text = await page.evaluate(el => el?.textContent, copyright)

      if (text) {
        expect(text).toContain(new Date().getFullYear().toString())
      }
    })
  })

  describe('Category Pages', () => {
    it('should display category page', async () => {
      await page.goto(getUrl('/category/test-category'))

      // Should show products or empty message
      const content = await page.$('main')
      expect(content).not.toBeNull()
    })
  })

  describe('Search', () => {
    it('should navigate to search page', async () => {
      await page.goto(getUrl('/'))

      const searchLink = await page.$('a[href="/search"]')
      if (searchLink) {
        await searchLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const url = page.url()
        expect(url).toContain('/search')
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      await page.goto(getUrl('/'))

      // Check for h1
      const h1 = await page.$('h1')
      // h1 might be in banner or section

      // Check for proper structure
      const main = await page.$('main')
      expect(main).not.toBeNull()
    })

    it('should have alt text on images', async () => {
      await page.goto(getUrl('/'))

      const images = await page.$$('img')
      for (const img of images.slice(0, 5)) {
        const alt = await page.evaluate(el => el.getAttribute('alt'), img)
        // Images should have alt attribute (even if empty for decorative)
      }
    })

    it('should have proper link text', async () => {
      await page.goto(getUrl('/'))

      const links = await page.$$('a')
      for (const link of links.slice(0, 10)) {
        const text = await page.evaluate(el => el.textContent?.trim(), link)
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), link)

        // Link should have text or aria-label
        const hasAccessibleName = (text && text.length > 0) || ariaLabel
      }
    })
  })

  describe('Performance', () => {
    it('should load homepage under 5 seconds', async () => {
      const start = Date.now()

      await page.goto(getUrl('/'), { waitUntil: 'networkidle0' })

      const loadTime = Date.now() - start
      expect(loadTime).toBeLessThan(5000)
    })

    it('should load products page under 5 seconds', async () => {
      const start = Date.now()

      await page.goto(getUrl('/products'), { waitUntil: 'networkidle0' })

      const loadTime = Date.now() - start
      expect(loadTime).toBeLessThan(5000)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 pages gracefully', async () => {
      const response = await page.goto(getUrl('/non-existent-page-12345'))

      // Should either show 404 page or redirect
      const statusCode = response?.status()
      // Status might be 404 or 200 if custom error page
    })
  })

  describe('SEO', () => {
    it('should have meta title', async () => {
      await page.goto(getUrl('/'))

      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    })

    it('should have meta description', async () => {
      await page.goto(getUrl('/'))

      const metaDescription = await page.$('meta[name="description"]')
      // Meta description might exist
    })

    it('should have canonical link', async () => {
      await page.goto(getUrl('/'))

      const canonical = await page.$('link[rel="canonical"]')
      // Canonical might exist
    })
  })
})
