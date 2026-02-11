import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'
import BlogCategory from '#models/blog_category'

export default class BlogController {
  async index({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)
    const category = request.input('category', '')

    const query = BlogPost.query()
      .where('storeId', store.id)
      .where('status', 'published')
      .preload('category')
      .orderBy('publishedAt', 'desc')

    if (category) {
      query.whereHas('category', (builder) => {
        builder.where('slug', category)
      })
    }

    const posts = await query.paginate(page, 12)

    const categories = await BlogCategory.query()
      .where('storeId', store.id)
      .withCount('posts', (q) => q.where('status', 'published'))
      .orderBy('sortOrder', 'asc')

    const featuredPosts = await BlogPost.query()
      .where('storeId', store.id)
      .where('status', 'published')
      .where('isFeatured', true)
      .preload('category')
      .orderBy('publishedAt', 'desc')
      .limit(3)

    return inertia.render('storefront/blog/Index', {
      posts: {
        data: posts.all().map((p) => this.serializePost(p)),
        meta: posts.getMeta(),
      },
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        postCount: c.$extras.posts_count || 0,
      })),
      featuredPosts: featuredPosts.map((p) => this.serializePost(p)),
      activeCategory: category,
    })
  }

  async show({ params, inertia, store }: HttpContext) {
    const post = await BlogPost.query()
      .where('storeId', store.id)
      .where('slug', params.slug)
      .where('status', 'published')
      .preload('category')
      .firstOrFail()

    // Increment view count
    post.viewCount += 1
    await post.save()

    // Related posts
    const relatedPosts = await BlogPost.query()
      .where('storeId', store.id)
      .where('status', 'published')
      .where('id', '!=', post.id)
      .if(post.blogCategoryId, (q) => q.where('blogCategoryId', post.blogCategoryId!))
      .orderBy('publishedAt', 'desc')
      .limit(3)

    return inertia.render('storefront/blog/Show', {
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImageUrl: post.featuredImageUrl,
        tags: post.tags,
        metaTitle: post.metaTitle || post.title,
        metaDescription: post.metaDescription || post.excerpt,
        viewCount: post.viewCount,
        readingTime: post.readingTime,
        publishedAt: post.publishedAt?.toISO(),
        category: post.category ? { name: post.category.name, slug: post.category.slug } : null,
      },
      relatedPosts: relatedPosts.map((p) => this.serializePost(p)),
    })
  }

  private serializePost(post: BlogPost) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImageUrl: post.featuredImageUrl,
      tags: post.tags,
      readingTime: post.readingTime,
      publishedAt: post.publishedAt?.toISO(),
      category: post.category ? { name: post.category.name, slug: post.category.slug } : null,
    }
  }
}
