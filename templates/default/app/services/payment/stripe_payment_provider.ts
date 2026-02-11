import {
  PaymentProvider,
  type CreatePaymentParams,
  type PaymentResult,
  type RefundResult,
  type PaymentDetails,
  type WebhookEvent,
} from '#contracts/payment_provider'
import env from '#start/env'
import Stripe from 'stripe'

/**
 * Stripe Payment Provider
 *
 * Integrates with Stripe Checkout Sessions for payment collection
 * and Stripe webhooks for async payment confirmation.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_PUBLIC_KEY (used on frontend)
 */
export class StripePaymentProvider extends PaymentProvider {
  readonly name = 'stripe'
  readonly displayName = 'Stripe'
  readonly supportsRefunds = true
  readonly supportsPartialRefunds = true

  private stripe: Stripe

  constructor() {
    super()
    const secretKey = env.get('STRIPE_SECRET_KEY', '')
    this.stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' })
  }

  /**
   * Create a Stripe Checkout Session.
   * Returns a redirectUrl that the storefront should navigate to.
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: params.customerEmail,
        client_reference_id: params.orderId,
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              unit_amount: Math.round(params.amount * 100), // Stripe uses cents
              product_data: {
                name: params.description || `Order ${params.orderId}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: params.orderId,
          ...(params.metadata as Record<string, string> || {}),
        },
        success_url: params.returnUrl || '',
        cancel_url: params.cancelUrl || '',
      })

      return {
        success: true,
        transactionId: session.id,
        status: 'pending',
        redirectUrl: session.url || undefined,
        gatewayResponse: {
          sessionId: session.id,
          paymentIntentId: session.payment_intent,
          url: session.url,
        },
      }
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError
      return {
        success: false,
        transactionId: null,
        status: 'failed',
        errorMessage: stripeError.message,
        errorCode: stripeError.code || stripeError.type,
        gatewayResponse: {
          type: stripeError.type,
          code: stripeError.code,
          declineCode: stripeError.decline_code,
        },
      }
    }
  }

  /**
   * Capture a payment intent (for auth-then-capture flows).
   */
  async capturePayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      // transactionId can be a PaymentIntent ID or Checkout Session ID
      let paymentIntentId = transactionId

      // If it's a checkout session, resolve the payment intent
      if (transactionId.startsWith('cs_')) {
        const session = await this.stripe.checkout.sessions.retrieve(transactionId)
        paymentIntentId = session.payment_intent as string
      }

      const captureParams: Stripe.PaymentIntentCaptureParams = {}
      if (amount) {
        captureParams.amount_to_capture = Math.round(amount * 100)
      }

      const paymentIntent = await this.stripe.paymentIntents.capture(
        paymentIntentId,
        captureParams
      )

      return {
        success: true,
        transactionId: paymentIntent.id,
        status: 'captured',
        gatewayResponse: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          status: paymentIntent.status,
          paymentMethod: paymentIntent.payment_method,
        },
      }
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError
      return {
        success: false,
        transactionId,
        status: 'failed',
        errorMessage: stripeError.message,
        errorCode: stripeError.code || stripeError.type,
        gatewayResponse: { error: stripeError.message },
      }
    }
  }

  /**
   * Refund a payment (full or partial).
   */
  async refundPayment(
    transactionId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResult> {
    try {
      // Resolve PaymentIntent from Checkout Session if needed
      let paymentIntentId = transactionId
      if (transactionId.startsWith('cs_')) {
        const session = await this.stripe.checkout.sessions.retrieve(transactionId)
        paymentIntentId = session.payment_intent as string
      }

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100),
      }

      if (reason) {
        // Stripe accepts: 'duplicate' | 'fraudulent' | 'requested_by_customer'
        const stripeReason = reason === 'duplicate' || reason === 'fraudulent'
          ? reason
          : 'requested_by_customer'
        refundParams.reason = stripeReason as Stripe.RefundCreateParams.Reason
      }

      const refund = await this.stripe.refunds.create(refundParams)

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status === 'succeeded' ? 'processed' : 'pending',
        gatewayResponse: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          paymentIntent: refund.payment_intent,
        },
      }
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError
      return {
        success: false,
        refundId: null,
        amount,
        status: 'failed',
        errorMessage: stripeError.message,
        gatewayResponse: { error: stripeError.message },
      }
    }
  }

  /**
   * Void / cancel an authorized payment (cancel the PaymentIntent).
   */
  async voidPayment(transactionId: string): Promise<PaymentResult> {
    try {
      let paymentIntentId = transactionId
      if (transactionId.startsWith('cs_')) {
        const session = await this.stripe.checkout.sessions.retrieve(transactionId)
        paymentIntentId = session.payment_intent as string
      }

      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId)

      return {
        success: true,
        transactionId: paymentIntent.id,
        status: 'voided',
        gatewayResponse: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      }
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError
      return {
        success: false,
        transactionId,
        status: 'failed',
        errorMessage: stripeError.message,
        errorCode: stripeError.code || stripeError.type,
        gatewayResponse: { error: stripeError.message },
      }
    }
  }

  /**
   * Retrieve payment details from Stripe.
   */
  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    // Handle Checkout Session IDs
    if (transactionId.startsWith('cs_')) {
      const session = await this.stripe.checkout.sessions.retrieve(transactionId, {
        expand: ['payment_intent'],
      })

      const pi = session.payment_intent as Stripe.PaymentIntent | null

      return {
        transactionId: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        status: this.mapSessionStatus(session.status),
        paymentMethod: pi?.payment_method_types?.[0] || 'card',
        customerEmail: session.customer_email || undefined,
        createdAt: new Date(session.created * 1000),
        metadata: (session.metadata as Record<string, unknown>) || {},
      }
    }

    // Handle PaymentIntent IDs
    const pi = await this.stripe.paymentIntents.retrieve(transactionId)

    return {
      transactionId: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      status: this.mapPaymentIntentStatus(pi.status),
      paymentMethod: pi.payment_method_types?.[0] || 'card',
      createdAt: new Date(pi.created * 1000),
      metadata: (pi.metadata as Record<string, unknown>) || {},
    }
  }

  /**
   * Verify and parse a Stripe webhook event.
   */
  async verifyWebhook(payload: string | Buffer, signature: string): Promise<WebhookEvent> {
    const webhookSecret = env.get('STRIPE_WEBHOOK_SECRET', '')

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )

    // Extract transaction ID from the event data
    const data = event.data.object as Record<string, unknown>
    let transactionId = ''

    if (event.type.startsWith('checkout.session')) {
      transactionId = (data.id as string) || ''
    } else if (event.type.startsWith('payment_intent')) {
      transactionId = (data.id as string) || ''
    } else if (event.type.startsWith('charge')) {
      transactionId = (data.payment_intent as string) || (data.id as string) || ''
    } else if (event.type.startsWith('refund')) {
      transactionId = (data.payment_intent as string) || ''
    }

    return {
      type: event.type,
      transactionId,
      data: data as Record<string, unknown>,
    }
  }

  // ── Helpers ──────────────────────────────────────────────

  private mapSessionStatus(status: string | null): string {
    switch (status) {
      case 'complete':
        return 'captured'
      case 'expired':
        return 'failed'
      default:
        return 'pending'
    }
  }

  private mapPaymentIntentStatus(status: string): string {
    switch (status) {
      case 'succeeded':
        return 'captured'
      case 'requires_capture':
        return 'authorized'
      case 'canceled':
        return 'voided'
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'processing':
        return 'pending'
      default:
        return status
    }
  }
}
