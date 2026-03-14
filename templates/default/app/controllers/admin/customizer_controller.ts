import type { HttpContext } from '@adonisjs/core/http'
import Page from '#models/page'

export default class CustomizerController {
  async editor({ params, inertia, store }: HttpContext) {
    const pageType = params.pageType || 'home'
    const validTypes = ['home', 'product', 'category', 'collection']

    if (!validTypes.includes(pageType)) {
      return inertia.render('admin/customizer/Editor', {
        page: null,
        pageType: 'home',
        error: `Invalid page type: ${pageType}`,
      })
    }

    // Find existing template page for this type, or return null
    let page = null
    if (params.pageId) {
      page = await Page.query()
        .where('id', params.pageId)
        .where('storeId', store.id)
        .first()
    } else {
      page = await Page.query()
        .where('storeId', store.id)
        .where('pageType', pageType)
        .orderBy('updatedAt', 'desc')
        .first()
    }

    return inertia.render('admin/customizer/Editor', {
      page: page ? {
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        template: page.template,
        pageType: page.pageType,
        status: page.status,
      } : null,
      pageType,
    })
  }

  async save({ params, request, response, store }: HttpContext) {
    const pageType = params.pageType || 'home'
    const validTypes = ['home', 'product', 'category', 'collection']

    if (!validTypes.includes(pageType)) {
      return response.badRequest({ error: 'Invalid page type' })
    }

    const content = request.input('content')
    const title = request.input('title', `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Template`)

    // Find or create the template page
    let page = await Page.query()
      .where('storeId', store.id)
      .where('pageType', pageType)
      .first()

    if (page) {
      page.merge({
        title,
        content,
        status: 'published' as const,
      })
      await page.save()
    } else {
      page = await Page.create({
        storeId: store.id,
        title,
        slug: `__template_${pageType}`,
        content,
        template: 'full-width',
        pageType: pageType as 'home' | 'product' | 'category' | 'collection',
        status: 'published' as const,
        isSystem: true,
      })
    }

    return response.json({ success: true, page: { id: page.id } })
  }
}
