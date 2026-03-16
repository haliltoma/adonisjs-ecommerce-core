/**
 * Payment Provider Factory
 *
 * Creates payment provider instances based on configuration.
 * Implements Open/Closed Principle: New providers can be added without modifying existing code.
 *
 * OCP: Open for extension (add new providers), closed for modification
 */

import env from '#start/env'
import { PaymentProvider } from '#contracts/payment_provider'

// Available payment providers
import { StripePaymentProvider } from '#services/payment/stripe_payment_provider'
import { IyzicoPaymentProvider } from '#services/payment/iyzico_payment_provider'
import { ManualPaymentProvider } from '#services/payment/manual_payment_provider'

/**
 * Payment Provider Factory
 */
export default class PaymentProviderFactory {
  private static providers: Map<string, new () => PaymentProvider> = new Map()

  /**
   * Register a payment provider
   */
  static registerProvider(name: string, providerClass: new () => PaymentProvider): void {
    this.providers.set(name.toLowerCase(), providerClass)
  }

  /**
   * Get payment provider by name
   */
  static getProvider(name?: string): PaymentProvider {
    const providerName = (name || env.get('PAYMENT_PROVIDER', 'manual')).toLowerCase()

    const ProviderClass = this.providers.get(providerName)

    if (!ProviderClass) {
      throw new Error(`Payment provider not found: ${providerName}`)
    }

    return new ProviderClass()
  }

  /**
   * Check if provider is registered
   */
  static hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase())
  }

  /**
   * Get all registered provider names
   */
  static getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}

/**
 * Register default providers
 */
PaymentProviderFactory.registerProvider('stripe', StripePaymentProvider)
PaymentProviderFactory.registerProvider('iyzico', IyzicoPaymentProvider)
PaymentProviderFactory.registerProvider('manual', ManualPaymentProvider)
