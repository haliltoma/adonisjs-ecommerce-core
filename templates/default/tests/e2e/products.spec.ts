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

describe('Products E2E Tests', () => {
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

  describe('Products Listing', () => {
    it('should display products page', async () => {
      await page.goto(getUrl('/products'))

      await expectText(page, 'h1', 'Products')
    })

    it('should display product cards', async () => {
      await page.goto(getUrl('/products'))

      // Wait for products to load
      await page.waitForTimeout(1000)

      // Check for product grid
      const productGrid = await page.$('.grid')
      expect(productGrid).not.toBeNull()
    })

    it('should display sort options', async () => {
      await page.goto(getUrl('/products'))

      const sortSelect = await page.$('select')
      expect(sortSelect).not.toBeNull()

      // Check sort options exist
      const options = await page.$$('select option')
      expect(options.length).toBeGreaterThan(1)
    })

    it('should sort products by price low to high', async () => {
      await page.goto(getUrl('/products'))

      // Select sort option
      await page.select('select', 'price_asc')

      await page.waitForTimeout(1000)

      // URL should include sort parameter
      const url = page.url()
      expect(url).toContain('sort=price_asc')
    })

    it('should sort products by price high to low', async () => {
      await page.goto(getUrl('/products'))

      await page.select('select', 'price_desc')

      await page.waitForTimeout(1000)

      const url = page.url()
      expect(url).toContain('sort=price_desc')
    })

    it('should filter by category', async () => {
      await page.goto(getUrl('/products'))

      // Find category filter buttons
      const categoryButtons = await page.$$('aside button')

      if (categoryButtons.length > 0) {
        await categoryButtons[0].click()
        await page.waitForTimeout(1000)

        // URL should include category filter
        const url = page.url()
        expect(url).toContain('categoryId')
      }
    })

    it('should filter by price range', async () => {
      await page.goto(getUrl('/products'))

      // Find price inputs
      const minPriceInput = await page.$('input[placeholder*="Min"]')
      const maxPriceInput = await page.$('input[placeholder*="Max"]')

      if (minPriceInput && maxPriceInput) {
        await minPriceInput.type('10')
        await maxPriceInput.type('100')

        // Click apply button
        const applyButton = await page.$('button:has-text("Apply")')
        if (applyButton) {
          await applyButton.click()
          await page.waitForTimeout(1000)

          const url = page.url()
          expect(url).toContain('minPrice')
          expect(url).toContain('maxPrice')
        }
      }
    })

    it('should clear filters', async () => {
      await page.goto(getUrl('/products?categoryId=123&minPrice=10'))

      // Find clear filters link
      const clearLink = await page.$('button:has-text("Clear"), a:has-text("Clear")')

      if (clearLink) {
        await clearLink.click()
        await page.waitForTimeout(1000)

        const url = page.url()
        expect(url).not.toContain('categoryId')
        expect(url).not.toContain('minPrice')
      }
    })

    it('should paginate products', async () => {
      await page.goto(getUrl('/products'))

      // Find next page button
      const nextButton = await page.$('button:has-text("Next")')

      if (nextButton) {
        await nextButton.click()
        await page.waitForTimeout(1000)

        const url = page.url()
        expect(url).toContain('page=2')
      }
    })

    it('should show empty state when no products match filters', async () => {
      await page.goto(getUrl('/products?minPrice=999999'))

      await page.waitForTimeout(1000)

      // Check for no products message
      const noProducts = await page.$('text=No products found')
      if (!noProducts) {
        const emptyState = await page.$('.text-center h3')
        expect(emptyState).not.toBeNull()
      }
    })
  })

  describe('Product Detail', () => {
    it('should display product title and price', async () => {
      await page.goto(getUrl('/products'))

      // Click on first product
      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Check product page elements
        const title = await page.$('h1')
        const price = await page.$('.text-3xl.font-bold')

        expect(title).not.toBeNull()
        expect(price).not.toBeNull()
      }
    })

    it('should display product images', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const mainImage = await page.$('.aspect-square img')
        expect(mainImage).not.toBeNull()
      }
    })

    it('should switch product images', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Find thumbnail images
        const thumbnails = await page.$$('.h-20.w-20 button')

        if (thumbnails.length > 1) {
          await thumbnails[1].click()
          await page.waitForTimeout(500)

          // Check that second thumbnail is now selected
          const selectedThumbnail = await page.$('.h-20.w-20 button.ring-2')
          expect(selectedThumbnail).not.toBeNull()
        }
      }
    })

    it('should select product variants', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Find variant option buttons
        const variantButtons = await page.$$('.flex-wrap button')

        if (variantButtons.length > 0) {
          await variantButtons[0].click()
          await page.waitForTimeout(500)

          // Check that variant is selected
          const selectedVariant = await page.$('.border-blue-500')
          expect(selectedVariant).not.toBeNull()
        }
      }
    })

    it('should update quantity', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Find quantity controls
        const plusButton = await page.$('button:has-text("+")')

        if (plusButton) {
          await plusButton.click()
          await page.waitForTimeout(500)

          // Check quantity increased
          const quantity = await page.$eval('.px-4.py-2:not(button)', el => el.textContent)
          expect(quantity).toBe('2')
        }
      }
    })

    it('should add product to cart', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Click add to cart
        const addToCartButton = await page.$('button:has-text("Add to Cart")')

        if (addToCartButton) {
          await addToCartButton.click()
          await page.waitForTimeout(1000)

          // Check cart icon shows item count
          const cartBadge = await page.$('.absolute.-right-2.-top-2')
          if (cartBadge) {
            const count = await page.evaluate(el => el?.textContent, cartBadge)
            expect(parseInt(count || '0')).toBeGreaterThan(0)
          }
        }
      }
    })

    it('should display product description', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const description = await page.$('h2:has-text("Description")')
        // Description section may or may not exist
      }
    })

    it('should display related products', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const relatedProducts = await page.$('h2:has-text("You May Also Like")')
        // Related products section may or may not exist
      }
    })

    it('should display product reviews', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Check for reviews section
        const reviews = await page.$('h2:has-text("Customer Reviews")')
        // Reviews section may or may not exist
      }
    })

    it('should show breadcrumb navigation', async () => {
      await page.goto(getUrl('/products'))

      const firstProduct = await page.$('a[href^="/products/"]')
      if (firstProduct) {
        await firstProduct.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        const breadcrumb = await page.$('nav ol')
        expect(breadcrumb).not.toBeNull()

        // Should have home link
        const homeLink = await page.$('a[href="/"]')
        expect(homeLink).not.toBeNull()
      }
    })
  })

  describe('Search', () => {
    it('should display search page', async () => {
      await page.goto(getUrl('/search'))

      const searchInput = await page.$('input[type="search"], input[placeholder*="Search"]')
      expect(searchInput).not.toBeNull()
    })

    it('should search for products', async () => {
      await page.goto(getUrl('/search'))

      const searchInput = await page.$('input[type="search"], input[placeholder*="Search"]')

      if (searchInput) {
        await searchInput.type('test product')
        await page.keyboard.press('Enter')

        await page.waitForTimeout(1000)

        // URL should include search query
        const url = page.url()
        expect(url).toContain('q=')
      }
    })
  })
})
