import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Store from '#models/store'
import User from '#models/user'
import Role from '#models/role'
import Permission from '#models/permission'
import Category from '#models/category'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'
import Customer from '#models/customer'
import CustomerAddress from '#models/customer_address'
import Discount from '#models/discount'
import TaxClass from '#models/tax_class'
import TaxRate from '#models/tax_rate'
import InventoryLocation from '#models/inventory_location'
import InventoryItem from '#models/inventory_item'
import Currency from '#models/currency'
import Locale from '#models/locale'
import Page from '#models/page'
import _Menu from '#models/menu'
import Banner from '#models/banner'
import Setting from '#models/setting'
import BlogCategory from '#models/blog_category'
import BlogPost from '#models/blog_post'
import Tag from '#models/tag'
import _Collection from '#models/collection'
import NotificationTemplate from '#models/notification_template'
import hash from '@adonisjs/core/services/hash'
import { randomUUID } from 'crypto'

export default class MainSeeder extends BaseSeeder {
  async run() {
    // Create default store
    const store = await Store.create({
      id: randomUUID(),
      name: 'AdonisCommerce Store',
      slug: 'adoniscommerce-store',
      defaultCurrency: 'USD',
      defaultLocale: 'en',
      timezone: 'America/New_York',
      isActive: true,
      config: {
        taxEnabled: true,
        taxRate: 8.875,
        shippingEnabled: true,
        lowStockThreshold: 10,
      },
      meta: {},
    })

    // Create permissions
    const permissions = await this.createPermissions()

    // Create roles
    const roles = await this.createRoles(permissions)

    // Create admin user
    await this.createAdmin(roles.superAdmin)

    // Create inventory location
    const location = await InventoryLocation.create({
      id: randomUUID(),
      storeId: store.id,
      name: 'Main Warehouse',
      code: 'MAIN',
      address: {
        line1: '123 Warehouse St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
      isActive: true,
      isFulfillmentCenter: true,
      priority: 1,
    })

    // Create categories
    const categories = await this.createCategories(store.id)

    // Create products
    await this.createProducts(store.id, categories, location.id)

    // Create customers
    await this.createCustomers(store.id)

    // Create discounts
    await this.createDiscounts(store.id)

    // Create tax class and rates
    await this.createTaxRates(store.id)

    // Create currencies
    await this.createCurrencies(store.id)

    // Create locales
    await this.createLocales(store.id)

    // Create tags
    await this.createTags(store.id)

    // Create pages
    await this.createPages(store.id)

    // Create banners
    await this.createBanners(store.id)

    // Create settings
    await this.createSettings(store.id)

    // Create notification templates
    await this.createNotificationTemplates(store.id)

    // Create blog posts
    await this.createBlogPosts(store.id)

    console.log('✅ Database seeded successfully!')
  }

  private async createPermissions() {
    const permissionNames = [
      'products.view', 'products.create', 'products.update', 'products.delete',
      'orders.view', 'orders.create', 'orders.update', 'orders.delete',
      'customers.view', 'customers.create', 'customers.update', 'customers.delete',
      'categories.view', 'categories.create', 'categories.update', 'categories.delete',
      'discounts.view', 'discounts.create', 'discounts.update', 'discounts.delete',
      'inventory.view', 'inventory.update',
      'settings.view', 'settings.update',
      'reports.view',
      'admins.view', 'admins.create', 'admins.update', 'admins.delete',
    ]

    const permissions: Permission[] = []
    for (const name of permissionNames) {
      const permission = await Permission.create({
        id: randomUUID(),
        name,
        slug: name,
        description: `Permission to ${name.replace('.', ' ')}`,
      })
      permissions.push(permission)
    }

    return permissions
  }

  private async createRoles(permissions: Permission[]) {
    const superAdmin = await Role.create({
      id: randomUUID(),
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full access to all features',
      isSystem: true,
    })
    await superAdmin.related('permissions').attach(permissions.map(p => p.id))

    const manager = await Role.create({
      id: randomUUID(),
      name: 'Manager',
      slug: 'manager',
      description: 'Manage products, orders, and customers',
      isSystem: false,
    })
    await manager.related('permissions').attach(
      permissions.filter(p => !p.name.startsWith('admins') && !p.name.startsWith('settings')).map(p => p.id)
    )

    const staff = await Role.create({
      id: randomUUID(),
      name: 'Staff',
      slug: 'staff',
      description: 'View and process orders',
      isSystem: false,
    })
    await staff.related('permissions').attach(
      permissions.filter(p => p.name.endsWith('.view') || p.name === 'orders.update').map(p => p.id)
    )

    return { superAdmin, manager, staff }
  }

  private async createAdmin(role: Role) {
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      roleId: role.id,
      twoFactorEnabled: false,
    })

