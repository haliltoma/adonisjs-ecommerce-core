import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import { ReviewCreated, ReviewApproved, ReviewRejected } from '#events/review_events'
import { QueueProvider } from '#contracts/queue_provider'
import Notification from '#models/notification'
import Product from '#models/product'
import { randomUUID } from 'node:crypto'

export default class ReviewListener {
  async handleCreated(event: ReviewCreated) {
    const { review } = event

    // Notify admin of new review pending moderation
    await Notification.create({
      id: randomUUID(),
      userId: null,
      type: 'new_review',
      title: 'New Product Review',
      message: `A new ${review.rating}-star review has been submitted and is pending moderation.`,
      data: {
        reviewId: review.id,
        productId: review.productId,
        rating: review.rating,
      },
      channel: 'database',
      isRead: false,
    }).catch(() => {})

    logger.info(`[ReviewListener] New review submitted: ${review.id} (${review.rating} stars)`)
  }

  async handleApproved(event: ReviewApproved) {
    const { review } = event

    // Update product average rating
    await this.updateProductRating(review.productId)

    // Notify customer that review was published
    if (review.customerId) {
      try {
        const User = (await import('#models/user')).default
        const customer = await User.find(review.customerId)
        const product = await Product.find(review.productId)

        if (customer?.email) {
          const queue = await app.container.make(QueueProvider)
          await queue.dispatch({
            name: 'send-email',
            queue: 'emails',
            data: {
              to: customer.email,
              subject: 'Your review has been published!',
              template: 'review-approved',
              data: {
                customerName: customer.firstName || customer.email,
                productName: product?.title || 'the product',
                productUrl: `${process.env.APP_URL || ''}/products/${product?.slug || ''}`,
                rating: review.rating,
              },
            },
          })
        }
      } catch (err: unknown) {
        logger.error(`[ReviewListener] Failed to queue approval email: ${(err as Error).message}`)
      }
    }

    logger.info(`[ReviewListener] Review approved: ${review.id}`)
  }

  async handleRejected(event: ReviewRejected) {
    const { review, reason } = event

    // Notify customer about rejection
    if (review.customerId) {
      try {
        const User = (await import('#models/user')).default
        const customer = await User.find(review.customerId)

        if (customer?.email) {
          const queue = await app.container.make(QueueProvider)
          await queue.dispatch({
            name: 'send-email',
            queue: 'emails',
            data: {
              to: customer.email,
              subject: 'About your recent review',
              template: 'review-rejected',
              data: {
                customerName: customer.firstName || customer.email,
                reason: reason || 'Your review did not meet our community guidelines.',
              },
            },
          })
        }
      } catch (err: unknown) {
        logger.error(`[ReviewListener] Failed to queue rejection email: ${(err as Error).message}`)
      }
    }

    logger.info(`[ReviewListener] Review rejected: ${review.id} - ${reason || 'No reason'}`)
  }

  private async updateProductRating(productId: string) {
    try {
      const Review = (await import('#models/review')).default
      const product = await Product.find(productId)
      if (!product) return

      const stats = await Review.query()
        .where('productId', productId)
        .where('status', 'approved')
        .avg('rating as avgRating')
        .count('* as totalReviews')
        .first()

      if (stats) {
        product.customFields = {
          ...product.customFields,
          averageRating: Number(stats.$extras.avgRating || 0),
          reviewCount: Number(stats.$extras.totalReviews || 0),
        }
        await product.save()
      }
    } catch (err: unknown) {
      logger.error(`[ReviewListener] Failed to update product rating: ${(err as Error).message}`)
    }
  }
}
