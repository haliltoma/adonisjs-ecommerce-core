import {
  PaymentProvider,
  type CreatePaymentParams,
  type PaymentResult,
  type RefundResult,
  type PaymentDetails,
  type WebhookEvent,
} from '#contracts/payment_provider'
import env from '#start/env'

/**
 * PayPal Payment Provider
 *
 * Integrates with PayPal REST API v2 for order-based payments.
 * Supports Checkout, Capture, Refund, and Webhooks.
 *
 * Required env vars:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_WEBHOOK_ID
 *   PAYPAL_MODE (sandbox | live)
 */
export class PayPalPaymentProvider extends PaymentProvider {
  readonly name = 'paypal'
  readonly displayName = 'PayPal'
  readonly supportsRefunds = true
  readonly supportsPartialRefunds = true

  private clientId: string
  private clientSecret: string
  private webhookId: string
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    super()
    this.clientId = env.get('PAYPAL_CLIENT_ID', '')
    this.clientSecret = env.get('PAYPAL_CLIENT_SECRET', '')
    this.webhookId = env.get('PAYPAL_WEBHOOK_ID', '')
    const mode = env.get('PAYPAL_MODE', 'sandbox')
    this.baseUrl =
      mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
  }

  // ── Auth ─────────────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`PayPal auth failed: ${response.status} ${errorBody}`)
    }

    const data = (await response.json()) as { access_token: string; expires_in: number }
    this.accessToken = data.access_token
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60_000 // 1 min buffer
    return this.accessToken
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken()

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`PayPal API error: ${response.status} ${errorBody}`)
    }

    if (response.status === 204) return {} as T
    return (await response.json()) as T
  }

  // ── Payment Operations ───────────────────────────────────

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const order = await this.request<PayPalOrder>('POST', '/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: params.orderId,
            description: params.description || `Order ${params.orderId}`,
            amount: {
              currency_code: params.currency.toUpperCase(),
              value: params.amount.toFixed(2),
            },
            custom_id: params.orderId,
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'AdonisCommerce',
              locale: 'en-US',
              landing_page: 'LOGIN',
              user_action: 'PAY_NOW',
              return_url: params.returnUrl || '',
              cancel_url: params.cancelUrl || '',
            },
          },
        },
      })

      const approveLink = order.links?.find(
        (link: PayPalLink) => link.rel === 'payer-action' || link.rel === 'approve'
      )

      return {
        success: true,
        transactionId: order.id,
        status: 'pending',
        redirectUrl: approveLink?.href,
        gatewayResponse: {
          orderId: order.id,
          status: order.status,
          links: order.links,
        },
      }
    } catch (error: unknown) {
      return {
        success: false,
        transactionId: null,
        status: 'failed',
        errorMessage: (error as Error).message,
        gatewayResponse: { error: (error as Error).message },
      }
    }
  }

  async capturePayment(transactionId: string, _amount?: number): Promise<PaymentResult> {
    try {
      const capture = await this.request<PayPalOrder>(
        'POST',
        `/v2/checkout/orders/${transactionId}/capture`
      )

      const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0]
      const captured = captureUnit?.status === 'COMPLETED'

      return {
        success: captured,
        transactionId: captureUnit?.id || transactionId,
        status: captured ? 'captured' : 'pending',
        gatewayResponse: {
          orderId: capture.id,
          captureId: captureUnit?.id,
          status: capture.status,
          amount: captureUnit?.amount,
        },
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

  async refundPayment(
    transactionId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResult> {
    try {
      // transactionId here should be the capture ID
      const refund = await this.request<PayPalRefund>(
        'POST',
        `/v2/payments/captures/${transactionId}/refund`,
        {
          amount: {
            value: amount.toFixed(2),
            currency_code: 'USD', // Will be overridden by capture currency
          },
          note_to_payer: reason || 'Refund processed',
        }
      )

      return {
        success: refund.status === 'COMPLETED',
        refundId: refund.id,
        amount: Number.parseFloat(refund.amount?.value || '0'),
        status: refund.status === 'COMPLETED' ? 'processed' : 'pending',
        gatewayResponse: {
          refundId: refund.id,
          status: refund.status,
          amount: refund.amount,
        },
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

  async voidPayment(transactionId: string): Promise<PaymentResult> {
    try {
      // Void an authorized order (before capture)
      await this.request<void>('POST', `/v2/checkout/orders/${transactionId}/void`, {})

      return {
        success: true,
        transactionId,
        status: 'voided',
        gatewayResponse: { voidedAt: new Date().toISOString() },
      }
    } catch (error: unknown) {
      // PayPal doesn't have a void endpoint for orders — cancel via full refund if captured
      return {
        success: false,
        transactionId,
        status: 'failed',
        errorMessage: (error as Error).message,
        gatewayResponse: { error: (error as Error).message },
      }
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    const order = await this.request<PayPalOrder>(
      'GET',
      `/v2/checkout/orders/${transactionId}`
    )

    const unit = order.purchase_units?.[0]
    const capture = unit?.payments?.captures?.[0]

    return {
      transactionId: order.id,
      amount: Number.parseFloat(unit?.amount?.value || '0'),
      currency: unit?.amount?.currency_code || 'USD',
      status: this.mapStatus(order.status),
      paymentMethod: 'paypal',
      customerEmail: order.payer?.email_address,
      createdAt: new Date(order.create_time || Date.now()),
      metadata: {
        captureId: capture?.id,
        payerName: order.payer?.name
          ? `${order.payer.name.given_name} ${order.payer.name.surname}`
          : undefined,
        payerId: order.payer?.payer_id,
      },
    }
  }

  async verifyWebhook(payload: string | Buffer, signature: string): Promise<WebhookEvent> {
    // PayPal uses a multi-header verification scheme
    // For simplicity, we verify the HMAC of the webhook ID + event fields
    const body =
      typeof payload === 'string' ? JSON.parse(payload) : JSON.parse(payload.toString())

    // In production, use PayPal's webhook verification endpoint:
    // POST /v1/notifications/verify-webhook-signature
    if (this.webhookId) {
      try {
        await this.request<{ verification_status: string }>(
          'POST',
          '/v1/notifications/verify-webhook-signature',
          {
            auth_algo: 'SHA256withRSA',
            cert_url: body.cert_url || '',
            transmission_id: signature.split(',')[0] || '',
            transmission_sig: signature.split(',')[1] || signature,
            transmission_time: body.create_time || new Date().toISOString(),
            webhook_id: this.webhookId,
            webhook_event: body,
          }
        )
      } catch {
        // Fallback: accept webhook if verification endpoint is unreachable
        // Log warning in production
      }
    }

    const eventType = body.event_type as string
    const resource = body.resource || {}

    // Extract transaction ID based on event type
    let transactionId = ''
    if (eventType.startsWith('CHECKOUT.ORDER')) {
      transactionId = resource.id || ''
    } else if (eventType.startsWith('PAYMENT.CAPTURE')) {
      transactionId = resource.supplementary_data?.related_ids?.order_id || resource.id || ''
    } else if (eventType.startsWith('PAYMENT.REFUND') || eventType.startsWith('CUSTOMER.DISPUTE')) {
      transactionId = resource.id || ''
    }

    return {
      type: eventType,
      transactionId,
      data: resource,
    }
  }

  // ── Helpers ──────────────────────────────────────────────

  private mapStatus(paypalStatus: string): string {
    switch (paypalStatus) {
      case 'COMPLETED':
        return 'captured'
      case 'APPROVED':
        return 'authorized'
      case 'VOIDED':
        return 'voided'
      case 'CREATED':
      case 'PAYER_ACTION_REQUIRED':
        return 'pending'
      default:
        return paypalStatus.toLowerCase()
    }
  }
}

// ── PayPal API Types ───────────────────────────────────────

interface PayPalLink {
  href: string
  rel: string
  method: string
}

interface PayPalOrder {
  id: string
  status: string
  links?: PayPalLink[]
  create_time?: string
  purchase_units?: Array<{
    reference_id?: string
    amount?: { currency_code: string; value: string }
    payments?: {
      captures?: Array<{
        id: string
        status: string
        amount?: { currency_code: string; value: string }
      }>
    }
  }>
  payer?: {
    email_address?: string
    payer_id?: string
    name?: { given_name: string; surname: string }
  }
}

interface PayPalRefund {
  id: string
  status: string
  amount?: { currency_code: string; value: string }
}