    return admin
  }

  private async createCategories(storeId: string) {
    const categories: Category[] = []

    const electronics = await Category.create({
      id: randomUUID(),
      storeId,
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      isActive: true,
      position: 1,
    })
    categories.push(electronics)

    const phones = await Category.create({
      id: randomUUID(),
      storeId,
      parentId: electronics.id,
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      isActive: true,
      position: 1,
    })
    categories.push(phones)

    const laptops = await Category.create({
      id: randomUUID(),
      storeId,
      parentId: electronics.id,
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and notebooks',
      isActive: true,
      position: 2,
    })
    categories.push(laptops)

    const clothing = await Category.create({
      id: randomUUID(),
      storeId,
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      isActive: true,
      position: 2,
    })
    categories.push(clothing)

    const mens = await Category.create({
      id: randomUUID(),
      storeId,
      parentId: clothing.id,
      name: "Men's",
      slug: 'mens',
      isActive: true,
      position: 1,
    })
    categories.push(mens)

    const womens = await Category.create({
      id: randomUUID(),
      storeId,
      parentId: clothing.id,
      name: "Women's",
      slug: 'womens',
      isActive: true,
      position: 2,
    })
    categories.push(womens)

    const homeGarden = await Category.create({
      id: randomUUID(),
      storeId,
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home decor and garden supplies',
      isActive: true,
      position: 3,
    })
    categories.push(homeGarden)

    return categories
  }

  private async createProducts(storeId: string, categories: Category[], locationId: string) {
    const products = [
      {
        title: 'Premium Smartphone Pro Max',
        slug: 'premium-smartphone-pro-max',
        description: '<p>Experience the future with our flagship smartphone featuring:</p><ul><li>6.7" Super AMOLED Display</li><li>108MP Camera System</li><li>5000mAh Battery</li><li>5G Connectivity</li></ul>',
        shortDescription: 'Flagship smartphone with cutting-edge features',
        price: 999.99,
        compareAtPrice: 1199.99,
        sku: 'PHONE-001',
        type: 'variable',
        status: 'active',
        vendor: 'TechCorp',
        categoryIndex: 1, // smartphones
        variants: [
          { title: '128GB / Black', option1: '128GB', option2: 'Black', price: 999.99, sku: 'PHONE-001-128-BLK', quantity: 50 },
          { title: '128GB / White', option1: '128GB', option2: 'White', price: 999.99, sku: 'PHONE-001-128-WHT', quantity: 30 },
          { title: '256GB / Black', option1: '256GB', option2: 'Black', price: 1099.99, sku: 'PHONE-001-256-BLK', quantity: 25 },
          { title: '256GB / White', option1: '256GB', option2: 'White', price: 1099.99, sku: 'PHONE-001-256-WHT', quantity: 20 },
        ],
        options: [
          { name: 'Storage', values: ['128GB', '256GB'] },
          { name: 'Color', values: ['Black', 'White'] },
        ],
      },
      {
        title: 'Ultra Laptop 15"',
        slug: 'ultra-laptop-15',
        description: '<p>Professional-grade laptop for productivity and creativity.</p>',
        shortDescription: 'Powerful laptop for professionals',
        price: 1499.99,
        compareAtPrice: null,
        sku: 'LAPTOP-001',
        type: 'variable',
        status: 'active',
        vendor: 'TechCorp',
        categoryIndex: 2, // laptops
        variants: [
          { title: '16GB / 512GB SSD', option1: '16GB', option2: '512GB SSD', price: 1499.99, sku: 'LAPTOP-001-16-512', quantity: 20 },
          { title: '32GB / 1TB SSD', option1: '32GB', option2: '1TB SSD', price: 1899.99, sku: 'LAPTOP-001-32-1TB', quantity: 10 },
        ],
        options: [
          { name: 'RAM', values: ['16GB', '32GB'] },
          { name: 'Storage', values: ['512GB SSD', '1TB SSD'] },
        ],
      },
      {
        title: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-tshirt',
        description: '<p>Premium 100% organic cotton t-shirt. Comfortable and sustainable.</p>',
        shortDescription: 'Organic cotton everyday t-shirt',
        price: 29.99,
        compareAtPrice: 39.99,
        sku: 'SHIRT-001',
        type: 'variable',
        status: 'active',
        vendor: 'FashionStyle',
        categoryIndex: 4, // mens
        variants: [
          { title: 'S / Black', option1: 'S', option2: 'Black', price: 29.99, sku: 'SHIRT-001-S-BLK', quantity: 100 },
          { title: 'M / Black', option1: 'M', option2: 'Black', price: 29.99, sku: 'SHIRT-001-M-BLK', quantity: 150 },
          { title: 'L / Black', option1: 'L', option2: 'Black', price: 29.99, sku: 'SHIRT-001-L-BLK', quantity: 120 },
          { title: 'S / White', option1: 'S', option2: 'White', price: 29.99, sku: 'SHIRT-001-S-WHT', quantity: 80 },
          { title: 'M / White', option1: 'M', option2: 'White', price: 29.99, sku: 'SHIRT-001-M-WHT', quantity: 100 },
          { title: 'L / White', option1: 'L', option2: 'White', price: 29.99, sku: 'SHIRT-001-L-WHT', quantity: 90 },
        ],
        options: [
          { name: 'Size', values: ['S', 'M', 'L'] },
          { name: 'Color', values: ['Black', 'White'] },
        ],
      },
      {
        title: 'Elegant Summer Dress',
        slug: 'elegant-summer-dress',
        description: '<p>Flowy summer dress perfect for any occasion.</p>',
        shortDescription: 'Light and elegant summer dress',
        price: 79.99,
        compareAtPrice: null,
        sku: 'DRESS-001',
        type: 'variable',
        status: 'active',
        vendor: 'FashionStyle',
        categoryIndex: 5, // womens
        variants: [
          { title: 'XS / Floral', option1: 'XS', option2: 'Floral', price: 79.99, sku: 'DRESS-001-XS-FLR', quantity: 25 },
          { title: 'S / Floral', option1: 'S', option2: 'Floral', price: 79.99, sku: 'DRESS-001-S-FLR', quantity: 40 },
          { title: 'M / Floral', option1: 'M', option2: 'Floral', price: 79.99, sku: 'DRESS-001-M-FLR', quantity: 35 },
          { title: 'L / Floral', option1: 'L', option2: 'Floral', price: 79.99, sku: 'DRESS-001-L-FLR', quantity: 20 },
        ],
        options: [
          { name: 'Size', values: ['XS', 'S', 'M', 'L'] },
          { name: 'Pattern', values: ['Floral'] },
        ],
      },
      {
        title: 'Smart Home Hub',
        slug: 'smart-home-hub',
        description: '<p>Control your entire smart home from one central device.</p>',
        shortDescription: 'Central hub for smart home devices',
        price: 149.99,
        compareAtPrice: 199.99,
        sku: 'HOME-001',
        type: 'variable',
        status: 'active',
        vendor: 'HomeTech',
        categoryIndex: 6, // home & garden
        variants: [
          { title: 'Default', option1: 'Default', option2: null, price: 149.99, sku: 'HOME-001-DEF', quantity: 75 },
        ],
        options: [],
      },
    ]

    for (const productData of products) {
      const product = await Product.create({
        id: randomUUID(),
        storeId,
        title: productData.title,
        slug: productData.slug,
        description: productData.description,
        shortDescription: productData.shortDescription,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice,
        sku: productData.sku,
        type: productData.type as any,
        status: productData.status as any,
        vendor: productData.vendor,
        isFeatured: Math.random() > 0.5,
        trackInventory: true,
        hasVariants: productData.variants.length > 1,
      })

      // Attach category
      if (categories[productData.categoryIndex]) {
        await product.related('categories').attach([categories[productData.categoryIndex].id])
      }

      // Create variants
      for (let i = 0; i < productData.variants.length; i++) {
        const variantData = productData.variants[i]
        const variant = await ProductVariant.create({
          id: randomUUID(),
          productId: product.id,
          title: variantData.title,
          sku: variantData.sku,
          price: variantData.price,
          option1: variantData.option1,
          option2: variantData.option2,
          position: i,
          trackInventory: true,
          allowBackorder: false,
          isActive: true,
        })

        // Create inventory item
        await InventoryItem.create({
          id: randomUUID(),
          variantId: variant.id,
          locationId,
          quantity: variantData.quantity,
          reservedQuantity: 0,
          availableQuantity: variantData.quantity,
        })
      }
    }
  }

  private async createCustomers(storeId: string) {
    const customers = [
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1987654321',
      },
      {
        email: 'bob.wilson@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        phone: '+1555123456',
      },
    ]

    for (const customerData of customers) {
      const passwordHash = await hash.make('password123')

      const customer = await Customer.create({
        id: randomUUID(),
        storeId,
        email: customerData.email,
        passwordHash,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        status: 'active',
        acceptsMarketing: true,
        totalOrders: 0,
        totalSpent: 0,
        tags: [],
        metadata: {},
      })

      // Create address
      await CustomerAddress.create({
        id: randomUUID(),
        customerId: customer.id,
        type: 'shipping',
        isDefault: true,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        countryCode: 'US',
        phone: customerData.phone,
      })
    }
  }

  private async createDiscounts(storeId: string) {
    await Discount.create({
      id: randomUUID(),
      storeId,
      code: 'WELCOME10',
      name: 'Welcome Discount',
      type: 'percentage',
      value: 10,
      appliesTo: 'all',
      isActive: true,
      isPublic: true,
      usageLimit: 1000,
      usageCount: 0,
      minimumOrderAmount: 50,
    })

    await Discount.create({
      id: randomUUID(),
      storeId,
      code: 'SAVE20',
      name: '$20 Off',
      type: 'fixed_amount',
      value: 20,
      appliesTo: 'all',
      isActive: true,
      isPublic: true,
      usageLimit: 500,
      usageCount: 0,
      minimumOrderAmount: 100,
    })

    await Discount.create({
      id: randomUUID(),
      storeId,
      code: 'FREESHIP',
      name: 'Free Shipping',
      type: 'free_shipping',
      value: 0,
      appliesTo: 'all',
      isActive: true,
      isPublic: true,
      usageLimit: null,
      usageCount: 0,
      minimumOrderAmount: 75,
    })
  }

  private async createTaxRates(storeId: string) {
    // Create default tax class
    const taxClass = await TaxClass.create({
      id: randomUUID(),
      storeId,
      name: 'Standard',
      description: 'Standard tax class for most products',
      isDefault: true,
    })

    await TaxRate.create({
      id: randomUUID(),
      taxClassId: taxClass.id,
      name: 'NY State Tax',
      rate: 4,
      countryCode: 'US',
      stateCode: 'NY',
      isActive: true,
      isCompound: false,
      priority: 1,
    })

    await TaxRate.create({
      id: randomUUID(),
      taxClassId: taxClass.id,
      name: 'NYC Tax',
      rate: 4.5,
      countryCode: 'US',
      stateCode: 'NY',
      postalCode: '10001',
      isActive: true,
      isCompound: true,
      priority: 2,
    })

    await TaxRate.create({
      id: randomUUID(),
      taxClassId: taxClass.id,
      name: 'CA State Tax',
      rate: 7.25,
      countryCode: 'US',
      stateCode: 'CA',
      isActive: true,
      isCompound: false,
      priority: 1,
    })
  }

  private async createCurrencies(_storeId: string) {
    await Currency.create({
      id: randomUUID(),
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ',',
      exchangeRate: 1,
      isDefault: true,
      isActive: true,
    })

    await Currency.create({
      id: randomUUID(),
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      symbolPosition: 'after',
      decimalPlaces: 2,
      decimalSeparator: ',',
      thousandsSeparator: '.',
      exchangeRate: 0.92,
      isDefault: false,
      isActive: true,
    })

    await Currency.create({
      id: randomUUID(),
      code: 'TRY',
      name: 'Turkish Lira',
      symbol: '₺',
      symbolPosition: 'after',
      decimalPlaces: 2,
      decimalSeparator: ',',
      thousandsSeparator: '.',
      exchangeRate: 32.5,
      isDefault: false,
      isActive: true,
    })
  }

  private async createLocales(_storeId: string) {
    await Locale.create({
      id: randomUUID(),
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      isDefault: true,
      isActive: true,
    })

    await Locale.create({
      id: randomUUID(),
      code: 'tr',
      name: 'Turkish',
      nativeName: 'Türkçe',
      direction: 'ltr',
      isDefault: false,
      isActive: true,
    })
  }

  private async createTags(storeId: string) {
    const tagNames = ['new-arrival', 'bestseller', 'sale', 'featured', 'limited-edition']
    for (const name of tagNames) {
      await Tag.create({
        id: randomUUID(),
        storeId,
        name: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        slug: name,
      })
    }
  }

  private async createPages(storeId: string) {
    await Page.create({
      id: randomUUID(),
      storeId,
      title: 'About Us',
      slug: 'about',
      content: {
        blocks: [
          {
            type: 'text',
            data: { text: '<h2>About Our Store</h2><p>Welcome to AdonisCommerce Store. We are dedicated to providing the best products and services to our customers.</p>' },
          },
        ],
      },
      template: 'default',
      status: 'published',
      isSystem: false,
      metaTitle: 'About Us - AdonisCommerce Store',
      metaDescription: 'Learn about our store, our mission, and our team.',
    })

    await Page.create({
      id: randomUUID(),
      storeId,
      title: 'Contact Us',
      slug: 'contact',
      content: {
        blocks: [
          {
            type: 'text',
            data: { text: '<h2>Contact Us</h2><p>Email: support@example.com</p><p>Phone: +1 (555) 123-4567</p>' },
          },
        ],
      },
      template: 'default',
      status: 'published',
      isSystem: false,
    })

    await Page.create({
      id: randomUUID(),
      storeId,
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: {
        blocks: [
          {
            type: 'text',
            data: { text: '<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>' },
          },
        ],
      },
      template: 'default',
      status: 'published',
      isSystem: true,
    })

    await Page.create({
      id: randomUUID(),
      storeId,
      title: 'Terms of Service',
      slug: 'terms-of-service',
      content: {
        blocks: [
          {
            type: 'text',
            data: { text: '<h2>Terms of Service</h2><p>By using our website, you agree to the following terms and conditions.</p>' },
          },
        ],
      },
      template: 'default',
      status: 'published',
      isSystem: true,
    })
  }

  private async createBanners(storeId: string) {
    await Banner.create({
      id: randomUUID(),
      storeId,
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      imageUrl: '/images/banners/summer-sale.jpg',
      linkUrl: '/collections/sale',
      position: 'home',
      sortOrder: 1,
      isActive: true,
    })

    await Banner.create({
      id: randomUUID(),
      storeId,
      title: 'New Arrivals',
      subtitle: 'Check out our latest products',
      imageUrl: '/images/banners/new-arrivals.jpg',
      linkUrl: '/collections/new-arrivals',
      position: 'home',
      sortOrder: 2,
      isActive: true,
    })
  }

  private async createSettings(storeId: string) {
    const settings = [
      { group: 'general', key: 'store_name', value: 'AdonisCommerce Store', type: 'string' },
      { group: 'general', key: 'store_email', value: 'support@example.com', type: 'string' },
      { group: 'general', key: 'store_phone', value: '+1 (555) 123-4567', type: 'string' },
      { group: 'checkout', key: 'guest_checkout_enabled', value: true, type: 'boolean' },
      { group: 'checkout', key: 'minimum_order_amount', value: 0, type: 'number' },
      { group: 'shipping', key: 'free_shipping_threshold', value: 75, type: 'number' },
      { group: 'shipping', key: 'default_shipping_rate', value: 9.99, type: 'number' },
      { group: 'inventory', key: 'low_stock_threshold', value: 10, type: 'number' },
      { group: 'inventory', key: 'track_inventory', value: true, type: 'boolean' },
      { group: 'email', key: 'order_confirmation_enabled', value: true, type: 'boolean' },
      { group: 'email', key: 'shipping_notification_enabled', value: true, type: 'boolean' },
    ]

    for (const setting of settings) {
      await Setting.create({
        storeId,
        group: setting.group,
        key: setting.key,
        value: setting.value,
        type: setting.type as any,
        isPublic: setting.group === 'general',
      })
    }
  }

  private async createNotificationTemplates(storeId: string) {
    const templates = [
      {
        name: 'Order Confirmation',
        slug: 'order-confirmation',
        subject: 'Order Confirmed - #{{orderNumber}}',
        body: 'Thank you for your order #{{orderNumber}}. Your order total is {{total}}.',
        channel: 'email' as const,
        variables: ['orderNumber', 'total', 'customerName', 'items'],
      },
      {
        name: 'Shipping Notification',
        slug: 'shipping-notification',
        subject: 'Your Order Has Shipped - #{{orderNumber}}',
        body: 'Your order #{{orderNumber}} has been shipped. Tracking: {{trackingNumber}}',
        channel: 'email' as const,
        variables: ['orderNumber', 'trackingNumber', 'carrier', 'estimatedDelivery'],
      },
      {
        name: 'Password Reset',
        slug: 'password-reset',
        subject: 'Reset Your Password',
        body: 'Click the link to reset your password: {{resetLink}}',
        channel: 'email' as const,
        variables: ['resetLink', 'customerName'],
      },
      {
        name: 'Welcome Email',
        slug: 'welcome',
        subject: 'Welcome to {{storeName}}!',
        body: 'Welcome {{customerName}}! Thank you for creating an account.',
        channel: 'email' as const,
        variables: ['storeName', 'customerName'],
      },
    ]

    for (const template of templates) {
      await NotificationTemplate.create({
        id: randomUUID(),
        storeId,
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        body: template.body,
        channel: template.channel,
        variables: template.variables,
        isActive: true,
      })
    }
  }

  private async createBlogPosts(storeId: string) {
    const newsCategory = await BlogCategory.create({
      id: randomUUID(),
      storeId,
      name: 'News',
      slug: 'news',
      description: 'Latest store news and announcements',
      sortOrder: 1,
    })

    const guidesCategory = await BlogCategory.create({
      id: randomUUID(),
      storeId,
      name: 'Guides',
      slug: 'guides',
      description: 'Helpful guides and how-tos',
      sortOrder: 2,
    })

    await BlogCategory.create({
      id: randomUUID(),
      storeId,
      name: 'Style',
      slug: 'style',
      description: 'Style tips and inspiration',
      sortOrder: 3,
    })

    const now = new Date().toISOString()

    await BlogPost.create({
      id: randomUUID(),
      storeId,
      blogCategoryId: newsCategory.id,
      title: 'Welcome to Our Blog',
      slug: 'welcome-to-our-blog',
      excerpt: 'We are excited to launch our blog where we will share news, guides, and style tips.',
      content: '<h2>Hello and Welcome!</h2><p>We are thrilled to launch our new blog. Here you will find the latest news about our store, helpful guides, and style inspiration.</p><p>Stay tuned for more content coming soon!</p>',
      status: 'published',
      tags: ['announcement', 'welcome'],
      isFeatured: true,
      viewCount: 42,
      publishedAt: now as any,
    })

    await BlogPost.create({
      id: randomUUID(),
      storeId,
      blogCategoryId: guidesCategory.id,
      title: 'How to Choose the Perfect Gift',
      slug: 'how-to-choose-the-perfect-gift',
      excerpt: 'Finding the right gift can be challenging. Here are our top tips for choosing something special.',
      content: '<h2>Gift-Giving Made Easy</h2><p>Whether it is a birthday, anniversary, or holiday, finding the perfect gift does not have to be stressful.</p><h3>1. Consider Their Interests</h3><p>Think about what the recipient enjoys. Are they into tech, fashion, or home decor?</p><h3>2. Set a Budget</h3><p>Decide on a budget before you start shopping to narrow down your options.</p><h3>3. Add a Personal Touch</h3><p>Consider personalization or a handwritten note to make it extra special.</p>',
      status: 'published',
      tags: ['guide', 'gifts', 'tips'],
      isFeatured: false,
      viewCount: 18,
      publishedAt: now as any,
    })

    await BlogPost.create({
      id: randomUUID(),
      storeId,
      blogCategoryId: newsCategory.id,
      title: 'Summer Collection Now Available',
      slug: 'summer-collection-now-available',
      excerpt: 'Our new summer collection has arrived with fresh styles and vibrant colors.',
      content: '<h2>Summer is Here!</h2><p>We are excited to announce the arrival of our summer collection. Browse our latest products for the season.</p>',
      status: 'draft',
      tags: ['collection', 'summer'],
      isFeatured: false,
      viewCount: 0,
    })
  }
}
