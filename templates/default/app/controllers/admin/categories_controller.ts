import type { HttpContext } from '@adonisjs/core/http'
import CategoryService from '#services/category_service'
import Category from '#models/category'

export default class CategoriesController {
  private categoryService: CategoryService

  constructor() {
    this.categoryService = new CategoryService()
  }

  async index({ inertia, store }: HttpContext) {
    const storeId = store.id
    const tree = await this.categoryService.getTree(storeId, true)

    // Also get flat list for table view
    const categories = await Category.query()
      .where('storeId', storeId)
      .preload('parent')
      .withCount('products')
      .orderBy('depth', 'asc')
      .orderBy('position', 'asc')

    return inertia.render('admin/categories/Index', {
      tree,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        depth: c.depth,
        parentId: c.parentId,
        parentName: c.parent?.name,
        isActive: c.isActive,
        position: c.position,
        productCount: Number(c.$extras.products_count || 0),
        createdAt: c.createdAt.toISO(),
      })),
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
    const data = request.only([
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

    try {
      const category = await this.categoryService.create({
        storeId,
        ...data,
      })

      session.flash('success', 'Category created successfully')
      return response.redirect().toRoute('admin.categories.edit', { id: category.id })
    } catch (error) {
      session.flash('error', error.message)
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
    const data = request.only([
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

    try {
      await this.categoryService.update(params.id, data)
      session.flash('success', 'Category updated successfully')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      await this.categoryService.delete(params.id)
      session.flash('success', 'Category deleted')
      return response.redirect().toRoute('admin.categories.index')
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async reorder({ request, response, session }: HttpContext) {
    const { categoryIds } = request.only(['categoryIds'])

    try {
      await this.categoryService.updateSortOrder(categoryIds)
      session.flash('success', 'Categories reordered')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
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
