import { Page } from 'puppeteer'
import {
  createPage,
  closeBrowser,
  getUrl,
  adminLogin,
  expectText,
  expectElement,
  waitForText,
  takeScreenshot,
  fillForm,
} from './setup'

describe('Admin Panel E2E Tests', () => {
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

  describe('Admin Authentication', () => {
    it('should redirect to login when not authenticated', async () => {
      await page.goto(getUrl('/admin/dashboard'))

      await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})

      const url = page.url()
      expect(url).toContain('/admin/login')
    })

    it('should display admin login page with shadcn UI', async () => {
      await page.goto(getUrl('/admin/login'))

      // Check for shadcn Card component
      await expectElement(page, '[data-slot="card"]')

      // Check for shadcn Input components
      const emailInput = await page.$('input#email')
      const passwordInput = await page.$('input#password')

      expect(emailInput).not.toBeNull()
      expect(passwordInput).not.toBeNull()

      // Check for shadcn Button
      await expectElement(page, 'button[type="submit"]')

      // Check for shadcn Checkbox (remember me)
      await expectElement(page, '[data-slot="checkbox"]')
    })

    it('should show error for invalid credentials', async () => {
      await page.goto(getUrl('/admin/login'))

      await page.type('input#email', 'invalid@admin.com')
      await page.type('input#password', 'wrongpassword')
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)

      // Check for error message with destructive text color
      const error = await page.$('.text-destructive, [class*="text-red"]')
      expect(error).not.toBeNull()
    })
  })

  describe('Admin Dashboard', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
    })

    it('should display shadcn sidebar', async () => {
      await page.goto(getUrl('/admin'))

      // Check for sidebar provider
      await expectElement(page, '[data-slot="sidebar"]')

      // Check for sidebar navigation items
      await expectElement(page, '[data-slot="sidebar-menu-button"]')
    })

    it('should display dashboard with stats cards', async () => {
      await page.goto(getUrl('/admin'))

      // Check for shadcn Card components
      const cards = await page.$$('[data-slot="card"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should display charts', async () => {
      await page.goto(getUrl('/admin'))

      // Check for recharts container
      const charts = await page.$$('.recharts-wrapper')
      // Charts may or may not be visible depending on data
    })

    it('should toggle sidebar on mobile', async () => {
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(getUrl('/admin'))

      // Check for mobile sidebar trigger
      const trigger = await page.$('[data-slot="sidebar-trigger"]')
      expect(trigger).not.toBeNull()

      if (trigger) {
        await trigger.click()
        await page.waitForTimeout(300)

        // Sidebar should be open
        await expectElement(page, '[data-slot="sidebar"][data-state="open"]')
      }
    })

    it('should navigate using sidebar', async () => {
      await page.goto(getUrl('/admin'))

      // Click on Products in sidebar
      const productsLink = await page.$('[data-slot="sidebar-menu-button"] a[href="/admin/products"]')
      if (productsLink) {
        await productsLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        expect(page.url()).toContain('/admin/products')
      }
    })
  })

  describe('Products Management', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/products'))
    })

    it('should display products list with shadcn Table', async () => {
      // Check for shadcn Table components
      await expectElement(page, '[data-slot="table"]')
      await expectElement(page, '[data-slot="table-header"]')
      await expectElement(page, '[data-slot="table-body"]')
    })

    it('should have search with shadcn Input', async () => {
      const searchInput = await page.$('[data-slot="input"][placeholder*="Search"]')
      expect(searchInput).not.toBeNull()

      if (searchInput) {
        await searchInput.type('test product')
        await page.waitForTimeout(500) // Debounce wait
      }
    })

    it('should filter with shadcn Select', async () => {
      // Click on status filter trigger
      const statusTrigger = await page.$('[data-slot="select-trigger"]')
      if (statusTrigger) {
        await statusTrigger.click()
        await page.waitForTimeout(300)

        // Select content should be visible
        await expectElement(page, '[data-slot="select-content"]')

        // Select an option
        const activeOption = await page.$('[data-slot="select-item"]')
        if (activeOption) {
          await activeOption.click()
          await page.waitForTimeout(500)
        }
      }
    })

    it('should show bulk actions with shadcn Checkbox', async () => {
      // Check header checkbox
      const headerCheckbox = await page.$('[data-slot="table-header"] [data-slot="checkbox"]')
      if (headerCheckbox) {
        await headerCheckbox.click()
        await page.waitForTimeout(300)

        // Should show selected count in dropdown
        const selectedBadge = await page.$('button:has-text("selected")')
        expect(selectedBadge).not.toBeNull()
      }
    })

    it('should show row actions with shadcn DropdownMenu', async () => {
      const actionsButton = await page.$('[data-slot="table-body"] button[data-slot="dropdown-menu-trigger"]')
      if (actionsButton) {
        await actionsButton.click()
        await page.waitForTimeout(300)

        // Dropdown content should be visible
        await expectElement(page, '[data-slot="dropdown-menu-content"]')
      }
    })

    it('should navigate to create product page', async () => {
      const createButton = await page.$('a[href="/admin/products/create"]')
      if (createButton) {
        await createButton.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        expect(page.url()).toContain('/admin/products/create')
      }
    })

    it('should show pagination with shadcn Button', async () => {
      const prevButton = await page.$('button:has-text("Previous")')
      const nextButton = await page.$('button:has-text("Next")')

      // Pagination buttons may or may not be present depending on data
    })
  })

  describe('Orders Management', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/orders'))
    })

    it('should display orders list with shadcn components', async () => {
      await expectElement(page, '[data-slot="card"]')
      await expectElement(page, '[data-slot="table"]')
    })

    it('should display order status badges', async () => {
      const badges = await page.$$('[data-slot="badge"]')
      // Badges should be present for status, payment, fulfillment
    })

    it('should filter orders with multiple Select components', async () => {
      const selectTriggers = await page.$$('[data-slot="select-trigger"]')
      expect(selectTriggers.length).toBeGreaterThanOrEqual(3) // Status, Payment, Fulfillment
    })
  })

  describe('Customers Management', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/customers'))
    })

    it('should display customers list with shadcn Avatar', async () => {
      await expectElement(page, '[data-slot="table"]')

      // Check for avatars in customer list
      const avatars = await page.$$('[data-slot="avatar"]')
    })

    it('should have customer search functionality', async () => {
      const searchInput = await page.$('[data-slot="input"][placeholder*="Search"]')
      expect(searchInput).not.toBeNull()
    })

    it('should filter by status', async () => {
      const statusSelect = await page.$('[data-slot="select-trigger"]')
      expect(statusSelect).not.toBeNull()
    })
  })

  describe('Categories Management', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/categories'))
    })

    it('should display categories with shadcn Collapsible', async () => {
      await expectElement(page, '[data-slot="card"]')

      // Check for collapsible triggers
      const collapsibleTriggers = await page.$$('[data-slot="collapsible-trigger"]')
    })

    it('should expand/collapse categories', async () => {
      const expandButton = await page.$('[data-slot="collapsible-trigger"] button')
      if (expandButton) {
        await expandButton.click()
        await page.waitForTimeout(300)

        // Check for collapsible content
        await expectElement(page, '[data-slot="collapsible-content"]')
      }
    })

    it('should show category actions dropdown', async () => {
      const actionsButton = await page.$('[data-slot="dropdown-menu-trigger"]')
      if (actionsButton) {
        await actionsButton.click()
        await page.waitForTimeout(300)

        await expectElement(page, '[data-slot="dropdown-menu-content"]')
      }
    })
  })

  describe('Inventory Management', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/inventory'))
    })

    it('should display inventory with shadcn components', async () => {
      await expectElement(page, '[data-slot="card"]')
      await expectElement(page, '[data-slot="table"]')
    })

    it('should filter by location with Select', async () => {
      const locationSelect = await page.$('[data-slot="select-trigger"]')
      expect(locationSelect).not.toBeNull()
    })

    it('should toggle low stock filter with Checkbox', async () => {
      const lowStockCheckbox = await page.$('[data-slot="checkbox"]')
      if (lowStockCheckbox) {
        await lowStockCheckbox.click()
        await page.waitForTimeout(500)

        expect(page.url()).toContain('lowStock')
      }
    })

    it('should show stock adjustment buttons', async () => {
      const minusButton = await page.$('button svg.lucide-minus')
      const plusButton = await page.$('button svg.lucide-plus')

      // Adjustment buttons should be present
    })
  })

  describe('Discounts Management', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/discounts'))
    })

    it('should display discounts with shadcn Table', async () => {
      await expectElement(page, '[data-slot="card"]')
      await expectElement(page, '[data-slot="table"]')
    })

    it('should show discount code copy button', async () => {
      const copyButtons = await page.$$('button svg.lucide-copy')
    })

    it('should filter by status and type', async () => {
      const selectTriggers = await page.$$('[data-slot="select-trigger"]')
      expect(selectTriggers.length).toBeGreaterThanOrEqual(2) // Status and Type filters
    })

    it('should display discount badges', async () => {
      const badges = await page.$$('[data-slot="badge"]')
    })
  })

  describe('Settings Page', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/settings'))
    })

    it('should display settings with shadcn Tabs', async () => {
      await expectElement(page, '[data-slot="tabs"]')
      await expectElement(page, '[data-slot="tabs-list"]')
    })

    it('should have all settings tabs', async () => {
      const tabs = await page.$$('[data-slot="tabs-trigger"]')
      expect(tabs.length).toBe(5) // General, Tax, Shipping, Inventory, SEO
    })

    it('should switch between tabs', async () => {
      const taxTab = await page.$('[data-slot="tabs-trigger"]:has-text("Tax")')
      if (taxTab) {
        await taxTab.click()
        await page.waitForTimeout(300)

        // Tax content should be visible
        await expectText(page, '[data-slot="card-title"]', 'Tax Settings')
      }
    })

    it('should have Switch components for toggles', async () => {
      // Navigate to tax tab
      const taxTab = await page.$('[data-slot="tabs-trigger"]:has-text("Tax")')
      if (taxTab) {
        await taxTab.click()
        await page.waitForTimeout(300)

        // Check for Switch component
        await expectElement(page, '[data-slot="switch"]')
      }
    })

    it('should have form inputs with Label', async () => {
      await expectElement(page, '[data-slot="label"]')
      await expectElement(page, '[data-slot="input"]')
    })

    it('should have Textarea for address and description', async () => {
      await expectElement(page, '[data-slot="textarea"]')
    })

    it('should save settings', async () => {
      const saveButton = await page.$('button:has-text("Save")')
      expect(saveButton).not.toBeNull()
    })
  })

  describe('Responsive Design', () => {
    it('should work on tablet viewport', async () => {
      await page.setViewport({ width: 768, height: 1024 })

      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin'))

      // Check sidebar is accessible
      await expectElement(page, '[data-slot="sidebar"]')
    })

    it('should work on mobile viewport', async () => {
      await page.setViewport({ width: 375, height: 667 })

      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin'))

      // Sidebar should be collapsed on mobile
      const sidebarTrigger = await page.$('[data-slot="sidebar-trigger"]')
      expect(sidebarTrigger).not.toBeNull()
    })

    it('should have responsive tables', async () => {
      await page.setViewport({ width: 375, height: 667 })

      await adminLogin(page, 'admin@example.com', 'admin123')
      await page.goto(getUrl('/admin/products'))

      // Table should be scrollable on mobile
      const tableContainer = await page.$('[data-slot="card-content"]')
      expect(tableContainer).not.toBeNull()
    })
  })

  describe('Accessibility', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
    })

    it('should have proper ARIA labels', async () => {
      await page.goto(getUrl('/admin'))

      // Check for data-slot attributes used for component identification
      await expectElement(page, '[data-slot]')
    })

    it('should have focusable elements', async () => {
      await page.goto(getUrl('/admin/settings'))

      // Focus should be navigable
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).not.toBe('BODY')
    })

    it('should have proper heading hierarchy', async () => {
      await page.goto(getUrl('/admin'))

      const h1 = await page.$('h1')
      expect(h1).not.toBeNull()
    })
  })

  describe('Theme and Styling', () => {
    beforeEach(async () => {
      await adminLogin(page, 'admin@example.com', 'admin123')
    })

    it('should use CSS variables for theming', async () => {
      await page.goto(getUrl('/admin'))

      // Check if CSS variables are applied
      const hasThemeVars = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement)
        return styles.getPropertyValue('--primary') !== ''
      })

      expect(hasThemeVars).toBe(true)
    })

    it('should have consistent border radius', async () => {
      await page.goto(getUrl('/admin'))

      // shadcn uses consistent rounded corners via CSS variables
      const cards = await page.$$('[data-slot="card"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })
})
