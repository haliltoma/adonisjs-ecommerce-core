import type { HttpContext } from '@adonisjs/core/http'
import Page from '#models/page'

export default class PagesController {
  /**
   * Convert page content blocks to HTML string
   */
  private contentToHtml(content: { blocks: unknown[] } | null): string {
    if (!content?.blocks?.length) return ''
    return content.blocks
      .map((block: unknown) => {
        const b = block as { type?: string; data?: { text?: string; level?: number } }
        if (b.type === 'paragraph') return `<p>${b.data?.text || ''}</p>`
        if (b.type === 'header') return `<h${b.data?.level || 2}>${b.data?.text || ''}</h${b.data?.level || 2}>`
        return ''
      })
      .join('')
  }

  /**
   * About page
   */
  async about({ inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', 'about')
      .where('status', 'published')
      .first()

    return inertia.render('storefront/About', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: page
        ? {
            title: page.title,
            content: this.contentToHtml(page.content),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
          }
        : null,
    })
  }

  /**
   * Contact page
   */
  async contact({ inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', 'contact')
      .where('status', 'published')
      .first()

    return inertia.render('storefront/Contact', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: page
        ? {
            title: page.title,
            content: this.contentToHtml(page.content),
          }
        : null,
    })
  }

  /**
   * Shipping page
   */
  async shipping({ inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', 'shipping')
      .where('status', 'published')
      .first()

    return inertia.render('storefront/Shipping', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: page
        ? {
            title: page.title,
            content: this.contentToHtml(page.content),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
          }
        : null,
    })
  }

  /**
   * Returns page
   */
  async returns({ inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', 'returns')
      .where('status', 'published')
      .first()

    return inertia.render('storefront/Returns', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: page
        ? {
            title: page.title,
            content: this.contentToHtml(page.content),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
          }
        : null,
    })
  }

  /**
   * FAQ page
   */
  async faq({ inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', 'faq')
      .where('status', 'published')
      .first()

    return inertia.render('storefront/Faq', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: page
        ? {
            title: page.title,
            content: this.contentToHtml(page.content),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
          }
        : null,
    })
  }

  /**
   * Privacy policy page
   */
  async privacy({ inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', 'privacy')
      .where('status', 'published')
      .first()

    return inertia.render('storefront/Privacy', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: page
        ? {
            title: page.title,
            content: this.contentToHtml(page.content),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
          }
        : null,
    })
  }

  /**
   * Terms of service page
   */
  async terms({ inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', 'terms')
      .where('status', 'published')
      .first()

    return inertia.render('storefront/Terms', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: page
        ? {
            title: page.title,
            content: this.contentToHtml(page.content),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
          }
        : null,
    })
  }

  /**
   * Dynamic page by slug
   */
  async show({ params, inertia, response, store }: HttpContext) {
    const page = await Page.query()
      .where('storeId', store.id)
      .where('slug', params.slug)
      .where('status', 'published')
      .first()

    if (!page) {
      return response.notFound({ error: 'Page not found' })
    }

    return inertia.render('storefront/Page', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: {
        title: page.title,
        content: this.contentToHtml(page.content),
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      },
    })
  }
}
