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
 * Manual Payment Provider
 *
 * Default payment provider for testing and manual/offline payments.
 * Payments are marked as authorized and must be captured manually by admin.
 */
export class ManualPaymentProvider extends PaymentProvider {
  readonly name = 'manual'
  readonly displayName = 'Manual Payment'
  readonly supportsRefunds = true
  readonly supportsPartialRefunds = true

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const transactionId = `manual_${randomUUID()}`

    return {
      success: true,
      transactionId,
      status: 'authorized',
      gatewayResponse: {
        provider: 'manual',
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        createdAt: new Date().toISOString(),
      },
    }
  }

  async capturePayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'captured',
      gatewayResponse: {
        provider: 'manual',
        capturedAmount: amount,
        capturedAt: new Date().toISOString(),
      },
    }
  }

  async refundPayment(
    transactionId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResult> {
    return {
      success: true,
      refundId: `refund_${randomUUID()}`,
      amount,
      status: 'processed',
      gatewayResponse: {
        provider: 'manual',
        originalTransaction: transactionId,
        reason,
        refundedAt: new Date().toISOString(),
      },
    }
  }

  async voidPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'voided',
      gatewayResponse: {
        provider: 'manual',
        voidedAt: new Date().toISOString(),
      },
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    return {
      transactionId,
      amount: 0,
      currency: 'TRY',
      status: 'authorized',
      paymentMethod: 'manual',
      createdAt: new Date(),
    }
  }

  async verifyWebhook(_payload: string | Buffer, _signature: string): Promise<WebhookEvent> {
    throw new Error('Manual payment provider does not support webhooks')
  }
}
