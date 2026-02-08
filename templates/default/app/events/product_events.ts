import { BaseEvent } from '@adonisjs/core/events'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'

/**
 * Product Created Event
 */
export class ProductCreated extends BaseEvent {
  constructor(public product: Product) {
    super()
  }
}

/**
 * Product Updated Event
 */
export class ProductUpdated extends BaseEvent {
  constructor(
    public product: Product,
    public changes: Partial<Product>
  ) {
    super()
  }
}

/**
 * Product Deleted Event
 */
export class ProductDeleted extends BaseEvent {
  constructor(public product: Product) {
    super()
  }
}

/**
 * Product Published Event
 */
export class ProductPublished extends BaseEvent {
  constructor(public product: Product) {
    super()
  }
}

/**
 * Product Archived Event
 */
export class ProductArchived extends BaseEvent {
  constructor(public product: Product) {
    super()
  }
}

/**
 * Product Variant Created Event
 */
export class VariantCreated extends BaseEvent {
  constructor(
    public product: Product,
    public variant: ProductVariant
  ) {
    super()
  }
}

/**
 * Product Variant Updated Event
 */
export class VariantUpdated extends BaseEvent {
  constructor(
    public variant: ProductVariant,
    public changes: Partial<ProductVariant>
  ) {
    super()
  }
}

/**
 * Product Variant Deleted Event
 */
export class VariantDeleted extends BaseEvent {
  constructor(public variant: ProductVariant) {
    super()
  }
}

/**
 * Product Low Stock Event
 */
export class ProductLowStock extends BaseEvent {
  constructor(
    public product: Product,
    public variant: ProductVariant | null,
    public currentStock: number,
    public threshold: number
  ) {
    super()
  }
}

/**
 * Product Out of Stock Event
 */
export class ProductOutOfStock extends BaseEvent {
  constructor(
    public product: Product,
    public variant: ProductVariant | null
  ) {
    super()
  }
}

/**
 * Product Back in Stock Event
 */
export class ProductBackInStock extends BaseEvent {
  constructor(
    public product: Product,
    public variant: ProductVariant | null,
    public quantity: number
  ) {
    super()
  }
}
