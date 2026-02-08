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

export const createOrderValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    phone: vine.string().trim().maxLength(20).optional(),
    customerId: vine.string().uuid().optional(),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    sameAsShipping: vine.boolean().optional(),
    shippingMethodId: vine.string().uuid().optional(),
    notes: vine.string().trim().maxLength(1000).optional(),
    paymentMethodId: vine.string().uuid().optional(),
  })
)

export const updateOrderStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
    note: vine.string().trim().maxLength(1000).optional(),
  })
)

export const createFulfillmentValidator = vine.compile(
  vine.object({
    locationId: vine.string().uuid().optional(),
    trackingNumber: vine.string().trim().maxLength(255).optional(),
    trackingUrl: vine.string().url().optional(),
    carrier: vine.string().trim().maxLength(100).optional(),
    notes: vine.string().trim().maxLength(1000).optional(),
    items: vine.array(
      vine.object({
        orderItemId: vine.string().uuid(),
        quantity: vine.number().min(1),
      })
    ).minLength(1),
  })
)

export const createRefundValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().maxLength(255).optional(),
    notes: vine.string().trim().maxLength(1000).optional(),
    refundShipping: vine.boolean().optional(),
    items: vine.array(
      vine.object({
        orderItemId: vine.string().uuid(),
        quantity: vine.number().min(1),
        restock: vine.boolean(),
      })
    ).minLength(1),
  })
)
