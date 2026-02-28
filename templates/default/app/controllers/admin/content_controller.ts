import type { HttpContext } from '@adonisjs/core/http'
import Page from '#models/page'
import Menu from '#models/menu'
import MenuItem from '#models/menu_item'
import Banner from '#models/banner'
import { DateTime } from 'luxon'

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
        template: p.template,
        isSystem: p.isSystem,
        updatedAt: p.updatedAt?.toISO(),
      })),
    })
  }

  async createPage({ inertia }: HttpContext) {
    return inertia.render('admin/content/PageEditor', {
      page: null,
    })
  }

  async editPage({ params, inertia, store }: HttpContext) {
    const page = await Page.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    return inertia.render('admin/content/PageEditor', {
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        template: page.template,
        status: page.status,
        isSystem: page.isSystem,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        publishedAt: page.publishedAt?.toISO(),
        createdAt: page.createdAt.toISO(),
        updatedAt: page.updatedAt.toISO(),
      },
    })
  }

  async storePage({ request, response, session, store }: HttpContext) {
    const raw = request.only([
      'title',
      'slug',
      'content',
      'template',
      'status',
      'metaTitle',
      'metaDescription',
    ])

    try {
      const page = await Page.create({
        storeId: store.id,
        title: raw.title,
        slug: raw.slug,
        content: raw.content || null,
        template: raw.template || 'default',
        status: raw.status || 'draft',
        isSystem: false,
        metaTitle: raw.metaTitle || null,
        metaDescription: raw.metaDescription || null,
        publishedAt: raw.status === 'published' ? DateTime.now() : null,
      })

      session.flash('success', 'Page created successfully')
      return response.redirect().toRoute('admin.content.pages.edit', { id: page.id })
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updatePage({ params, request, response, session, store }: HttpContext) {
    const raw = request.only([
      'title',
      'slug',
      'content',
      'template',
      'status',
      'metaTitle',
      'metaDescription',
    ])

    try {
      const page = await Page.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      const wasPublished = page.status === 'published'

      page.merge({
        title: raw.title,
        slug: raw.slug,
        content: raw.content || null,
        template: raw.template || 'default',
        status: raw.status || page.status,
        metaTitle: raw.metaTitle || null,
        metaDescription: raw.metaDescription || null,
        publishedAt: raw.status === 'published' && !wasPublished ? DateTime.now() : page.publishedAt,
      })

      await page.save()

      session.flash('success', 'Page updated successfully')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyPage({ params, response, session, store }: HttpContext) {
    try {
      const page = await Page.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      if (page.isSystem) {
        session.flash('error', 'System pages cannot be deleted')
        return response.redirect().back()
      }

      await page.delete()

      session.flash('success', 'Page deleted')
      return response.redirect().toRoute('admin.content.pages')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Menu Management
  async menus({ inertia, store }: HttpContext) {
    const menus = await Menu.query()
      .where('storeId', store.id)
      .preload('items', (q) => q.orderBy('sortOrder', 'asc'))
      .orderBy('name', 'asc')

    return inertia.render('admin/content/Menus', {
      menus: menus.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        location: m.location,
        isActive: m.isActive,
        itemCount: m.items?.length || 0,
        items: m.items?.map((item) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          type: item.type,
          target: item.target,
          parentId: item.parentId,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        })),
        updatedAt: m.updatedAt?.toISO(),
      })),
    })
  }

  async storeMenu({ request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'slug', 'location', 'isActive'])

    try {
      await Menu.create({
        storeId: store.id,
        name: data.name,
        slug: data.slug,
        location: data.location || null,
        isActive: data.isActive ?? true,
      })

      session.flash('success', 'Menu created')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateMenu({ params, request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'slug', 'location', 'isActive'])

    try {
      const menu = await Menu.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      menu.merge(data)
      await menu.save()

      session.flash('success', 'Menu updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyMenu({ params, response, session, store }: HttpContext) {
    try {
      const menu = await Menu.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      await MenuItem.query().where('menuId', menu.id).delete()
      await menu.delete()

      session.flash('success', 'Menu deleted')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async storeMenuItem({ params, request, response, session }: HttpContext) {
    const data = request.only(['title', 'url', 'type', 'referenceId', 'target', 'icon', 'parentId', 'sortOrder', 'isActive'])

    try {
      await MenuItem.create({
        menuId: params.menuId,
        title: data.title,
        url: data.url || null,
        type: data.type || 'link',
        referenceId: data.referenceId || null,
        target: data.target || '_self',
        icon: data.icon || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      })

      session.flash('success', 'Menu item added')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateMenuItem({ params, request, response, session }: HttpContext) {
    const data = request.only(['title', 'url', 'type', 'referenceId', 'target', 'icon', 'parentId', 'sortOrder', 'isActive'])

    try {
      const item = await MenuItem.findOrFail(params.itemId)
      item.merge(data)
      await item.save()

      session.flash('success', 'Menu item updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyMenuItem({ params, response, session }: HttpContext) {
    try {
      const item = await MenuItem.findOrFail(params.itemId)
      await MenuItem.query().where('parentId', item.id).delete()
      await item.delete()

      session.flash('success', 'Menu item removed')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Banner Management
  async banners({ inertia, store }: HttpContext) {
    const banners = await Banner.query()
      .where('storeId', store.id)
      .orderBy('sortOrder', 'asc')

    return inertia.render('admin/content/Banners', {
      banners: banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        linkUrl: b.linkUrl,
        linkTarget: b.linkTarget,
        position: b.position,
        sortOrder: b.sortOrder,
        isActive: b.isActive,
        startsAt: b.startsAt?.toISO(),
        endsAt: b.endsAt?.toISO(),
      })),
    })
  }

  async storeBanner({ request, response, session, store }: HttpContext) {
    const data = request.only([
      'title', 'subtitle', 'imageUrl', 'mobileImageUrl',
      'linkUrl', 'linkTarget', 'position', 'sortOrder', 'isActive',
      'startsAt', 'endsAt',
    ])

    try {
      await Banner.create({
        storeId: store.id,
        title: data.title,
        subtitle: data.subtitle || null,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl || null,
        linkUrl: data.linkUrl || null,
        linkTarget: data.linkTarget || '_self',
        position: data.position || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        startsAt: data.startsAt ? DateTime.fromISO(data.startsAt) : null,
        endsAt: data.endsAt ? DateTime.fromISO(data.endsAt) : null,
      })

      session.flash('success', 'Banner created')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateBanner({ params, request, response, session, store }: HttpContext) {
    const data = request.only([
      'title', 'subtitle', 'imageUrl', 'mobileImageUrl',
      'linkUrl', 'linkTarget', 'position', 'sortOrder', 'isActive',
      'startsAt', 'endsAt',
    ])

    try {
      const banner = await Banner.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      banner.merge({
        ...data,
        startsAt: data.startsAt ? DateTime.fromISO(data.startsAt) : null,
        endsAt: data.endsAt ? DateTime.fromISO(data.endsAt) : null,
      })
      await banner.save()

      session.flash('success', 'Banner updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyBanner({ params, response, session, store }: HttpContext) {
    try {
      const banner = await Banner.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      await banner.delete()

      session.flash('success', 'Banner deleted')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }
}
