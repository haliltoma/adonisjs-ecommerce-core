import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import Store from '#models/store'
import User from '#models/user'
import Customer from '#models/customer'
import Product from '#models/product'
import Category from '#models/category'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import Discount from '#models/discount'
import Review from '#models/review'

export const StoreFactory = factory
  .define(Store, ({ faker }) => ({
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    defaultCurrency: 'USD',
    defaultLocale: 'en',
    timezone: 'UTC',
    isActive: true,
    config: {},
    meta: {},
  }))
  .build()

export const UserFactory = factory
  .define(User, ({ faker }) => ({
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'password123',
    isActive: true,
    twoFactorEnabled: false,
  }))
  .build()

export const CustomerFactory = factory
  .define(Customer, ({ faker }) => ({
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    status: 'active' as const,
    acceptsMarketing: faker.datatype.boolean(),
    totalOrders: 0,
    totalSpent: 0,
    tags: [],
    metadata: {},
  }))
  .build()

export const ProductFactory = factory
  .define(Product, ({ faker }) => ({
    title: faker.commerce.productName(),
    slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
    description: faker.commerce.productDescription(),
    shortDescription: faker.lorem.sentence(),
    status: 'active' as const,
    type: 'simple' as const,
    sku: faker.string.alphanumeric(8).toUpperCase(),
    price: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
    isTaxable: true,
    requiresShipping: true,
    trackInventory: true,
    stockQuantity: faker.number.int({ min: 0, max: 1000 }),
    hasVariants: false,
    isFeatured: false,
    sortOrder: 0,
    customFields: {},
    weightUnit: 'kg' as const,
  }))
  .build()

export const CategoryFactory = factory
  .define(Category, ({ faker }) => ({
    name: faker.commerce.department(),
    slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
    description: faker.lorem.sentence(),
    position: faker.number.int({ min: 0, max: 100 }),
    depth: 0,
    isActive: true,
  }))
  .build()

export const OrderFactory = factory
  .define(Order, ({ faker }) => ({
    orderNumber: `ORD-${faker.string.numeric(8)}`,
    email: faker.internet.email(),
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    fulfillmentStatus: 'unfulfilled' as const,
    currencyCode: 'USD',
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    grandTotal: 0,
    totalPaid: 0,
    totalRefunded: 0,
    billingAddress: {},
    shippingAddress: {},
    metadata: {},
    placedAt: DateTime.now(),
  }))
  .build()

export const OrderItemFactory = factory
  .define(OrderItem, ({ faker }) => ({
    sku: faker.string.alphanumeric(8).toUpperCase(),
    title: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    unitPrice: parseFloat(faker.commerce.price({ min: 5, max: 200 })),
    totalPrice: 0,
    discountAmount: 0,
    taxAmount: 0,
    taxRate: 0,
    fulfilledQuantity: 0,
    returnedQuantity: 0,
    properties: {},
  }))
  .build()

export const CartFactory = factory
  .define(Cart, () => ({
    currencyCode: 'USD',
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    grandTotal: 0,
    totalItems: 0,
    totalQuantity: 0,
    metadata: {},
  }))
  .build()

export const CartItemFactory = factory
  .define(CartItem, ({ faker }) => ({
    sku: faker.string.alphanumeric(8).toUpperCase(),
    title: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    unitPrice: parseFloat(faker.commerce.price({ min: 5, max: 200 })),
    totalPrice: 0,
    discountAmount: 0,
    taxAmount: 0,
    metadata: {},
  }))
  .build()

export const DiscountFactory = factory
  .define(Discount, ({ faker }) => ({
    code: faker.string.alphanumeric(8).toUpperCase(),
    name: faker.lorem.words(3),
    type: 'percentage' as const,
    value: faker.number.int({ min: 5, max: 50 }),
    appliesTo: 'all' as const,
    usageCount: 0,
    isActive: true,
    isPublic: true,
    firstOrderOnly: false,
    isAutomatic: false,
    priority: 0,
    isCombinable: false,
  }))
  .build()

export const ReviewFactory = factory
  .define(Review, ({ faker }) => ({
    rating: faker.number.int({ min: 1, max: 5 }),
    title: faker.lorem.sentence({ min: 2, max: 6 }),
    content: faker.lorem.paragraph(),
    isVerifiedPurchase: false,
    status: 'pending' as const,
    helpfulCount: 0,
    reportCount: 0,
  }))
  .build()
