import Category from '#models/category'
import db from '@adonisjs/lucid/services/db'

interface CreateCategoryDTO {
  storeId: string
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  parentId?: string
  metaTitle?: string
  metaDescription?: string
  isActive?: boolean
  position?: number
}

interface UpdateCategoryDTO {
  name?: string
  slug?: string
  description?: string
  imageUrl?: string
  parentId?: string
  metaTitle?: string
  metaDescription?: string
  isActive?: boolean
  position?: number
}

interface CategoryTreeNode {
  id: string
  name: string
  slug: string
  children: CategoryTreeNode[]
}

export default class CategoryService {
  async create(data: CreateCategoryDTO): Promise<Category> {
    const slug = data.slug || this.generateSlug(data.name)

    let depth = 0
    let path = ''

    if (data.parentId) {
      const parent = await Category.findOrFail(data.parentId)
      depth = parent.depth + 1
      path = parent.path ? `${parent.path}/${parent.id}` : parent.id
    }

    return await Category.create({
      storeId: data.storeId,
      name: data.name,
      slug,
      description: data.description,
      imageUrl: data.imageUrl,
      parentId: data.parentId,
      depth,
      path,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      isActive: data.isActive ?? true,
      position: data.position ?? 0,
    })
  }

  async update(categoryId: string, data: UpdateCategoryDTO): Promise<Category> {
    return await db.transaction(async (trx) => {
      const category = await Category.query({ client: trx }).where('id', categoryId).firstOrFail()

      const oldParentId = category.parentId

      category.merge({
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isActive: data.isActive,
        position: data.position,
      })

      // Update depth and path if parent changed
      if (data.parentId !== undefined && data.parentId !== oldParentId) {
        if (data.parentId) {
          const parent = await Category.query({ client: trx })
            .where('id', data.parentId)
            .firstOrFail()
          category.depth = parent.depth + 1
          category.path = parent.path ? `${parent.path}/${parent.id}` : parent.id
        } else {
          category.depth = 0
          category.path = ''
        }

        // Update all children's depth and path
        await this.updateChildrenPaths(category, trx)
      }

      await category.useTransaction(trx).save()
      return category
    })
  }

  async delete(categoryId: string): Promise<void> {
    const category = await Category.findOrFail(categoryId)

    // Check for children
    const childCount = await Category.query().where('parentId', categoryId).count('* as total')

    if (Number(childCount[0].$extras.total) > 0) {
      throw new Error('Cannot delete category with children')
    }

    await category.delete()
  }

  async findById(categoryId: string): Promise<Category | null> {
    return await Category.query()
      .where('id', categoryId)
      .preload('parent')
      .preload('children')
      .first()
  }

  async findBySlug(storeId: string, slug: string): Promise<Category | null> {
    return await Category.query()
      .where('storeId', storeId)
      .where('slug', slug)
      .preload('children')
      .first()
  }

  async getTree(storeId: string, includeInactive: boolean = false): Promise<CategoryTreeNode[]> {
    const query = Category.query()
      .where('storeId', storeId)
      .orderBy('position', 'asc')
      .orderBy('name', 'asc')

    if (!includeInactive) {
      query.where('isActive', true)
    }

    const categories = await query

    return this.buildTree(categories)
  }

  async getRootCategories(storeId: string): Promise<Category[]> {
    return await Category.query()
      .where('storeId', storeId)
      .whereNull('parentId')
      .where('isActive', true)
      .orderBy('position', 'asc')
      .orderBy('name', 'asc')
  }

  async getChildren(categoryId: string): Promise<Category[]> {
    return await Category.query()
      .where('parentId', categoryId)
      .where('isActive', true)
      .orderBy('position', 'asc')
      .orderBy('name', 'asc')
  }

  async getAncestors(categoryId: string): Promise<Category[]> {
    const category = await Category.findOrFail(categoryId)

    if (!category.path) {
      return []
    }

    const ancestorIds = category.path.split('/')
    return await Category.query()
      .whereIn('id', ancestorIds)
      .orderBy('depth', 'asc')
  }

  async updateSortOrder(categoryIds: string[]): Promise<void> {
    await db.transaction(async (trx) => {
      for (let i = 0; i < categoryIds.length; i++) {
        await Category.query({ client: trx })
          .where('id', categoryIds[i])
          .update({ position: i })
      }
    })
  }

  async getCategoryProductCount(categoryId: string): Promise<number> {
    const category = await Category.query()
      .where('id', categoryId)
      .withCount('products')
      .first()

    return Number(category?.$extras.products_count || 0)
  }

  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const map = new Map<string, CategoryTreeNode>()
    const roots: CategoryTreeNode[] = []

    // Create nodes
    for (const cat of categories) {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        children: [],
      })
    }

    // Build tree
    for (const cat of categories) {
      const node = map.get(cat.id)!
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  }

  private async updateChildrenPaths(parent: Category, trx: any): Promise<void> {
    const children = await Category.query({ client: trx }).where('parentId', parent.id)

    for (const child of children) {
      child.depth = parent.depth + 1
      child.path = parent.path ? `${parent.path}/${parent.id}` : parent.id
      await child.useTransaction(trx).save()
      await this.updateChildrenPaths(child, trx)
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}
