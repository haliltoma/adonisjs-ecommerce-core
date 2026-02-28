import {
  PaymentProvider,
  type CreatePaymentParams,
  type PaymentResult,
  type RefundResult,
  type PaymentDetails,
  type WebhookEvent,
} from '#contracts/payment_provider'
import env from '#start/env'
import { createHmac } from 'node:crypto'

/**
 * Iyzico Payment Provider
 *
 * Integrates with Iyzico (Turkey's leading payment gateway) for
 * credit card payments, installments, and BKM Express.
 *
 * Uses Iyzico Checkout Form for PCI-compliant card collection.
 *
 * Required env vars:
 *   IYZICO_API_KEY
 *   IYZICO_SECRET_KEY
 *   IYZICO_BASE_URL  (https://api.iyzipay.com or https://sandbox-api.iyzipay.com)
 */
export class IyzicoPaymentProvider extends PaymentProvider {
  readonly name = 'iyzico'
  readonly displayName = 'Iyzico'
  readonly supportsRefunds = true
  readonly supportsPartialRefunds = true

  private apiKey: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    super()
    this.apiKey = env.get('IYZICO_API_KEY', '')
    this.secretKey = env.get('IYZICO_SECRET_KEY', '')
    this.baseUrl = env.get('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com')
  }

  /**
   * Create an Iyzico Checkout Form session.
   * Returns a redirectUrl that loads the Iyzico hosted payment form.
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const conversationId = params.orderId.replace(/-/g, '').slice(0, 30)

      const body = {
        locale: 'tr',
        conversationId,
        price: params.amount.toFixed(2),
        paidPrice: params.amount.toFixed(2),
        currency: this.mapCurrency(params.currency),
        basketId: params.orderId,
        paymentGroup: 'PRODUCT',
        callbackUrl: params.returnUrl || '',
        enabledInstallments: [1, 2, 3, 6, 9, 12],
        buyer: {
          id: conversationId,
          name: params.customerName?.split(' ')[0] || 'Guest',
          surname: params.customerName?.split(' ').slice(1).join(' ') || 'Customer',
          email: params.customerEmail,
          identityNumber: '11111111111', // TC placeholder — should come from customer
          registrationAddress: 'N/A',
          city: 'Istanbul',
          country: 'Turkey',
          ip: '127.0.0.1',
        },
        shippingAddress: {
          contactName: params.customerName || 'Guest',
          city: 'Istanbul',
          country: 'Turkey',
          address: 'N/A',
        },
        billingAddress: {
          contactName: params.customerName || 'Guest',
          city: 'Istanbul',
          country: 'Turkey',
          address: 'N/A',
        },
        basketItems: [
          {
            id: params.orderId,
            name: params.description || `Order ${params.orderId}`,
            category1: 'E-Commerce',
            itemType: 'PHYSICAL',
            price: params.amount.toFixed(2),
          },
        ],
      }

      const result = await this.request('/payment/iyzipos/checkoutform/initialize/auth/ecom', body)

      if (result.status === 'success') {
        return {
          success: true,
          transactionId: result.token,
          status: 'pending',
          redirectUrl: result.paymentPageUrl || undefined,
          gatewayResponse: {
            token: result.token,
            checkoutFormContent: result.checkoutFormContent,
            tokenExpireTime: result.tokenExpireTime,
          },
        }
      }

      return {
        success: false,
        transactionId: null,
        status: 'failed',
        errorMessage: result.errorMessage || 'Iyzico payment initialization failed',
        errorCode: result.errorCode,
        gatewayResponse: result,
      }
    } catch (error: unknown) {
      return {
        success: false,
        transactionId: null,
        status: 'failed',
        errorMessage: (error as Error).message,
        errorCode: 'IYZICO_ERROR',
        gatewayResponse: { error: (error as Error).message },
      }
    }
  }

  /**
   * Capture a payment (Iyzico auto-captures by default in checkout form flow).
   */
  async capturePayment(transactionId: string, _amount?: number): Promise<PaymentResult> {
    // Iyzico Checkout Form auto-captures. Retrieve the payment status.
    try {
      const result = await this.request('/payment/iyzipos/checkoutform/auth/ecom/detail', {
        token: transactionId,
      })

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        return {
          success: true,
          transactionId: result.paymentId || transactionId,
          status: 'captured',
          gatewayResponse: result,
        }
      }

      return {
        success: false,
        transactionId,
        status: 'failed',
        errorMessage: result.errorMessage || 'Payment not captured',
        gatewayResponse: result,
      }
    } catch (error: unknown) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        errorMessage: (error as Error).message,
        gatewayResponse: { error: (error as Error).message },
      }
    }
  }

  /**
   * Refund a payment (full or partial).
   */
  async refundPayment(
    transactionId: string,
    amount: number,
    _reason?: string
  ): Promise<RefundResult> {
    try {
      // First, get payment details to find the paymentTransactionId
      const details = await this.request('/payment/iyzipos/checkoutform/auth/ecom/detail', {
        token: transactionId,
      })

      // Find the payment transaction ID from the items
      const paymentTransactionId =
        details.itemTransactions?.[0]?.paymentTransactionId || transactionId

      const body = {
        paymentTransactionId,
        price: amount.toFixed(2),
        currency: details.currency || 'TRY',
        ip: '127.0.0.1',
      }

      const result = await this.request('/payment/refund', body)

      if (result.status === 'success') {
        return {
          success: true,
          refundId: result.paymentId || transactionId,
          amount,
          status: 'processed',
          gatewayResponse: result,
        }
      }

      return {
        success: false,
        refundId: null,
        amount,
        status: 'failed',
        errorMessage: result.errorMessage || 'Refund failed',
        gatewayResponse: result,
      }
    } catch (error: unknown) {
      return {
        success: false,
        refundId: null,
        amount,
        status: 'failed',
        errorMessage: (error as Error).message,
        gatewayResponse: { error: (error as Error).message },
      }
    }
  }

  /**
   * Cancel / void an authorized payment.
   */
  async voidPayment(transactionId: string): Promise<PaymentResult> {
    try {
      const details = await this.request('/payment/iyzipos/checkoutform/auth/ecom/detail', {
        token: transactionId,
      })

      const paymentId = details.paymentId || transactionId

      const result = await this.request('/payment/cancel', {
        paymentId,
        ip: '127.0.0.1',
      })

      if (result.status === 'success') {
        return {
          success: true,
          transactionId: paymentId,
          status: 'voided',
          gatewayResponse: result,
        }
      }

      return {
        success: false,
        transactionId,
        status: 'failed',
        errorMessage: result.errorMessage || 'Void failed',
        gatewayResponse: result,
      }
    } catch (error: unknown) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        errorMessage: (error as Error).message,
        gatewayResponse: { error: (error as Error).message },
      }
    }
  }

  /**
   * Get payment details from Iyzico.
   */
  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    const result = await this.request('/payment/iyzipos/checkoutform/auth/ecom/detail', {
      token: transactionId,
    })

    return {
      transactionId: result.paymentId || transactionId,
      amount: Number.parseFloat(result.paidPrice || result.price || '0'),
      currency: result.currency || 'TRY',
      status: this.mapPaymentStatus(result.paymentStatus),
      paymentMethod: result.cardAssociation ? `card_${result.cardAssociation.toLowerCase()}` : 'card',
      customerEmail: result.buyer?.email,
      createdAt: new Date(),
      metadata: {
        installment: result.installment,
        cardAssociation: result.cardAssociation,
        cardFamily: result.cardFamily,
        binNumber: result.binNumber,
        lastFourDigits: result.lastFourDigits,
        basketId: result.basketId,
      },
    }
  }

  /**
   * Verify Iyzico callback/webhook.
   * Iyzico posts the token back to your callbackUrl.
   */
  async verifyWebhook(payload: string | Buffer, _signature: string): Promise<WebhookEvent> {
    // Iyzico sends token in the callback POST body
    let token: string
    try {
      const body = JSON.parse(typeof payload === 'string' ? payload : payload.toString())
      token = body.token
    } catch {
      throw new Error('Invalid Iyzico webhook payload')
    }

    if (!token) {
      throw new Error('Missing token in Iyzico callback')
    }

    // Retrieve the actual payment details using the token
    const details = await this.request('/payment/iyzipos/checkoutform/auth/ecom/detail', {
      token,
    })

    const eventType = details.paymentStatus === 'SUCCESS'
      ? 'payment.success'
      : 'payment.failed'

    return {
      type: eventType,
      transactionId: token,
      data: details,
    }
  }

  // ── Iyzico API Client ──────────────────────────────────

  private async request(path: string, body: Record<string, unknown>): Promise<any> {
    const url = `${this.baseUrl}${path}`
    const jsonBody = JSON.stringify(body)
    const headers = this.buildHeaders(path, jsonBody)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: jsonBody,
    })

    if (!response.ok) {
      throw new Error(`Iyzico API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private buildHeaders(path: string, body: string): Record<string, string> {
    const randomString = Math.random().toString(36).substring(2, 10)
    const hashStr = `${this.apiKey}${randomString}${this.secretKey}${body}`
    const pkiString = this.generatePkiString(JSON.parse(body))

    // Authorization: IYZWSv2 header
    const hashPayload = `${path}${randomString}${body}`
    const signature = createHmac('sha256', this.secretKey)
      .update(hashPayload)
      .digest('base64')

    void hashStr
    void pkiString

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `IYZWSv2 ${this.apiKey}:${randomString}:${signature}`,
      'x-iyzi-rnd': randomString,
    }
  }

  private generatePkiString(obj: Record<string, unknown>, prefix = ''): string {
    const parts: string[] = []
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object' && !Array.isArray(value)) {
        parts.push(this.generatePkiString(value as Record<string, unknown>, fullKey))
      } else {
        parts.push(`${fullKey}=${value}`)
      }
    }
    return parts.join(',')
  }

  private mapCurrency(currency: string): string {
    const map: Record<string, string> = {
      TRY: 'TRY',
      USD: 'USD',
      EUR: 'EUR',
      GBP: 'GBP',
    }
    return map[currency.toUpperCase()] || 'TRY'
  }

  private mapPaymentStatus(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'captured'
      case 'FAILURE':
        return 'failed'
      case 'INIT_THREEDS':
      case 'CALLBACK_THREEDS':
        return 'pending'
      default:
        return status?.toLowerCase() || 'unknown'
    }
  }
}
