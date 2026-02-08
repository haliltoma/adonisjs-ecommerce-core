import vine from '@vinejs/vine'

export const createProductValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    slug: vine.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: vine.string().trim().optional(),
    shortDescription: vine.string().trim().maxLength(500).optional(),
    status: vine.enum(['draft', 'active', 'archived']).optional(),
    type: vine.enum(['simple', 'variable', 'digital', 'bundle', 'subscription']).optional(),
    vendor: vine.string().trim().maxLength(255).optional(),
    sku: vine.string().trim().maxLength(100).optional(),
    barcode: vine.string().trim().maxLength(100).optional(),
    price: vine.number().min(0).optional(),
    compareAtPrice: vine.number().min(0).optional(),
    costPrice: vine.number().min(0).optional(),
    isTaxable: vine.boolean().optional(),
    taxClassId: vine.string().uuid().optional(),
    weight: vine.number().min(0).optional(),
    weightUnit: vine.enum(['g', 'kg', 'lb', 'oz']).optional(),
    requiresShipping: vine.boolean().optional(),
    isFeatured: vine.boolean().optional(),
    metaTitle: vine.string().trim().maxLength(255).optional(),
    metaDescription: vine.string().trim().maxLength(500).optional(),
    metaKeywords: vine.string().trim().maxLength(255).optional(),
    categoryIds: vine.array(vine.string().uuid()).optional(),
    tagIds: vine.array(vine.string().uuid()).optional(),
    options: vine.array(
      vine.object({
        name: vine.string().trim().minLength(1),
        values: vine.array(vine.string().trim()).minLength(1),
      })
    ).optional(),
    variants: vine.array(
      vine.object({
        title: vine.string().trim().minLength(1).maxLength(255),
        sku: vine.string().trim().maxLength(100),
        barcode: vine.string().trim().maxLength(100).optional(),
        price: vine.number().min(0),
        compareAtPrice: vine.number().min(0).optional(),
        costPrice: vine.number().min(0).optional(),
        option1: vine.string().trim().maxLength(255).optional(),
        option2: vine.string().trim().maxLength(255).optional(),
        option3: vine.string().trim().maxLength(255).optional(),
        weight: vine.number().min(0).optional(),
        position: vine.number().min(0).optional(),
        isActive: vine.boolean().optional(),
        trackInventory: vine.boolean().optional(),
        allowBackorder: vine.boolean().optional(),
      })
    ).optional(),
    images: vine.array(
      vine.object({
        url: vine.string().url(),
        alt: vine.string().trim().maxLength(255).optional(),
        position: vine.number().min(0).optional(),
      })
    ).optional(),
  })
)

export const updateProductValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    slug: vine.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: vine.string().trim().optional(),
    shortDescription: vine.string().trim().maxLength(500).optional(),
    status: vine.enum(['draft', 'active', 'archived']).optional(),
    type: vine.enum(['simple', 'variable', 'digital', 'bundle', 'subscription']).optional(),
    vendor: vine.string().trim().maxLength(255).optional(),
    sku: vine.string().trim().maxLength(100).optional(),
    barcode: vine.string().trim().maxLength(100).optional(),
    price: vine.number().min(0).optional(),
    compareAtPrice: vine.number().min(0).optional(),
    costPrice: vine.number().min(0).optional(),
    isTaxable: vine.boolean().optional(),
    taxClassId: vine.string().uuid().optional(),
    weight: vine.number().min(0).optional(),
    weightUnit: vine.enum(['g', 'kg', 'lb', 'oz']).optional(),
    requiresShipping: vine.boolean().optional(),
    isFeatured: vine.boolean().optional(),
    metaTitle: vine.string().trim().maxLength(255).optional(),
    metaDescription: vine.string().trim().maxLength(500).optional(),
    metaKeywords: vine.string().trim().maxLength(255).optional(),
    categoryIds: vine.array(vine.string().uuid()).optional(),
    tagIds: vine.array(vine.string().uuid()).optional(),
  })
)

export const productSearchValidator = vine.compile(
  vine.object({
    query: vine.string().trim().minLength(1).maxLength(255),
    limit: vine.number().min(1).max(100).optional(),
  })
)
