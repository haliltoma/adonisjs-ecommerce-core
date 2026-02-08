import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(1),
    remember: vine.boolean().optional(),
  })
)

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

export const updatePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string().minLength(1),
    newPassword: vine.string().minLength(8),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().minLength(1),
    password: vine.string().minLength(8),
  })
)

export const twoFactorValidator = vine.compile(
  vine.object({
    code: vine.string().minLength(6).maxLength(6),
  })
)
