/**
 * FINAL COMPREHENSIVE TEST SUITE
 * Tests all project functions and provides complete system coverage report
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3334'

interface TestResult { category: string; name: string; status: 'PASS' | 'FAIL'; error?: string }
const results: TestResult[] = []
let passed = 0, failed = 0

function test(category: string, name: string, fn: () => Promise<void>) {
  return run(category, name, fn)
}

async function run(category: string, name: string, fn: () => Promise<void>) {
  try {
    await fn()
    passed++
    results.push({ category, name, status: 'PASS' })
    console.log(`  ✅ ${name}`)
  } catch (error: any) {
    failed++
    results.push({ category, name, status: 'FAIL', error: error.message?.slice(0, 50) })
    console.log(`  ❌ ${name}: ${error.message?.slice(0, 60)}`)
  }
}

function expect(actual: any) {
  return {
    toBe: (e: any) => { if (actual !== e) throw new Error(`Expected ${e}, got ${actual}`) },
    toBeOneOf: (arr: any[]) => { if (!arr.includes(actual)) throw new Error(`Expected [${arr.join(', ')}], got ${actual}`) },
    toHaveProperty: (p: string) => { if (!actual || !(p in actual)) throw new Error(`Missing: ${p}`) },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy`) },
    toContain: (s: string) => { if (!actual?.includes?.(s)) throw new Error(`Missing: "${s}"`) },
  }
}

async function fetchJSON(url: string, opts?: any) {
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } })
  let data
  try { data = await res.json() } catch { data = null }
  return { status: res.status, data }
}

async function fetchHTML(url: string) {
  const res = await fetch(url)
  return { status: res.status, text: await res.text() }
}

async function main() {
  console.log('\n' + '═'.repeat(70))
  console.log('       ADONISJS E-COMMERCE - TAM KAPSAMLI TEST RAPORU')
  console.log('═'.repeat(70))
  console.log(`Base: ${BASE_URL}\n`)

  // ─── HEALTH CHECKS ─────────────────────────────────────────────────
  console.log('\n🏥 HEALTH CHECKS')
  console.log('─'.repeat(50))
  await test('Health', 'GET /health OK', async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/health`)
    expect(status).toBe(200)
    expect(data.status).toBe('ok')
  })
  await test('Health', 'GET /health DB check', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/health`)
    expect(data.checks.database).toBeTruthy()
  })

  // ─── PRODUCTS ───────────────────────────────────────────────────
  console.log('\n📦 PRODUCTS')
  console.log('─'.repeat(50))
  await test('Products', 'GET /api/products list', async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/products`)
    expect(status).toBe(200)
    expect(data.data).toBeTruthy()
  })
  await test('Products', 'GET /api/products pagination', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/api/products?page=1&limit=2`)
    expect(data.meta.perPage).toBe(2)
  })
  await test('Products', 'GET /api/products/featured', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/api/products/featured`)
    expect(status).toBe(200)
  })
  await test('Products', 'GET /api/products/search', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/api/products/search?q=phone`)
    expect(status).toBe(200)
  })
  await test('Products', 'GET /api/products/:id valid', async () => {
    const { data } = await fetchJSON(`${BASE_URL}/api/products`)
    const p = data.data[0]
    const { status } = await fetchJSON(`${BASE_URL}/api/products/${p.id}`)
    expect(status).toBe(200)
  })
  await test('Products', 'GET /api/products/:id invalid', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/api/products/invalid-uuid`)
    expect(status).toBe(404)
  })

  // ─── CATEGORIES ─────────────────────────────────────────────────
  console.log('\n📂 CATEGORIES')
  console.log('─'.repeat(50))
  await test('Categories', 'GET /api/categories list', async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/categories`)
    expect(status).toBe(200)
    expect(data.data).toBeTruthy()
  })
  await test('Categories', 'GET /api/categories/tree', async () => {
    const { status } = await fetchJSON(`${BASE_URL}/api/categories/tree`)
    expect(status).toBe(200)
  })

  // ─── CART ───────────────────────────────────────────────────────
  console.log('\n🛒 CART')
  console.log('─'.repeat(50))
  await test('Cart', 'GET /api/cart returns structure', async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/cart`)
    expect(status).toBe(200)
    expect(data.data.items).toBeTruthy()
  })

  // ─── STORE ───────────────────────────────────────────────────────
  console.log('\n🏪 STORE')
  console.log('─'.repeat(50))
  await test('Store', 'GET /api/store info', async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/store`)
    expect(status).toBe(200)
    expect(data.data.name).toBeTruthy()
  })

  // ─── STOREFRONT PAGES ───────────────────────────────────────────
  console.log('\n🌐 STOREFRONT PAGES')
  console.log('─'.repeat(50))
  await test('Storefront', 'GET / (home)', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /products', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/products`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /cart', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/cart`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /checkout', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/checkout`)
    expect(status).toBeOneOf([200, 302])
  })
  await test('Storefront', 'GET /account/login', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/account/login`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /account/register', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/account/register`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /about', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/about`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /contact', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/contact`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /search', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/search`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /blog', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/blog`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /categories', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/categories`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /collections', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/collections`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /compare', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/compare`)
    expect(status).toBe(200)
  })
  await test('Storefront', 'GET /order-tracking', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/order-tracking`)
    expect(status).toBe(200)
  })

  // ─── SEO ROUTES ─────────────────────────────────────────────────
  console.log('\n🅾️ SEO ROUTES')
  console.log('─'.repeat(50))
  await test('SEO', 'GET /robots.txt', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/robots.txt`)
    expect(status).toBe(200)
  })
  await test('SEO', 'GET /sitemap.xml', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/sitemap.xml`)
    expect(status).toBe(200)
  })

  // ─── PAGES ─────────────────────────────────────────────────────
  console.log('\n📄 STATIC PAGES')
  console.log('─'.repeat(50))
  await test('Pages', 'GET /shipping', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/shipping`)
    expect(status).toBe(200)
  })
  await test('Pages', 'GET /returns', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/returns`)
    expect(status).toBe(200)
  })
  await test('Pages', 'GET /faq', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/faq`)
    expect(status).toBe(200)
  })
  await test('Pages', 'GET /privacy', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/privacy`)
    expect(status).toBe(200)
  })
  await test('Pages', 'GET /terms', async () => {
    const { status } = await fetchHTML(`${BASE_URL}/terms`)
    expect(status).toBe(200)
  })

  // ─── SUMMARY ───────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70))
  console.log('                    SONUÇ RAPORU')
  console.log('═'.repeat(70))

  const byCategory: Record<string, { pass: number; fail: number }> = {}
  results.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = { pass: 0, fail: 0 }
    r.status === 'PASS' ? byCategory[r.category].pass++ : byCategory[r.category].fail++
  })

  console.log('\n📊 Kategori Bazlı:')
  Object.entries(byCategory).forEach(([cat, stats]) => {
    const total = stats.pass + stats.fail
    const rate = ((stats.pass / total) * 100).toFixed(0)
    console.log(`   ${cat}: ${stats.pass}/${total} (${rate}%)`)
  })

  console.log(`\n📈 Toplam: ${passed} geçti, ${failed} kaldı`)
  console.log(`   Başarı: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n❌ Başarısız Testler:')
    results.filter(r => r.status === 'FAIL').forEach(r =>
      console.log(`   - ${r.category}: ${r.name}`)
    )
  }

  console.log('\n' + '═'.repeat(70))

  // Write results to file
  const fs = await import('fs')
  const report = {
    date: new Date().toISOString(),
    total: passed + failed,
    passed,
    failed,
    successRate: ((passed / (passed + failed)) * 100).toFixed(1),
    byCategory,
    failedTests: results.filter(r => r.status === 'FAIL').map(r => ({ category: r.category, name: r.name, error: r.error }))
  }

  fs.writeFileSync('tests/test-results.json', JSON.stringify(report, null, 2))
  console.log('\n📄 Sonuçlar: tests/test-results.json\n')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)