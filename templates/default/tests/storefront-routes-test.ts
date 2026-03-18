/**
 * STOREFRONT ROUTES TEST SUITE
 * Tests public storefront pages and functionality
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3334'

interface TestResult { name: string; status: 'PASS' | 'FAIL' | 'SKIP'; error?: string }
const results = { passed: 0, failed: 0, skipped: 0, list: [] as TestResult[] }

function test(category: string, name: string, fn: () => Promise<void>) {
  return runTest(`[${category}] ${name}`, fn)
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.passed++
    results.list.push({ name, status: 'PASS' })
    console.log(`  ✅ ${name}`)
  } catch (error: any) {
    if (error.message?.includes('SKIP')) {
      results.skipped++
      results.list.push({ name, status: 'SKIP', error: error.message })
      console.log(`  ⚠️  ${name}: ${error.message}`)
    } else {
      results.failed++
      results.list.push({ name, status: 'FAIL', error: error.message })
      console.log(`  ❌ ${name}: ${error.message}`)
    }
  }
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => { if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`) },
    toBeOneOf: (arr: any[]) => { if (!arr.includes(actual)) throw new Error(`Expected [${arr.join(', ')}], got ${actual}`) },
    toHaveProperty: (prop: string) => { if (!actual || !(prop in actual)) throw new Error(`Missing property: ${prop}`) },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`) },
    toBeType: (type: string) => { if (typeof actual !== type) throw new Error(`Type: ${type}, got ${typeof actual}`) },
    not: { toBe: (v: any) => { if (actual === v) throw new Error(`Should not be ${v}`) } }
  }
}

async function fetchHTML(url: string) {
  const res = await fetch(url)
  const text = await res.text()
  return { status: res.status, text, html: text }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('       STOREFRONT ROUTES - TAM KAPSAMLI TEST')
  console.log('═══════════════════════════════════════════════════════════\n')

  // Home Page
  console.log('🏠 Home Page')
  console.log('─'.repeat(50))
  await test('Home', 'GET / returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/`)
    expect(status).toBe(200)
  })

  await test('Home', 'GET / returns HTML with Inertia', async () => {
    const { html } = await fetchHTML(`${BASE_URL}/`)
    if (!html.includes('Inertia')) {
      // Check for other indicators that Inertia is used
      const hasProps = html.includes('data-page=') || html.includes('inertia')
      if (!hasProps) throw new Error('Page does not appear to be Inertia-based')
    }
  })

  // Products
  console.log('\n📦 Products')
  console.log('─'.repeat(50))
  await test('Products', 'GET /products returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/products`)
    expect(status).toBe(200)
  })

  await test('Products', 'GET /products/:slug returns 200', async () => {
    // First get a product slug from API
    const res = await fetch(`${BASE_URL}/api/products`)
    const data = await res.json()
    const product = data.data[0]
    if (!product) throw new Error('SKIP: No products')

    const { status } = await fetchHTML(`${BASE_URL}/products/${product.slug}`)
    expect(status).toBe(200)
  })

  // Categories
  console.log('\n📂 Categories')
  console.log('─'.repeat(50))
  await test('Categories', 'GET /category/:slug returns 200', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`)
    const data = await res.json()
    const category = data.data[0]
    if (!category) throw new Error('SKIP: No categories')

    const { status } = await fetchHTML(`${BASE_URL}/category/${category.slug}`)
    expect(status).toBe(200)
  })

  await test('Categories', 'GET /categories returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/categories`)
    expect(status).toBe(200)
  })

  // Pages
  console.log('\n📄 Pages')
  console.log('─'.repeat(50))
  await test('Pages', 'GET /about returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/about`)
    expect(status).toBe(200)
  })

  await test('Pages', 'GET /contact returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/contact`)
    expect(status).toBe(200)
  })

  await test('Pages', 'GET /shipping returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/shipping`)
    expect(status).toBe(200)
  })

  await test('Pages', 'GET /returns returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/returns`)
    expect(status).toBe(200)
  })

  await test('Pages', 'GET /faq returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/faq`)
    expect(status).toBe(200)
  })

  await test('Pages', 'GET /privacy returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/privacy`)
    expect(status).toBe(200)
  })

  await test('Pages', 'GET /terms returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/terms`)
    expect(status).toBe(200)
  })

  // Cart & Checkout (should redirect or show page)
  console.log('\n🛒 Cart & Checkout')
  console.log('─'.repeat(50))
  await test('Cart', 'GET /cart returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/cart`)
    expect(status).toBe(200)
  })

  await test('Checkout', 'GET /checkout returns 200 or redirect', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/checkout`)
    expect(status).toBeOneOf([200, 302, 303])
  })

  // Account
  console.log('\n👤 Account')
  console.log('─'.repeat(50))
  await test('Account', 'GET /account/login returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/account/login`)
    expect(status).toBe(200)
  })

  await test('Account', 'GET /account/register returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/account/register`)
    expect(status).toBe(200)
  })

  // Blog
  console.log('\n📝 Blog')
  console.log('─'.repeat(50))
  await test('Blog', 'GET /blog returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/blog`)
    expect(status).toBe(200)
  })

  // Search
  console.log('\n🔍 Search')
  console.log('─'.repeat(50))
  await test('Search', 'GET /search returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/search`)
    expect(status).toBe(200)
  })

  await test('Search', 'GET /search?q=test returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/search?q=smart`)
    expect(status).toBe(200)
  })

  // Order Tracking
  console.log('\n📋 Order Tracking')
  console.log('─'.repeat(50))
  await test('Tracking', 'GET /order-tracking returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/order-tracking`)
    expect(status).toBe(200)
  })

  // Compare
  console.log('\n⚖️ Compare')
  console.log('─'.repeat(50))
  await test('Compare', 'GET /compare returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/compare`)
    expect(status).toBe(200)
  })

  // Collections
  console.log('\n🎁 Collections')
  console.log('─'.repeat(50))
  await test('Collections', 'GET /collections returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/collections`)
    expect(status).toBe(200)
  })

  // SEO Routes
  console.log('\n🅾️ SEO Routes')
  console.log('─'.repeat(50))
  await test('SEO', 'GET /robots.txt returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/robots.txt`)
    expect(status).toBe(200)
  })

  await test('SEO', 'GET /sitemap.xml returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/sitemap.xml`)
    expect(status).toBe(200)
  })

  await test('SEO', 'GET /site.webmanifest returns 200', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/site.webmanifest`)
    expect(status).toBe(200)
  })

  // SUMMARY
  console.log('\n' + '═'.repeat(60))
  console.log('                    SONUÇLAR')
  console.log('═'.repeat(60))
  console.log(`\n  Toplam: ${results.passed + results.failed + results.skipped}`)
  console.log(`  Geçti: ${results.passed} | Kaldı: ${results.failed} | Atlandı: ${results.skipped}`)
  console.log(`  Başarı: ${results.failed === 0 ? '100' : ((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`)

  if (results.failed > 0) {
    console.log('\n  Başarısız:')
    results.list.filter(r => r.status === 'FAIL').forEach(r => console.log(`    - ${r.name}`))
  }
  console.log('═'.repeat(60) + '\n')

  process.exit(results.failed > 0 ? 1 : 0)
}

runTests().catch(console.error)