import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
    firstName: vine.string().trim().minLength(1).maxLength(100),
    lastName: vine.string().trim().minLength(1).maxLength(100),
    phone: vine.string().trim().maxLength(20).optional(),
    acceptsMarketing: vine.boolean().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1).maxLength(100).optional(),
    lastName: vine.string().trim().minLength(1).maxLength(100).optional(),
    phone: vine.string().trim().maxLength(20).optional(),
    acceptsMarketing: vine.boolean().optional(),
    currentPassword: vine.string().minLength(1).optional(),
    newPassword: vine.string().minLength(8).optional(),
  })
)

export const createCustomerValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8).optional(),
    firstName: vine.string().trim().minLength(1).maxLength(100),
    lastName: vine.string().trim().minLength(1).maxLength(100),
    phone: vine.string().trim().maxLength(20).optional(),
    acceptsMarketing: vine.boolean().optional(),
    tags: vine.array(vine.string().trim()).optional(),
    notes: vine.string().trim().optional(),
    groupId: vine.string().uuid().optional(),
  })
)

export const updateCustomerValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1).maxLength(100).optional(),
    lastName: vine.string().trim().minLength(1).maxLength(100).optional(),
    phone: vine.string().trim().maxLength(20).optional(),
    acceptsMarketing: vine.boolean().optional(),
    tags: vine.array(vine.string().trim()).optional(),
    notes: vine.string().trim().optional(),
    groupId: vine.string().uuid().optional(),
  })
)

export const addressValidator = vine.compile(
  vine.object({
    type: vine.enum(['billing', 'shipping', 'both']).optional(),
    isDefault: vine.boolean().optional(),
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
)
