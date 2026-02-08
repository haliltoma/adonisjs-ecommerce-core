import vine from '@vinejs/vine'

const addressSchema = vine.object({
  firstName: vine.string().trim().minLength(1).maxLength(100),
  lastName: vine.string().trim().minLength(1).maxLength(100),
  company: vine.string().trim().maxLength(255).optional(),
  address1: vine.string().trim().minLength(1).maxLength(255),
  address2: vine.string().trim().maxLength(255).optional(),
  city: vine.string().trim().minLength(1).maxLength(100),
  state: vine.string().trim().maxLength(100).optional(),
  postalCode: vine.string().trim().minLength(1).maxLength(20),
  country: vine.string().trim().minLength(2).maxLength(2),
  phone: vine.string().trim().maxLength(20).optional(),
})

export const checkoutValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    createAccount: vine.boolean().optional(),
    password: vine.string().minLength(8).optional().requiredWhen('createAccount', '=', true),
    billingAddress: addressSchema,
    sameAsShipping: vine.boolean().optional(),
    shippingAddress: addressSchema.optional().requiredWhen('sameAsShipping', '=', false),
    shippingMethod: vine.string().trim().minLength(1),
    notes: vine.string().trim().maxLength(1000).optional(),
  })
)

export const paymentValidator = vine.compile(
  vine.object({
    paymentMethod: vine.enum(['card', 'paypal', 'bank_transfer']),
    cardToken: vine.string().optional(),
  })
)
