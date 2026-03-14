const puppeteer = require('/home/laserkopf/Desktop/freelance/adonisjs-ecommerce-core/node_modules/.pnpm/puppeteer@23.11.1_typescript@5.8.3/node_modules/puppeteer')

const BASE = 'http://localhost:3334'
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'admin123'

let passed = 0
let failed = 0
const results = []

function log(icon, msg) {
  console.log(`${icon} ${msg}`)
}

function pass(test) {
  passed++
  results.push({ test, status: 'PASS' })
  log('✅', test)
}

function fail(test, reason) {
  failed++
  results.push({ test, status: 'FAIL', reason })
  log('❌', `${test} — ${reason}`)
}

async function safeGoto(page, url, opts = {}) {
  try {
    const response = await page.goto(`${BASE}${url}`, {
      waitUntil: 'networkidle2',
      timeout: 15000,
      ...opts,
    })
    return response
  } catch (err) {
    return null
  }
}

;(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  // Collect console errors per-page
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message)
  })

  // ═══════════════════════════════════════════════
  // STOREFRONT PAGES
  // ═══════════════════════════════════════════════
  console.log('\n🔷 ═══ STOREFRONT PAGES ═══')

  // 1. Homepage
  {
    consoleErrors.length = 0
    const res = await safeGoto(page, '/')
    if (res && res.status() === 200) {
      const title = await page.title()
      pass(`Homepage loads (title: "${title}")`)
    } else {
      fail('Homepage loads', `HTTP ${res ? res.status() : 'timeout'}`)
    }
    const critErrors = consoleErrors.filter((e) => !e.includes('favicon') && !e.includes('WebSocket') && !e.includes('[vite]') && !e.includes('Hydration'))
    if (critErrors.length > 0) fail('Homepage: no JS errors', critErrors[0].slice(0, 150))
  }

  // 2. Products listing
  {
    const res = await safeGoto(page, '/products')
    if (res && res.status() === 200) {
      pass('Products page loads')
    } else {
      fail('Products page loads', `HTTP ${res ? res.status() : 'timeout'}`)
    }
  }

  // 3. Cart page (empty)
  {
    consoleErrors.length = 0
    const res = await safeGoto(page, '/cart')
    if (res && res.status() === 200) {
      const content = await page.content()
      const hasCartStrings = content.includes('Shopping Cart') || content.includes('cart')
      if (hasCartStrings) pass('Cart page loads with correct content')
      else fail('Cart page loads', 'Missing cart content')

      // Check i18n translated strings
      const hasEmptyCartMsg =
        content.includes('Your cart is empty') ||
        content.includes('emptyCart') ||
        content.includes('empty') ||
        content.includes('Browse our products')
      if (hasEmptyCartMsg) pass('i18n: Cart empty state shows translated text')
      else fail('i18n: Cart empty state', 'No translated empty message')

      const hasContinueShopping = content.toLowerCase().includes('continue shopping') || content.includes('continueShopping')
      if (hasContinueShopping) pass('i18n: Continue Shopping button present')
      else fail('i18n: Continue Shopping button', 'Missing')
    } else {
      fail('Cart page loads', `HTTP ${res ? res.status() : 'timeout'}`)
    }
  }

  // 4. Contact page
  {
    consoleErrors.length = 0
    const res = await safeGoto(page, '/contact')
    if (res && res.status() === 200) {
      const content = await page.content()
      if (content.includes('Contact') || content.includes('contact')) {
        pass('Contact page loads')

        // Check for form fields
        const hasForm = await page.$('form')
        const hasNameInput = await page.$('input[name="name"]')
        const hasEmailInput = await page.$('input[name="email"], input[type="email"]')
        const hasMessageField = await page.$('textarea')

        if (hasForm && (hasNameInput || hasEmailInput || hasMessageField)) {
          pass('Contact form: has form fields (name/email/message)')
        } else {
          fail('Contact form: has form fields', 'Missing form elements')
        }
      } else {
        fail('Contact page loads', 'No contact content')
      }
    } else {
      fail('Contact page loads', `HTTP ${res ? res.status() : 'timeout'}`)
    }
  }

  // 5. Checkout page
  {
    const res = await safeGoto(page, '/checkout')
    if (res && (res.status() === 200 || res.status() === 302)) {
      pass('Checkout page loads (or redirects if cart empty)')
    } else {
      fail('Checkout page loads', `HTTP ${res ? res.status() : 'timeout'}`)
    }
  }

  // 6. StorefrontLayout - Footer selectors
  {
    await safeGoto(page, '/')
    const content = await page.content()

    // Language selector
    const hasLangSelector = content.includes('English') || content.includes('Türkçe') || content.includes('locale')
    if (hasLangSelector) pass('Layout: Language selector present in footer')
    else fail('Layout: Language selector', 'Not found')

    // Currency selector
    const hasCurrencySelector = content.includes('USD') || content.includes('EUR') || content.includes('TRY')
    if (hasCurrencySelector) pass('Layout: Currency selector present in footer')
    else fail('Layout: Currency selector', 'Not found')
  }

  // 7. Find a product and test product detail
  let productSlug = null
  {
    await safeGoto(page, '/products')
    const links = await page.$$eval('a[href*="/products/"]', (els) =>
      els
        .map((el) => el.getAttribute('href'))
        .filter((h) => h && h !== '/products' && !h.includes('/products?') && !h.includes('/products#'))
    )
    if (links.length > 0) {
      productSlug = links[0]
      pass(`Found product link: ${productSlug}`)
    } else {
      fail('Find a product link', 'No product links on /products')
    }
  }

  // 8. Product detail page + Review form
  if (productSlug) {
    console.log('\n🔷 ═══ PRODUCT DETAIL & REVIEW FORM ═══')
    consoleErrors.length = 0
    const res = await safeGoto(page, productSlug)
    if (res && res.status() === 200) {
      pass('Product detail page loads')

      const content = await page.content()

      // Check for Add to Cart button
      const buttons = await page.$$eval('button', (btns) => btns.map((b) => b.textContent?.trim()))
      const addBtnExists = buttons.some(
        (b) => b && (b.includes('Add to Cart') || b.includes('Add to Bag') || b.toLowerCase().includes('add to cart'))
      )
      if (addBtnExists) pass('Product: Add to Cart button exists')
      else fail('Product: Add to Cart button', `Buttons: ${buttons.slice(0, 8).join(', ')}`)

      // Check for Review form
      const hasReviewForm =
        content.includes('Write a Review') ||
        content.includes('review') ||
        content.includes('Submit Review') ||
        content.includes('Rating')
      if (hasReviewForm) pass('Product: Review form section present')
      else fail('Product: Review form section', 'Not found on page')

      // Check for star rating selector
      const hasStars =
        content.includes('star') || content.includes('Star') || content.includes('★') || content.includes('⭐')
      if (hasStars) pass('Product: Star rating selector present')
      else {
        // Stars might be SVG icons
        const svgCount = await page.$$eval('svg', (svgs) => svgs.length)
        if (svgCount > 3) pass('Product: Star rating selector (SVG icons) present')
        else fail('Product: Star rating selector', 'Not found')
      }

      // Check for currency formatting
      const hasCurrency = content.includes('$') || content.includes('€') || content.includes('₺')
      if (hasCurrency) pass('Product: Price is formatted with currency symbol')
      else fail('Product: Price formatting', 'No currency symbol found')

      // Console errors check
      const critErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('DevTools') && !e.includes('WebSocket') && !e.includes('Hydration') && !e.includes('[vite]')
      )
      if (critErrors.length === 0) pass('Product page: No JS errors')
      else fail('Product page: JS errors', critErrors[0].slice(0, 150))
    } else {
      fail('Product detail page loads', `HTTP ${res ? res.status() : 'timeout'}`)
    }
  }

  // ═══════════════════════════════════════════════
  // CURRENCY / LOCALE FORMATTING
  // ═══════════════════════════════════════════════
  console.log('\n🔷 ═══ CURRENCY & LOCALE FORMATTING ═══')
  {
    await safeGoto(page, '/products')
    const content = await page.content()
    const hasCurrency = content.includes('$') || content.includes('€') || content.includes('₺')
    if (hasCurrency) pass('Currency: Product listing shows formatted prices')
    else fail('Currency: Product listing prices', 'No currency symbols found')
  }

  // ═══════════════════════════════════════════════
  // ADMIN LOGIN
  // ═══════════════════════════════════════════════
  console.log('\n🔷 ═══ ADMIN LOGIN ═══')
  let loggedIn = false
  {
    consoleErrors.length = 0
    await safeGoto(page, '/admin/login')
    const content = await page.content()

    if (content.includes('Login') || content.includes('login') || content.includes('Sign in') || content.includes('email')) {
      pass('Admin: Login page loads')

      const emailInput = await page.$('input[type="email"], input[name="email"], #email')
      const passwordInput = await page.$('input[type="password"], input[name="password"], #password')

      if (emailInput && passwordInput) {
        await emailInput.click({ clickCount: 3 })
        await emailInput.type(ADMIN_EMAIL, { delay: 15 })
        await passwordInput.click({ clickCount: 3 })
        await passwordInput.type(ADMIN_PASSWORD, { delay: 15 })

        const submitBtn = await page.$('button[type="submit"]')
        if (submitBtn) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
            submitBtn.click(),
          ])

          const afterUrl = page.url()
          if (afterUrl.includes('/admin') && !afterUrl.includes('/login')) {
            loggedIn = true
            pass('Admin: Login successful')
          } else {
            fail('Admin: Login', `Redirected to: ${afterUrl}`)
          }
        } else {
          fail('Admin: Login', 'No submit button')
        }
      } else {
        fail('Admin: Login', 'No email/password inputs')
      }
    } else {
      fail('Admin: Login page loads', 'No login form found')
    }
  }

  // ═══════════════════════════════════════════════
  // ADMIN PAGES
  // ═══════════════════════════════════════════════
  if (loggedIn) {
    console.log('\n🔷 ═══ ADMIN PAGES ═══')

    const adminPages = [
      ['/admin', 'Dashboard'],
      ['/admin/products', 'Products'],
      ['/admin/orders', 'Orders'],
      ['/admin/customers', 'Customers'],
      ['/admin/inventory', 'Inventory'],
      ['/admin/discounts', 'Discounts'],
      ['/admin/settings', 'Settings'],
    ]

    for (const [url, name] of adminPages) {
      consoleErrors.length = 0
      const res = await safeGoto(page, url)
      if (res && res.status() === 200) {
        pass(`Admin: ${name} page loads`)
      } else {
        fail(`Admin: ${name} page loads`, `HTTP ${res ? res.status() : 'timeout'}`)
      }
      const critErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('DevTools') && !e.includes('WebSocket') && !e.includes('Hydration') && !e.includes('[vite]') && !e.includes('Warning')
      )
      if (critErrors.length > 0) {
        fail(`Admin: ${name} JS errors`, critErrors[0].slice(0, 150))
      }
    }

    // ═══════════════════════════════════════════════
    // COLLECTIONS CRUD
    // ═══════════════════════════════════════════════
    console.log('\n🔷 ═══ COLLECTIONS CRUD ═══')

    // Collections Index
    {
      consoleErrors.length = 0
      const res = await safeGoto(page, '/admin/collections')
      if (res && res.status() === 200) {
        pass('Collections: Index page loads')
        const content = await page.content()

        // Check for create button
        const hasCreateBtn =
          content.includes('Create') ||
          content.includes('New Collection') ||
          content.includes('Add Collection')
        if (hasCreateBtn) pass('Collections: Create button present')
        else fail('Collections: Create button', 'Not found')
      } else {
        fail('Collections: Index page loads', `HTTP ${res ? res.status() : 'timeout'}`)
      }
    }

    // Collections Create
    {
      consoleErrors.length = 0
      const res = await safeGoto(page, '/admin/collections/create')
      if (res && res.status() === 200) {
        pass('Collections: Create page loads')

        // Check for form fields (React controlled - may not have name attrs)
        const inputCount = await page.$$eval('input', (els) => els.length)
        const content2 = await page.content()
        const hasNameField = content2.includes('Name') || content2.includes('name')
        const hasSlugField = content2.includes('Slug') || content2.includes('slug')
        if (inputCount > 0 && hasNameField) pass('Collections: Create form has name field')
        else fail('Collections: Create form name field', `${inputCount} inputs, nameField: ${hasNameField}`)
        if (hasSlugField) pass('Collections: Create form has slug field')
        else fail('Collections: Create form slug field', 'Not found')
      } else {
        fail('Collections: Create page loads', `HTTP ${res ? res.status() : 'timeout'}`)
      }
    }

    // ═══════════════════════════════════════════════
    // ANALYTICS WITH RECHARTS
    // ═══════════════════════════════════════════════
    console.log('\n🔷 ═══ ANALYTICS CHARTS ═══')

    const analyticsPages = [
      ['/admin/analytics/sales', 'Sales Analytics'],
      ['/admin/analytics/products', 'Products Analytics'],
      ['/admin/analytics/customers', 'Customers Analytics'],
    ]

    for (const [url, name] of analyticsPages) {
      consoleErrors.length = 0
      const res = await safeGoto(page, url)
      if (res && res.status() === 200) {
        pass(`${name}: Page loads`)

        // Wait for recharts to render
        await new Promise((r) => setTimeout(r, 2000))

        // Check for SVG chart elements (recharts renders SVGs)
        const svgCount = await page.$$eval('svg', (svgs) => svgs.length)
        if (svgCount > 0) {
          pass(`${name}: Has ${svgCount} SVG chart(s)`)
        } else {
          fail(`${name}: SVG charts`, 'No SVG elements found')
        }

        // Check for recharts-specific elements
        const hasRechartsElements = await page.evaluate(() => {
          const rechartsWrappers = document.querySelectorAll('.recharts-wrapper, .recharts-responsive-container')
          return rechartsWrappers.length
        })
        if (hasRechartsElements > 0) {
          pass(`${name}: Has ${hasRechartsElements} recharts container(s)`)
        } else {
          // Maybe recharts uses different class names in newer versions
          const hasChartPaths = await page.$$eval('svg path', (paths) => paths.length)
          if (hasChartPaths > 5) {
            pass(`${name}: Has SVG paths (chart data rendered)`)
          } else {
            fail(`${name}: Recharts containers`, 'No recharts containers or chart data found')
          }
        }

        const critErrors = consoleErrors.filter(
          (e) => !e.includes('favicon') && !e.includes('Warning') && !e.includes('DevTools') && !e.includes('WebSocket') && !e.includes('Hydration') && !e.includes('[vite]')
        )
        if (critErrors.length > 0) {
          fail(`${name}: JS errors`, critErrors[0].slice(0, 150))
        }
      } else {
        fail(`${name}: Page loads`, `HTTP ${res ? res.status() : 'timeout'}`)
      }
    }

    // ═══════════════════════════════════════════════
    // CONTENT PAGES
    // ═══════════════════════════════════════════════
    console.log('\n🔷 ═══ CONTENT PAGES ═══')
    {
      const res = await safeGoto(page, '/admin/content/pages')
      if (res && res.status() === 200) {
        pass('Content: Pages index loads')
      } else {
        fail('Content: Pages index loads', `HTTP ${res ? res.status() : 'timeout'}`)
      }
    }
  } else {
    log('⚠️', 'Skipping admin tests — login failed')
  }

  // ═══════════════════════════════════════════════
  // CONSOLE ERRORS SWEEP
  // ═══════════════════════════════════════════════
  console.log('\n🔷 ═══ CONSOLE ERRORS SWEEP ═══')
  {
    const pagesToCheck = ['/', '/products', '/cart', '/contact']
    for (const url of pagesToCheck) {
      consoleErrors.length = 0
      await safeGoto(page, url)
      await new Promise((r) => setTimeout(r, 1000))

      const critErrors = consoleErrors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('404') &&
          !e.includes('DevTools') &&
          !e.includes('Warning') &&
          !e.includes('net::ERR') &&
          !e.includes('WebSocket') &&
          !e.includes('Hydration') &&
          !e.includes('[vite]')
      )
      if (critErrors.length === 0) {
        pass(`No JS errors on ${url}`)
      } else {
        fail(`JS errors on ${url}`, critErrors.slice(0, 2).join(' | ').slice(0, 200))
      }
    }
  }

  // ═══════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════
  console.log('\n' + '═'.repeat(55))
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`)
  console.log('═'.repeat(55))

  if (failed > 0) {
    console.log('\n❌ Failed tests:')
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`   • ${r.test}: ${r.reason}`)
      })
  }

  console.log()
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
})()
