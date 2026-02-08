import vine from '@vinejs/vine'

export const createDiscountValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    code: vine.string().trim().minLength(1).maxLength(50).regex(/^[A-Z0-9_-]+$/i),
    type: vine.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']),
    value: vine.number().min(0),
    minimumOrderAmount: vine.number().min(0).optional(),
    maximumDiscountAmount: vine.number().min(0).optional(),
    usageLimit: vine.number().min(0).optional(),
    usageLimitPerCustomer: vine.number().min(0).optional(),
    startsAt: vine.string().optional(),
    endsAt: vine.string().optional(),
    isActive: vine.boolean().optional(),
    isPublic: vine.boolean().optional(),
    firstOrderOnly: vine.boolean().optional(),
    appliesTo: vine.enum(['all', 'specific_products', 'specific_categories']).optional(),
    productIds: vine.array(vine.string().uuid()).optional(),
    categoryIds: vine.array(vine.string().uuid()).optional(),
    customerIds: vine.array(vine.string().uuid()).optional(),
  })
)

export const updateDiscountValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    code: vine.string().trim().minLength(1).maxLength(50).regex(/^[A-Z0-9_-]+$/i).optional(),
    type: vine.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']).optional(),
    value: vine.number().min(0).optional(),
    minimumOrderAmount: vine.number().min(0).optional(),
    maximumDiscountAmount: vine.number().min(0).optional(),
    usageLimit: vine.number().min(0).optional(),
    usageLimitPerCustomer: vine.number().min(0).optional(),
    startsAt: vine.string().optional(),
    endsAt: vine.string().optional(),
    isActive: vine.boolean().optional(),
    isPublic: vine.boolean().optional(),
    firstOrderOnly: vine.boolean().optional(),
    appliesTo: vine.enum(['all', 'specific_products', 'specific_categories']).optional(),
    productIds: vine.array(vine.string().uuid()).optional(),
    categoryIds: vine.array(vine.string().uuid()).optional(),
    customerIds: vine.array(vine.string().uuid()).optional(),
  })
)
