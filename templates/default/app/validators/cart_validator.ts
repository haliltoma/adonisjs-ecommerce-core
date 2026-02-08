import vine from '@vinejs/vine'

export const addToCartValidator = vine.compile(
  vine.object({
    productId: vine.string().uuid(),
    variantId: vine.string().uuid().optional(),
    quantity: vine.number().min(1).max(100).optional(),
    metadata: vine.record(vine.any()).optional(),
  })
)

export const updateCartItemValidator = vine.compile(
  vine.object({
    quantity: vine.number().min(0).max(100),
    metadata: vine.record(vine.any()).optional(),
  })
)

export const applyDiscountValidator = vine.compile(
  vine.object({
    code: vine.string().trim().minLength(1).maxLength(50),
  })
)
