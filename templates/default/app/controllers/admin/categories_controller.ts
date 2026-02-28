import type { HttpContext } from '@adonisjs/core/http'
import CategoryService from '#services/category_service'
import Category from '#models/category'
import Collection from '#models/collection'

export default class CategoriesController {
  private categoryService: CategoryService

  constructor() {
    this.categoryService = new CategoryService()
  }

  async collections({ inertia, store }: HttpContext) {
    const collections = await Collection.query()
      .where('storeId', store.id)
      .withCount('products')
      .orderBy('sortOrder', 'asc')

    return inertia.render('admin/collections/Index', {
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        productCount: Number(c.$extras.products_count || 0),
        type: c.metadata?.type === 'automated' ? 'automated' : 'manual',
        isActive: c.isActive,
      })),
    })
  }

  async createCollection({ inertia }: HttpContext) {
    return inertia.render('admin/collections/Create')
  }

  async storeCollection({ request, response, session, store }: HttpContext) {
    const raw = request.only([
      'name',
      'slug',
      'description',
      'imageUrl',
      'isActive',
      'sortOrder',
    ])

    try {
      const collection = await Collection.create({
        storeId: store.id,
        name: raw.name,
        slug: raw.slug,
        description: raw.description || null,
        imageUrl: raw.imageUrl || null,
        isActive: raw.isActive ?? true,
        sortOrder: raw.sortOrder != null && raw.sortOrder !== '' ? Number(raw.sortOrder) : 0,
      })

      session.flash('success', 'Collection created successfully')
      return response.redirect().toRoute('admin.collections.edit', { id: collection.id })
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async editCollection({ params, inertia, store }: HttpContext) {
    const collection = await Collection.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    return inertia.render('admin/collections/Edit', {
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        imageUrl: collection.imageUrl,
        isActive: collection.isActive,
        sortOrder: collection.sortOrder,
        createdAt: collection.createdAt.toISO(),
        updatedAt: collection.updatedAt.toISO(),
      },
    })
  }

  async updateCollection({ params, request, response, session, store }: HttpContext) {
    const raw = request.only([
      'name',
      'slug',
      'description',
      'imageUrl',
      'isActive',
      'sortOrder',
    ])

    try {
      const collection = await Collection.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      collection.merge({
        name: raw.name,
        slug: raw.slug,
        description: raw.description || null,
        imageUrl: raw.imageUrl || null,
        isActive: raw.isActive ?? collection.isActive,
        sortOrder: raw.sortOrder != null && raw.sortOrder !== '' ? Number(raw.sortOrder) : collection.sortOrder,
      })

      await collection.save()

      session.flash('success', 'Collection updated successfully')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyCollection({ params, response, session, store }: HttpContext) {
    try {
      const collection = await Collection.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      await collection.delete()

      session.flash('success', 'Collection deleted')
      return response.redirect().toRoute('admin.collections')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async index({ inertia, store }: HttpContext) {
    const storeId = store.id

    const allCategories = await Category.query()
      .where('storeId', storeId)
      .withCount('products')
      .orderBy('position', 'asc')
      .orderBy('name', 'asc')

    // Build tree structure matching frontend Category interface
    type CategoryNode = {
      id: string
      name: string
      slug: string
      description: string | null
      imageUrl: string | null
      isActive: boolean
      position: number
      parentId: string | null
      productCount: number
      children: CategoryNode[]
    }

    const map = new Map<string, CategoryNode>()
    const roots: CategoryNode[] = []

    for (const c of allCategories) {
      map.set(c.id, {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        isActive: c.isActive,
        position: c.position,
        parentId: c.parentId,
        productCount: Number(c.$extras.products_count || 0),
        children: [],
      })
    }

    for (const c of allCategories) {
      const node = map.get(c.id)!
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return inertia.render('admin/categories/Index', {
      categories: roots,
    })
  }

  async create({ inertia, store }: HttpContext) {
    const storeId = store.id
    const tree = await this.categoryService.getTree(storeId, true)

    return inertia.render('admin/categories/Create', {
      parentOptions: this.flattenTreeForSelect(tree),
    })
  }

  async store({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const raw = request.only([
      'name',
      'slug',
      'description',
      'imageUrl',
      'parentId',
      'metaTitle',
      'metaDescription',
      'isActive',
      'position',
    ])

    const data = {
      ...raw,
      description: raw.description || undefined,
      imageUrl: raw.imageUrl || undefined,
      parentId: raw.parentId || undefined,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      position: raw.position !== '' && raw.position != null ? Number(raw.position) : undefined,
    }

    try {
      const category = await this.categoryService.create({
        storeId,
        ...data,
      })

      session.flash('success', 'Category created successfully')
      return response.redirect().toRoute('admin.categories.edit', { id: category.id })
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async edit({ params, inertia, store }: HttpContext) {
    const storeId = store.id
    const category = await this.categoryService.findById(params.id)

    if (!category) {
      return inertia.render('admin/errors/NotFound', { resource: 'Category' })
    }

    const tree = await this.categoryService.getTree(storeId, true)
    const ancestors = await this.categoryService.getAncestors(params.id)

    return inertia.render('admin/categories/Edit', {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        parentId: category.parentId,
        depth: category.depth,
        path: category.path,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        isActive: category.isActive,
        position: category.position,
        createdAt: category.createdAt.toISO(),
        updatedAt: category.updatedAt.toISO(),
      },
      parentOptions: this.flattenTreeForSelect(tree, category.id),
      ancestors: ancestors.map((a) => ({ id: a.id, name: a.name })),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const raw = request.only([
      'name',
      'slug',
      'description',
      'imageUrl',
      'parentId',
      'metaTitle',
      'metaDescription',
      'isActive',
      'position',
    ])

    const data = {
      ...raw,
      description: raw.description || undefined,
      imageUrl: raw.imageUrl || undefined,
      parentId: raw.parentId || undefined,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      position: raw.position !== '' && raw.position != null ? Number(raw.position) : undefined,
    }

    try {
      await this.categoryService.update(params.id, data)
      session.flash('success', 'Category updated successfully')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      await this.categoryService.delete(params.id)
      session.flash('success', 'Category deleted')
      return response.redirect().toRoute('admin.categories.index')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async reorder({ request, response, session }: HttpContext) {
    const { categoryIds } = request.only(['categoryIds'])

    try {
      await this.categoryService.updateSortOrder(categoryIds)
      session.flash('success', 'Categories reordered')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  private flattenTreeForSelect(
    tree: any[],
    excludeId?: string,
    depth: number = 0
  ): { id: string; name: string; depth: number }[] {
    const result: { id: string; name: string; depth: number }[] = []

    for (const node of tree) {
      if (node.id !== excludeId) {
        result.push({
          id: node.id,
          name: node.name,
          depth,
        })

        if (node.children?.length) {
          result.push(...this.flattenTreeForSelect(node.children, excludeId, depth + 1))
        }
      }
    }

    return result
  }
}
