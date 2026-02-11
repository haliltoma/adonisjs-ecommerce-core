import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Category from '#models/category'
import Collection from '#models/collection'
import Page from '#models/page'
import env from '#start/env'

export default class SeoController {
  /**
   * Generate robots.txt
   * Controls search engine crawling behavior
   */
  async robots({ response }: HttpContext) {
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')

    const robotsTxt = `# Robots.txt for AdonisCommerce
# Generated dynamically

User-agent: *
Allow: /
Allow: /products
Allow: /products/*
Allow: /category/*
Allow: /search

# Disallow admin and private areas
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*
Disallow: /account
Disallow: /account/*
Disallow: /cart
Disallow: /checkout
Disallow: /checkout/*

# Disallow query parameters that create duplicate content
Disallow: /*?sort=*
Disallow: /*?page=*
Disallow: /*?minPrice=*
Disallow: /*?maxPrice=*

# Crawl-delay for polite crawling (in seconds)
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Additional directives for specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /
`

    response.header('Content-Type', 'text/plain; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=86400') // Cache for 1 day
    return response.send(robotsTxt)
  }

  /**
   * Generate XML Sitemap
   * Lists all indexable pages for search engines.
   * Includes product images, CMS pages, and collections.
   */
  async sitemap({ response, store }: HttpContext) {
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const storeId = store.id

    // Fetch active products with images
    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .preload('images')
      .orderBy('updatedAt', 'desc')
      .select(['id', 'title', 'slug', 'updatedAt'])

    // Fetch active categories
    const categories = await Category.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .select(['slug', 'updatedAt'])

    // Fetch published CMS pages
    const pages = await Page.query()
      .where('storeId', storeId)
      .where('status', 'published')
      .select(['slug', 'updatedAt'])

    // Fetch active collections
    let collections: Array<{ slug: string; updatedAt: any }> = []
    try {
      collections = await Collection.query()
        .where('storeId', storeId)
        .where('isActive', true)
        .select(['slug', 'updatedAt'])
    } catch {
      // Collection model may not exist
    }

    const now = new Date().toISOString()
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Product Listing -->
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Search -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Static Store Pages -->
  <url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>${baseUrl}/contact</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>${baseUrl}/shipping</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>${baseUrl}/returns</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>${baseUrl}/faq</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
`

    // Categories
    for (const category of categories) {
      const lastMod = category.updatedAt?.toISO() || now
      xml += `
  <url>
    <loc>${baseUrl}/category/${esc(category.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    }

    // Collections
    for (const collection of collections) {
      const lastMod = collection.updatedAt?.toISO?.() || now
      xml += `
  <url>
    <loc>${baseUrl}/collections/${esc(collection.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    }

    // Products with images
    for (const product of products) {
      const lastMod = product.updatedAt?.toISO() || now
      xml += `
  <url>
    <loc>${baseUrl}/products/${esc(product.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`

      // Add product images (Google Image sitemap extension)
      const images = product.images || []
      for (const img of images.slice(0, 10)) {
        if (img.url) {
          const imgUrl = img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`
          xml += `
    <image:image>
      <image:loc>${esc(imgUrl)}</image:loc>
      <image:title>${esc(product.title)}</image:title>
    </image:image>`
        }
      }

      xml += `
  </url>`
    }

    // CMS Pages
    for (const page of pages) {
      const lastMod = page.updatedAt?.toISO() || now
      xml += `
  <url>
    <loc>${baseUrl}/pages/${esc(page.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
    }

    xml += `
</urlset>`

    response.header('Content-Type', 'application/xml; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=3600')
    return response.send(xml)
  }

  /**
   * Generate sitemap index for large sites.
   * Points to /sitemap-products.xml, /sitemap-categories.xml, /sitemap-pages.xml
   */
  async sitemapIndex({ response, store }: HttpContext) {
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const storeId = store.id

    // Count products to decide if we need split sitemaps
    const productCount = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .count('* as total')
      .first()
    const total = Number(productCount?.$extras.total || 0)

    const now = new Date().toISOString()

    // For stores with < 5000 URLs, single sitemap is fine
    if (total < 4000) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`

      response.header('Content-Type', 'application/xml; charset=utf-8')
      response.header('Cache-Control', 'public, max-age=3600')
      return response.send(xml)
    }

    // For large stores, split into separate sitemaps
    const pageCount = Math.ceil(total / 5000)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`

    for (let i = 1; i <= pageCount; i++) {
      xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-products-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
    }

    xml += `
</sitemapindex>`

    response.header('Content-Type', 'application/xml; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=3600')
    return response.send(xml)
  }

  /**
   * Generate JSON-LD organization schema for homepage
   */
  async organizationSchema({ response, store }: HttpContext) {
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const meta = (store.meta || {}) as Record<string, unknown>

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: store.name,
      url: baseUrl,
      logo: store.logoUrl ? `${baseUrl}${store.logoUrl}` : undefined,
      description: (meta.description as string) || undefined,
      contactPoint: meta.contactEmail
        ? {
            '@type': 'ContactPoint',
            email: meta.contactEmail as string,
            telephone: (meta.contactPhone as string) || undefined,
            contactType: 'customer service',
          }
        : undefined,
      sameAs: meta.socialLinks
        ? Object.values(meta.socialLinks as Record<string, string>).filter(Boolean)
        : [],
    }

    response.header('Content-Type', 'application/ld+json; charset=utf-8')
    return response.json(schema)
  }

  /**
   * Generate WebP manifest for PWA support
   */
  async webManifest({ response, store }: HttpContext) {
    const meta = (store.meta || {}) as Record<string, unknown>

    const manifest = {
      name: store.name || 'AdonisCommerce',
      short_name: store.name?.slice(0, 12) || 'Shop',
      description: (meta.description as string) || 'Premium E-Commerce Store',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#1c1917',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      categories: ['shopping', 'lifestyle'],
      lang: store.defaultLocale || 'en',
    }

    response.header('Content-Type', 'application/manifest+json; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=604800') // Cache for 1 week
    return response.json(manifest)
  }
}
