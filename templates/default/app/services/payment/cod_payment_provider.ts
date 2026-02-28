import {
  PaymentProvider,
  type CreatePaymentParams,
  type PaymentResult,
  type RefundResult,
  type PaymentDetails,
  type WebhookEvent,
} from '#contracts/payment_provider'
import { randomUUID } from 'node:crypto'

/**
 * Cash on Delivery (COD) Payment Provider
 *
 * Handles cash-on-delivery payments where the customer pays upon
 * receiving the shipment. Payment is authorized at order time and
 * captured when the delivery is confirmed.
 *
 * Env vars (optional):
 *   COD_EXTRA_FEE         — Additional fee for COD orders (default: 0)
 *   COD_MAX_ORDER_AMOUNT  — Maximum order amount for COD (default: unlimited)
 *   COD_ALLOWED_COUNTRIES — Comma-separated country codes (default: all)
 */
export class CodPaymentProvider extends PaymentProvider {
  readonly name = 'cash_on_delivery'
  readonly displayName = 'Cash on Delivery (Kapıda Ödeme)'
  readonly supportsRefunds = true
  readonly supportsPartialRefunds = false

  /**
   * Get COD configuration
   */
  getConfig(): CodConfig {
    return {
      extraFee: Number.parseFloat(process.env.COD_EXTRA_FEE || '0'),
      maxOrderAmount: process.env.COD_MAX_ORDER_AMOUNT
        ? Number.parseFloat(process.env.COD_MAX_ORDER_AMOUNT)
        : null,
      allowedCountries: process.env.COD_ALLOWED_COUNTRIES
        ? process.env.COD_ALLOWED_COUNTRIES.split(',').map((c) => c.trim())
        : null,
    }
  }

  /**
   * Create a COD payment.
   * Authorized immediately — captured when delivery is confirmed.
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const config = this.getConfig()

    // Validate max order amount
    if (config.maxOrderAmount && params.amount > config.maxOrderAmount) {
      return {
        success: false,
        transactionId: null,
        status: 'failed',
        errorMessage: `Cash on delivery is not available for orders above ${config.maxOrderAmount} ${params.currency}. Maximum allowed: ${config.maxOrderAmount} ${params.currency}.`,
        errorCode: 'COD_MAX_AMOUNT_EXCEEDED',
        gatewayResponse: {
          provider: 'cash_on_delivery',
          maxAmount: config.maxOrderAmount,
          requestedAmount: params.amount,
        },
      }
    }

    const transactionId = `cod_${randomUUID()}`
    const totalWithFee = params.amount + config.extraFee

    return {
      success: true,
      transactionId,
      status: 'authorized', // Will be captured upon delivery
      gatewayResponse: {
        provider: 'cash_on_delivery',
        orderId: params.orderId,
        orderAmount: params.amount,
        extraFee: config.extraFee,
        totalDue: totalWithFee,
        currency: params.currency,
        note: config.extraFee > 0
          ? `Cash on delivery fee of ${config.extraFee} ${params.currency} applied. Total due at delivery: ${totalWithFee} ${params.currency}.`
          : `Total due at delivery: ${totalWithFee} ${params.currency}.`,
        createdAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Capture a COD payment.
   * Called when the delivery is confirmed and cash is collected.
   */
  async capturePayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'captured',
      gatewayResponse: {
        provider: 'cash_on_delivery',
        collectedAmount: amount,
        collectedAt: new Date().toISOString(),
        note: 'Cash collected upon delivery.',
      },
    }
  }

  /**
   * Refund a COD payment.
   * Full refund only — must be processed manually (return cash or bank transfer).
   */
  async refundPayment(
    transactionId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResult> {
    return {
      success: true,
      refundId: `cod_refund_${randomUUID()}`,
      amount,
      status: 'pending',
      gatewayResponse: {
        provider: 'cash_on_delivery',
        originalTransaction: transactionId,
        reason,
        note: 'COD refund must be processed manually (cash return or bank transfer to customer).',
        createdAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Void a COD order (cancel before delivery).
   */
  async voidPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'voided',
      gatewayResponse: {
        provider: 'cash_on_delivery',
        voidedAt: new Date().toISOString(),
        note: 'COD order cancelled before delivery. No payment was collected.',
      },
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    return {
      transactionId,
      amount: 0,
      currency: 'TRY',
      status: 'authorized',
      paymentMethod: 'cash_on_delivery',
      createdAt: new Date(),
      metadata: {
        provider: 'cash_on_delivery',
        note: 'Payment will be collected upon delivery.',
      },
    }
  }

  async verifyWebhook(
    _payload: string | Buffer,
    _signature: string
  ): Promise<WebhookEvent> {
    throw new Error('Cash on delivery provider does not support webhooks')
  }
}

interface CodConfig {
  extraFee: number
  maxOrderAmount: number | null
  allowedCountries: string[] | null
}
