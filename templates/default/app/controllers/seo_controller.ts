import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Category from '#models/category'
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
   * Lists all indexable pages for search engines
   */
  async sitemap({ response, store }: HttpContext) {
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const storeId = store.id

    // Fetch active products
    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .orderBy('updatedAt', 'desc')
      .select(['slug', 'updatedAt'])

    // Fetch active categories
    const categories = await Category.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .select(['slug', 'updatedAt'])

    const now = new Date().toISOString()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`

    // Add categories
    for (const category of categories) {
      const lastMod = category.updatedAt?.toISO() || now
      xml += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    }

    // Add products
    for (const product of products) {
      const lastMod = product.updatedAt?.toISO() || now
      xml += `
  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    }

    xml += `
</urlset>`

    response.header('Content-Type', 'application/xml; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    return response.send(xml)
  }

  /**
   * Generate sitemap index for large sites
   * Splits sitemap into multiple files if needed
   */
  async sitemapIndex({ response }: HttpContext) {
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const now = new Date().toISOString()

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
