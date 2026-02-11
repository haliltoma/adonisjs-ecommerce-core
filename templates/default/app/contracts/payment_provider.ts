/**
 * Payment Provider Contract
 *
 * Abstract class that all payment providers must implement.
 * Used with AdonisJS IoC container for dependency injection.
 *
 * Providers: Stripe, Iyzico, PayPal, Manual, etc.
 */
export abstract class PaymentProvider {
  /**
   * Unique identifier for the payment provider
   */
  abstract readonly name: string

  /**
   * Human-readable display name
   */
  abstract readonly displayName: string

  /**
   * Whether the provider supports refunds
   */
  abstract readonly supportsRefunds: boolean

  /**
   * Whether the provider supports partial refunds
   */
  abstract readonly supportsPartialRefunds: boolean

  /**
   * Create a payment intent / initialize payment
   */
  abstract createPayment(params: CreatePaymentParams): Promise<PaymentResult>

  /**
   * Capture a previously authorized payment
   */
  abstract capturePayment(transactionId: string, amount?: number): Promise<PaymentResult>

  /**
   * Refund a payment (full or partial)
   */
  abstract refundPayment(transactionId: string, amount: number, reason?: string): Promise<RefundResult>

  /**
   * Void / cancel an authorized payment
   */
  abstract voidPayment(transactionId: string): Promise<PaymentResult>

  /**
   * Get payment details from gateway
   */
  abstract getPaymentDetails(transactionId: string): Promise<PaymentDetails>

  /**
   * Verify webhook signature from gateway
   */
  abstract verifyWebhook(payload: string | Buffer, signature: string): Promise<WebhookEvent>
}

export interface CreatePaymentParams {
  orderId: string
  amount: number
  currency: string
  customerEmail: string
  customerName?: string
  description?: string
  returnUrl?: string
  cancelUrl?: string
  metadata?: Record<string, unknown>
}

export interface PaymentResult {
  success: boolean
  transactionId: string | null
  gatewayResponse: Record<string, unknown>
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'voided'
  redirectUrl?: string
  errorMessage?: string
  errorCode?: string
}

export interface RefundResult {
  success: boolean
  refundId: string | null
  amount: number
  status: 'pending' | 'processed' | 'failed'
  gatewayResponse: Record<string, unknown>
  errorMessage?: string
}

export interface PaymentDetails {
  transactionId: string
  amount: number
  currency: string
  status: string
  paymentMethod?: string
  customerEmail?: string
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface WebhookEvent {
  type: string
  transactionId: string
  data: Record<string, unknown>
}
