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
import DigitalProduct from '#models/digital_product'
import Download from '#models/download'
import Subscription from '#models/subscription'
import SubscriptionItem from '#models/subscription_item'
import License from '#models/license'

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

export const DigitalProductFactory = factory
  .define(DigitalProduct, ({ faker }) => ({
    fileName: faker.system.fileName({ extensionCount: 1 }),
    filePath: `/uploads/digital/${faker.string.uuid()}.pdf`,
    fileMimeType: 'application/pdf',
    fileSize: faker.number.int({ min: 100000, max: 50000000 }),
    fileHash: faker.string.hexadecimal({ length: 64 }),
    requiresLicense: faker.datatype.boolean(),
    licenseDurationDays: faker.datatype.boolean() ? 365 : null,
    version: faker.system.semver(),
    releaseNotes: faker.lorem.paragraph(),
  }))
  .build()

export const DownloadFactory = factory
  .define(Download, ({ faker }) => ({
    downloadCount: faker.number.int({ min: 0, max: 5 }),
    maxDownloads: faker.number.int({ min: 3, max: 10 }),
    expiresAt: faker.date.future({ years: 1 }),
    lastDownloadedAt: faker.date.recent({ days: 10 }),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    status: 'active' as const,
  }))
  .relation(() => ProductFactory)
  .build()

export const SubscriptionFactory = factory
  .define(Subscription, ({ faker }) => ({
    status: 'active' as const,
    billingInterval: 'monthly' as const,
    intervalCount: 1,
    amount: parseFloat(faker.commerce.price({ min: 9.99, max: 99.99 })),
    currencyCode: 'USD',
    trialPeriodDays: faker.datatype.boolean() ? 14 : null,
    trialEndsAt: faker.date.future({ days: 14 }),
    startsAt: faker.date.recent({ days: 30 }),
    currentPeriodStartsAt: faker.date.recent({ days: 10 }),
    currentPeriodEndsAt: faker.date.future({ days: 20 }),
    providerSubscriptionId: faker.string.uuid(),
    providerCustomerId: faker.string.uuid(),
    providerPlanId: faker.string.uuid(),
    metadata: {},
  }))
  .build()

export const SubscriptionItemFactory = factory
  .define(SubscriptionItem, ({ faker }) => ({
    amount: parseFloat(faker.commerce.price({ min: 9.99, max: 99.99 })),
    quantity: 1,
    description: faker.commerce.productName(),
    metadata: {},
  }))
  .build()

export const LicenseFactory = factory
  .define(License, ({ faker }) => ({
    licenseKey: faker.string.alphanumeric(16).toUpperCase(),
    licenseType: 'standard',
    maxActivations: faker.number.int({ min: 1, max: 5 }),
    currentActivations: faker.number.int({ min: 0, max: 2 }),
    validFrom: faker.date.past({ years: 1 }),
    validUntil: faker.date.future({ years: 1 }),
    status: 'active' as const,
    activations: [],
    metadata: {},
  }))
  .build()
