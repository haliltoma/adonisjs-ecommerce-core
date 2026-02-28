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
 * Bank Transfer Payment Provider
 *
 * Handles offline bank transfer (EFT/Havale) payments.
 * Payment is created as "pending" and must be confirmed manually by admin
 * after verifying the bank transfer.
 *
 * Env vars (optional, used for display):
 *   BANK_ACCOUNT_NAME
 *   BANK_ACCOUNT_IBAN
 *   BANK_ACCOUNT_BANK
 *   BANK_ACCOUNT_BRANCH
 */
export class BankTransferPaymentProvider extends PaymentProvider {
  readonly name = 'bank_transfer'
  readonly displayName = 'Bank Transfer (EFT/Havale)'
  readonly supportsRefunds = true
  readonly supportsPartialRefunds = true

  /**
   * Bank account details displayed to the customer after checkout.
   */
  getBankDetails(): BankAccountInfo {
    return {
      accountName: process.env.BANK_ACCOUNT_NAME || 'AdonisCommerce Ltd.',
      iban: process.env.BANK_ACCOUNT_IBAN || '',
      bankName: process.env.BANK_ACCOUNT_BANK || '',
      branchCode: process.env.BANK_ACCOUNT_BRANCH || '',
      swiftCode: process.env.BANK_ACCOUNT_SWIFT || '',
    }
  }

  /**
   * Create a bank transfer payment.
   * Returns as "pending" — admin must manually confirm once transfer is received.
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const transactionId = `bt_${randomUUID()}`
    const bankDetails = this.getBankDetails()

    return {
      success: true,
      transactionId,
      status: 'pending',
      gatewayResponse: {
        provider: 'bank_transfer',
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        instructions: {
          message: `Please transfer ${params.amount} ${params.currency} to the following bank account. Use order reference "${params.orderId}" in the transfer description.`,
          accountName: bankDetails.accountName,
          iban: bankDetails.iban,
          bankName: bankDetails.bankName,
          branchCode: bankDetails.branchCode,
          swiftCode: bankDetails.swiftCode,
          reference: params.orderId,
        },
        createdAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Capture (confirm) a bank transfer payment.
   * Called by admin when the transfer is verified.
   */
  async capturePayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'captured',
      gatewayResponse: {
        provider: 'bank_transfer',
        confirmedAmount: amount,
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'admin',
      },
    }
  }

  /**
   * Refund a bank transfer.
   * Records the refund — actual bank transfer must be done manually by admin.
   */
  async refundPayment(
    transactionId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResult> {
    return {
      success: true,
      refundId: `bt_refund_${randomUUID()}`,
      amount,
      status: 'pending', // Pending until admin confirms the refund transfer
      gatewayResponse: {
        provider: 'bank_transfer',
        originalTransaction: transactionId,
        reason,
        note: 'Please process the refund bank transfer manually and mark as completed.',
        createdAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Void a pending bank transfer (cancel before confirmation).
   */
  async voidPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'voided',
      gatewayResponse: {
        provider: 'bank_transfer',
        voidedAt: new Date().toISOString(),
        note: 'Bank transfer cancelled before confirmation.',
      },
    }
  }

  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    return {
      transactionId,
      amount: 0,
      currency: 'TRY',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      createdAt: new Date(),
      metadata: {
        provider: 'bank_transfer',
        note: 'Bank transfer details are managed offline.',
      },
    }
  }

  async verifyWebhook(
    _payload: string | Buffer,
    _signature: string
  ): Promise<WebhookEvent> {
    throw new Error('Bank transfer provider does not support webhooks')
  }
}

interface BankAccountInfo {
  accountName: string
  iban: string
  bankName: string
  branchCode: string
  swiftCode: string
}
