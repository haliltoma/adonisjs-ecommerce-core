import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'
import BlogCategory from '#models/blog_category'
import { randomUUID } from 'node:crypto'
import string from '@adonisjs/core/helpers/string'

export default class BlogController {
  async index({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const search = request.input('search', '')
    const categoryId = request.input('category', '')

    const query = BlogPost.query()
      .where('storeId', store.id)
      .preload('category')
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }
    if (categoryId) {
      query.where('blogCategoryId', categoryId)
    }
    if (search) {
      query.where((builder) => {
        builder.whereILike('title', `%${search}%`).orWhereILike('excerpt', `%${search}%`)
      })
    }

    const posts = await query.paginate(page, 20)

    const categories = await BlogCategory.query()
      .where('storeId', store.id)
      .orderBy('sortOrder', 'asc')

    return inertia.render('admin/blog/Index', {
      posts: {
        data: posts.all().map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          isFeatured: p.isFeatured,
          viewCount: p.viewCount || 0,
          category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
          publishedAt: p.publishedAt?.toISO() || null,
          createdAt: p.createdAt.toISO(),
        })),
        meta: {
          total: posts.total,
          perPage: posts.perPage,
          currentPage: posts.currentPage,
          lastPage: posts.lastPage,
        },
      },
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      filters: { status, search, category: categoryId },
    })
  }

  async create({ inertia, store }: HttpContext) {
    const categories = await BlogCategory.query()
      .where('storeId', store.id)
      .orderBy('sortOrder', 'asc')

    return inertia.render('admin/blog/Edit', {
      post: null,
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async store({ request, response, session, store, admin }: HttpContext) {
    const data = request.only([
      'title', 'slug', 'excerpt', 'content', 'featuredImageUrl',
      'status', 'blogCategoryId', 'tags', 'metaTitle', 'metaDescription',
      'isFeatured', 'publishedAt',
    ])

    try {
      const slug = data.slug || string.slug(data.title, { lower: true })

      await BlogPost.create({
        id: randomUUID(),
        storeId: store.id,
        authorId: admin?.id || null,
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content || null,
        featuredImageUrl: data.featuredImageUrl || null,
        status: data.status || 'draft',
        blogCategoryId: data.blogCategoryId || null,
        tags: data.tags || [],
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isFeatured: data.isFeatured || false,
        publishedAt: data.status === 'published' ? (data.publishedAt || new Date().toISOString()) : null,
        viewCount: 0,
      })

      session.flash('success', 'Blog post created')
      return response.redirect('/admin/blog')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async edit({ params, inertia, store }: HttpContext) {
    const post = await BlogPost.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .preload('category')
      .firstOrFail()

    const categories = await BlogCategory.query()
      .where('storeId', store.id)
      .orderBy('sortOrder', 'asc')

    return inertia.render('admin/blog/Edit', {
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImageUrl: post.featuredImageUrl,
        status: post.status,
        blogCategoryId: post.blogCategoryId,
        tags: post.tags,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        isFeatured: post.isFeatured,
        publishedAt: post.publishedAt?.toISO(),
        viewCount: post.viewCount,
        createdAt: post.createdAt.toISO(),
      },
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async update({ params, request, response, session, store }: HttpContext) {
    const post = await BlogPost.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    const data = request.only([
      'title', 'slug', 'excerpt', 'content', 'featuredImageUrl',
      'status', 'blogCategoryId', 'tags', 'metaTitle', 'metaDescription',
      'isFeatured', 'publishedAt',
    ])

    try {
      post.merge({
        title: data.title,
        slug: data.slug || string.slug(data.title, { lower: true }),
        excerpt: data.excerpt || null,
        content: data.content || null,
        featuredImageUrl: data.featuredImageUrl || null,
        status: data.status,
        blogCategoryId: data.blogCategoryId || null,
        tags: data.tags || [],
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isFeatured: data.isFeatured || false,
      })

      if (data.status === 'published' && !post.publishedAt) {
        const { DateTime } = await import('luxon')
        post.publishedAt = data.publishedAt ? DateTime.fromISO(data.publishedAt) : DateTime.now()
      }

      await post.save()

      session.flash('success', 'Blog post updated')
      return response.redirect('/admin/blog')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session, store }: HttpContext) {
    const post = await BlogPost.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    await post.delete()

    session.flash('success', 'Blog post deleted')
    return response.redirect('/admin/blog')
  }

  // ── Categories ──────────────────────────────────────────

  async categories({ inertia, store }: HttpContext) {
    const categories = await BlogCategory.query()
      .where('storeId', store.id)
      .withCount('posts')
      .orderBy('sortOrder', 'asc')

    return inertia.render('admin/blog/Categories', {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        sortOrder: c.sortOrder,
        postCount: c.$extras.posts_count || 0,
      })),
    })
  }

  async storeCategory({ request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'slug', 'description', 'sortOrder'])

    try {
      await BlogCategory.create({
        id: randomUUID(),
        storeId: store.id,
        name: data.name,
        slug: data.slug || string.slug(data.name, { lower: true }),
        description: data.description || null,
        sortOrder: data.sortOrder || 0,
      })

      session.flash('success', 'Category created')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateCategory({ params, request, response, session, store }: HttpContext) {
    const category = await BlogCategory.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    const data = request.only(['name', 'slug', 'description', 'sortOrder'])

    category.merge({
      name: data.name,
      slug: data.slug || string.slug(data.name, { lower: true }),
      description: data.description || null,
      sortOrder: data.sortOrder ?? category.sortOrder,
    })
    await category.save()

    session.flash('success', 'Category updated')
    return response.redirect().back()
  }

  async destroyCategory({ params, response, session, store }: HttpContext) {
    const category = await BlogCategory.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    await category.delete()

    session.flash('success', 'Category deleted')
    return response.redirect().back()
  }
}
