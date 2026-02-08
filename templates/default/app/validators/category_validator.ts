import vine from '@vinejs/vine'

export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    slug: vine.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: vine.string().trim().optional(),
    imageUrl: vine.string().url().optional(),
    parentId: vine.string().uuid().optional(),
    metaTitle: vine.string().trim().maxLength(255).optional(),
    metaDescription: vine.string().trim().maxLength(500).optional(),
    isActive: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  })
)

export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    slug: vine.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: vine.string().trim().optional(),
    imageUrl: vine.string().url().optional(),
    parentId: vine.string().uuid().optional(),
    metaTitle: vine.string().trim().maxLength(255).optional(),
    metaDescription: vine.string().trim().maxLength(500).optional(),
    isActive: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  })
)

export const reorderCategoriesValidator = vine.compile(
  vine.object({
    categoryIds: vine.array(vine.string().uuid()).minLength(1),
  })
)
