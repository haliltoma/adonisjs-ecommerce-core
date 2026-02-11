import { BaseEvent } from '@adonisjs/core/events'
import Review from '#models/review'

/**
 * Review Created Event
 */
export class ReviewCreated extends BaseEvent {
  constructor(public review: Review) {
    super()
  }
}

/**
 * Review Approved Event
 */
export class ReviewApproved extends BaseEvent {
  constructor(public review: Review) {
    super()
  }
}

/**
 * Review Rejected Event
 */
export class ReviewRejected extends BaseEvent {
  constructor(
    public review: Review,
    public reason?: string
  ) {
    super()
  }
}

/**
 * Review Reported Event
 */
export class ReviewReported extends BaseEvent {
  constructor(
    public review: Review,
    public reporterId: string,
    public reason: string
  ) {
    super()
  }
}
