import type { HttpContext } from '@adonisjs/core/http'
import Review from '#models/review'

export default class ReviewsController {
  async index({ inertia, request, store }: HttpContext) {
    const { page = 1, status, search } = request.qs()

    const query = Review.query()
      .whereHas('product', (pq) => {
        pq.where('storeId', store.id)
      })
      .preload('product')
      .preload('customer')
      .orderBy('createdAt', 'desc')

    if (status && status !== 'all') {
      query.where('status', status)
    }

    if (search) {
      query.where((q) => {
        q.whereHas('product', (pq) => {
          pq.whereILike('title', `%${search}%`)
        }).orWhereILike('title', `%${search}%`).orWhereILike('content', `%${search}%`)
      })
    }

    const reviews = await query.paginate(page, 20)

    return inertia.render('admin/reviews/Index', {
      reviews: {
        data: reviews.all().map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          content: r.content,
          status: r.status,
          isVerifiedPurchase: r.isVerifiedPurchase,
          helpfulCount: r.helpfulCount,
          reportCount: r.reportCount,
          product: r.product ? { id: r.product.id, title: r.product.title } : null,
          customer: r.customer
            ? { id: r.customer.id, name: `${r.customer.firstName} ${r.customer.lastName}` }
            : null,
          createdAt: r.createdAt.toISO(),
        })),
        meta: {
          total: reviews.total,
          perPage: reviews.perPage,
          currentPage: reviews.currentPage,
          lastPage: reviews.lastPage,
        },
      },
      filters: { status: status || 'all', search: search || '' },
    })
  }

  async updateStatus({ params, request, response, session }: HttpContext) {
    const { status } = request.only(['status'])

    try {
      const review = await Review.findOrFail(params.id)
      review.status = status
      await review.save()

      session.flash('success', `Review ${status}`)
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const review = await Review.findOrFail(params.id)
      await review.delete()

      session.flash('success', 'Review deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }
}
