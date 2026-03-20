import vine from '@vinejs/vine'

/**
 * Common country codes for phone validation
 */
export const COUNTRY_CODES = [
  'US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH',
  'AT', 'PL', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'GR', 'TR',
  'RU', 'UA', 'CN', 'JP', 'KR', 'IN', 'AU', 'NZ', 'BR', 'MX',
  'AR', 'CL', 'CO', 'PE', 'VE', 'ZA', 'EG', 'IL', 'SA', 'AE',
] as const

// Simple phone validator - basic string validation
// Phone format validation should be done on frontend or in a separate service
const phoneValidator = vine
  .string()
  .trim()
  .maxLength(20)
  .optional()

const addressSchema = vine.object({
  firstName: vine.string().trim().minLength(1).maxLength(100),
  lastName: vine.string().trim().minLength(1).maxLength(100),
  company: vine.string().trim().maxLength(255).optional(),
  address1: vine.string().trim().minLength(1).maxLength(255),
  address2: vine.string().trim().maxLength(255).optional(),
  city: vine.string().trim().minLength(1).maxLength(100),
  state: vine.string().trim().maxLength(100).optional(),
  postalCode: vine.string().trim().minLength(1).maxLength(20),
  country: vine.string().trim().minLength(2).maxLength(3).optional(),
  phone: phoneValidator,
})

export const checkoutValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    firstName: vine.string().trim().minLength(1).maxLength(100).optional(),
    lastName: vine.string().trim().minLength(1).maxLength(100).optional(),
    phone: phoneValidator,
    createAccount: vine.boolean().optional(),
    password: vine.string().minLength(8).optional().requiredWhen('createAccount', '=', true),
    billingAddress: addressSchema,
    sameAsShipping: vine.boolean().optional(),
    shippingAddress: addressSchema.optional().requiredWhen('sameAsShipping', '=', false),
    shippingMethod: vine.string().trim().minLength(1),
    notes: vine.string().trim().maxLength(1000).optional(),
    paymentMethod: vine.string().optional(),
  })
)

export const paymentValidator = vine.compile(
  vine.object({
    paymentMethod: vine.string().trim().minLength(1),
    cardToken: vine.string().optional(),
  })
)

export const validateOrderTotal = (expectedTotal: number, receivedTotal: number, tolerance: number = 0.01): boolean => {
  return Math.abs(expectedTotal - receivedTotal) <= tolerance
}
