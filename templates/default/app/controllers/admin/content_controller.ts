import type { HttpContext } from '@adonisjs/core/http'
import Page from '#models/page'

export default class ContentController {
  async pages({ inertia, store }: HttpContext) {
    const pages = await Page.query()
      .where('storeId', store.id)
      .orderBy('updatedAt', 'desc')

    return inertia.render('admin/content/Pages', {
      pages: pages.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        updatedAt: p.updatedAt?.toISO(),
      })),
    })
  }

  async menus({ inertia }: HttpContext) {
    return inertia.render('admin/content/Menus', {
      menus: [],
    })
  }

  async banners({ inertia }: HttpContext) {
    return inertia.render('admin/content/Banners', {
      banners: [],
    })
  }
}
