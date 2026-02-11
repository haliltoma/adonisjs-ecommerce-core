import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceGenerateSitemap extends BaseCommand {
  static commandName = 'commerce:generate-sitemap'
  static description = 'Generate sitemap.xml for the storefront'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Generating sitemap...')

    const Product = (await import('#models/product')).default
    const Category = (await import('#models/category')).default
    const Page = (await import('#models/page')).default
    const Store = (await import('#models/store')).default
    const { writeFile, mkdir } = await import('node:fs/promises')
    const { join } = await import('node:path')

    const store = await Store.first()
    if (!store) {
      this.logger.error('No store found')
      return
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3333'
    const urls: { loc: string; lastmod?: string; priority: string; changefreq: string }[] = []

    // Homepage
    urls.push({ loc: baseUrl, priority: '1.0', changefreq: 'daily' })

    // Products
    const products = await Product.query()
      .where('storeId', store.id)
      .where('status', 'active')
      .whereNull('deletedAt')

    for (const product of products) {
      urls.push({
        loc: `${baseUrl}/products/${product.slug}`,
        lastmod: product.updatedAt?.toISO() || undefined,
        priority: '0.8',
        changefreq: 'weekly',
      })
    }

    // Categories
    const categories = await Category.query()
      .where('storeId', store.id)
      .where('isActive', true)

    for (const category of categories) {
      urls.push({
        loc: `${baseUrl}/categories/${category.slug}`,
        lastmod: category.updatedAt?.toISO() || undefined,
        priority: '0.7',
        changefreq: 'weekly',
      })
    }

    // Pages
    const pages = await Page.query()
      .where('storeId', store.id)
      .where('isPublished', true)

    for (const page of pages) {
      urls.push({
        loc: `${baseUrl}/${page.slug}`,
        lastmod: page.updatedAt?.toISO() || undefined,
        priority: '0.5',
        changefreq: 'monthly',
      })
    }

    // Build XML
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n    <priority>${u.priority}</priority>\n    <changefreq>${u.changefreq}</changefreq>\n  </url>`
      ),
      '</urlset>',
    ].join('\n')

    const publicDir = join(this.app.appRoot.pathname, 'public')
    await mkdir(publicDir, { recursive: true })
    await writeFile(join(publicDir, 'sitemap.xml'), xml, 'utf-8')

    this.logger.success(`Sitemap generated with ${urls.length} URLs`)
  }
}
