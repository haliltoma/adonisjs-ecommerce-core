import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Page from '#models/page'

const contactValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(200),
    email: vine.string().email().normalizeEmail(),
    subject: vine.string().trim().minLength(1).maxLength(300),
    message: vine.string().trim().minLength(1).maxLength(5000),
  })
)

export default class PagesController {
  /**
   * Convert page content blocks to HTML string
   */
  private contentToHtml(content: Record<string, unknown> | null): string {
    const blocks = content?.blocks as unknown[] | undefined
    if (!blocks?.length) return ''
    return blocks
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
   * Handle contact form submission
   */
  async submitContact({ request, response, session, logger }: HttpContext) {
    const data = await request.validateUsing(contactValidator)

    logger.info({ contactMessage: data }, 'Contact form submission received')

    session.flash('success', 'Thank you for your message!')
    return response.redirect().back()
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

    // Check if content is Puck format (has root + content keys)
    const isPuckContent = page.content && 'root' in page.content && 'content' in page.content

    return inertia.render('storefront/Page', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      page: {
        title: page.title,
        slug: page.slug,
        content: isPuckContent ? null : this.contentToHtml(page.content),
        puckContent: isPuckContent ? page.content : null,
        template: page.template,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      },
    })
  }
}
