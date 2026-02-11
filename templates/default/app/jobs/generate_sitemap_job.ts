import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

/**
 * Generate Sitemap Job
 *
 * Builds XML sitemap files from all public URLs.
 * Queue: scheduled
 */
export async function handleGenerateSitemap(job: JobContext): Promise<void> {
  logger.debug('[SitemapJob] Generating sitemap')

  try {
    await job.updateProgress(5)

    const Product = (await import('#models/product')).default
    const Category = (await import('#models/category')).default
    const Page = (await import('#models/page')).default

    const baseUrl = process.env.APP_URL || 'http://localhost:3333'
    const urls: Array<{ loc: string; lastmod?: string; priority: string; changefreq: string }> = []

    // Homepage
    urls.push({ loc: baseUrl, priority: '1.0', changefreq: 'daily' })

    await job.updateProgress(15)

    // Products
    const products = await Product.query()
      .where('status', 'active')
      .select('slug', 'updatedAt')
    for (const product of products) {
      urls.push({
        loc: `${baseUrl}/products/${product.slug}`,
        lastmod: product.updatedAt?.toISODate() ?? undefined,
        priority: '0.8',
        changefreq: 'weekly',
      })
    }

    await job.updateProgress(40)

    // Categories
    const categories = await Category.query()
      .where('isActive', true)
      .select('slug', 'updatedAt')
    for (const category of categories) {
      urls.push({
        loc: `${baseUrl}/categories/${category.slug}`,
        lastmod: category.updatedAt?.toISODate() ?? undefined,
        priority: '0.7',
        changefreq: 'weekly',
      })
    }

    await job.updateProgress(60)

    // CMS Pages
    const pages = await Page.query()
      .where('status', 'published')
      .select('slug', 'updatedAt')
    for (const page of pages) {
      urls.push({
        loc: `${baseUrl}/pages/${page.slug}`,
        lastmod: page.updatedAt?.toISODate() ?? undefined,
        priority: '0.5',
        changefreq: 'monthly',
      })
    }

    await job.updateProgress(75)

    // Static pages
    const staticPages = ['/products', '/categories', '/collections', '/contact', '/search']
    for (const path of staticPages) {
      urls.push({ loc: `${baseUrl}${path}`, priority: '0.6', changefreq: 'weekly' })
    }

    // Build XML
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(
        (u) =>
          `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      ),
      '</urlset>',
    ].join('\n')

    // Write to storage
    const storagePath = app.makePath('storage', 'sitemaps')
    await mkdir(storagePath, { recursive: true })
    await writeFile(join(storagePath, 'sitemap.xml'), xml, 'utf-8')

    // Also write to public for direct serving
    const publicPath = app.publicPath('sitemap.xml')
    await writeFile(publicPath, xml, 'utf-8')

    await job.updateProgress(100)
    logger.info(`[SitemapJob] Sitemap generated with ${urls.length} URLs`)
  } catch (error) {
    logger.error(`[SitemapJob] Failed: ${(error as Error).message}`)
    throw error
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
