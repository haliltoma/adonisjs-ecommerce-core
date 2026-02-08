import User from '#models/user'
import Customer from '#models/customer'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'

interface AdminLoginDTO {
  email: string
  password: string
}

interface CustomerLoginDTO {
  storeId: string
  email: string
  password: string
}

interface CustomerRegisterDTO {
  storeId: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  acceptsMarketing?: boolean
}

interface PasswordResetDTO {
  token: string
  password: string
}

export default class AuthService {
  // Admin Authentication
  async authenticateAdmin(data: AdminLoginDTO): Promise<User | null> {
    const user = await User.query()
      .where('email', data.email.toLowerCase())
      .where('isActive', true)
      .first()

    if (!user) {
      return null
    }

    const isValid = await hash.verify(user.password, data.password)
    if (!isValid) {
      return null
    }

    // Update last login
    user.lastLoginAt = DateTime.now()
    await user.save()

    return user
  }

  async createAdmin(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    roleId?: string
  }): Promise<User> {
    const passwordHash = await hash.make(data.password)

    return await User.create({
      email: data.email.toLowerCase(),
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId,
      isActive: true,
      twoFactorEnabled: false,
    })
  }

  async updateAdminPassword(userId: number, newPassword: string): Promise<void> {
    const user = await User.findOrFail(userId)
    user.password = await hash.make(newPassword)
    await user.save()
  }

  // Customer Authentication
  async authenticateCustomer(data: CustomerLoginDTO): Promise<Customer | null> {
    const customer = await Customer.query()
      .where('storeId', data.storeId)
      .where('email', data.email.toLowerCase())
      .where('status', 'active')
      .whereNull('deletedAt')
      .first()

    if (!customer || !customer.passwordHash) {
      return null
    }

    const isValid = await hash.verify(customer.passwordHash, data.password)
    if (!isValid) {
      return null
    }

    return customer
  }

  async registerCustomer(data: CustomerRegisterDTO): Promise<Customer> {
    // Check if customer already exists
    const existing = await Customer.query()
      .where('storeId', data.storeId)
      .where('email', data.email.toLowerCase())
      .first()

    if (existing) {
      throw new Error('Email already registered')
    }

    const passwordHash = await hash.make(data.password)

    return await Customer.create({
      storeId: data.storeId,
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      status: 'active',
      acceptsMarketing: data.acceptsMarketing ?? false,
      totalOrders: 0,
      totalSpent: 0,
      tags: [],
      metadata: {},
    })
  }

  async updateCustomerPassword(customerId: string, newPassword: string): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.passwordHash = await hash.make(newPassword)
    await customer.save()
  }

  // Password Reset
  async generatePasswordResetToken(email: string, isAdmin: boolean = false): Promise<string | null> {
    const token = string.random(64)
    const expiresAt = DateTime.now().plus({ hours: 24 })

    if (isAdmin) {
      const user = await User.query().where('email', email.toLowerCase()).first()
      if (!user) return null

      // Store token in database (would need a password_resets table)
      // For now, returning the token
      return token
    } else {
      const customer = await Customer.query().where('email', email.toLowerCase()).first()
      if (!customer) return null

      // Store token in database
      return token
    }
  }

  async verifyPasswordResetToken(token: string): Promise<boolean> {
    // Would verify against password_resets table
    return true
  }

  async resetPassword(data: PasswordResetDTO, isAdmin: boolean = false): Promise<boolean> {
    const isValid = await this.verifyPasswordResetToken(data.token)
    if (!isValid) return false

    // Would look up the email from the token and update password
    return true
  }

  // Two-Factor Authentication
  async enableTwoFactor(userId: number): Promise<{ secret: string; qrCode: string }> {
    const user = await User.findOrFail(userId)

    // Generate TOTP secret
    const secret = string.random(32)

    user.twoFactorSecret = secret
    await user.save()

    // Generate QR code URL (would use a TOTP library)
    const qrCode = `otpauth://totp/AdonisCommerce:${user.email}?secret=${secret}&issuer=AdonisCommerce`

    return { secret, qrCode }
  }

  async confirmTwoFactor(userId: number, code: string): Promise<boolean> {
    const user = await User.findOrFail(userId)

    if (!user.twoFactorSecret) {
      return false
    }

    // Verify TOTP code (would use a TOTP library)
    const isValid = true // Placeholder

    if (isValid) {
      user.twoFactorEnabled = true
      await user.save()
    }

    return isValid
  }

  async disableTwoFactor(userId: number): Promise<void> {
    const user = await User.findOrFail(userId)
    user.twoFactorSecret = null
    user.twoFactorEnabled = false
    await user.save()
  }

  async verifyTwoFactor(userId: number, code: string): Promise<boolean> {
    const user = await User.findOrFail(userId)

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return true // 2FA not enabled, skip verification
    }

    // Verify TOTP code (would use a TOTP library)
    return true // Placeholder
  }

  // Session Management
  async invalidateAllSessions(userId: number): Promise<void> {
    // Would invalidate all sessions for the user
    // Implementation depends on session storage strategy
  }

  // Email Verification
  async generateEmailVerificationToken(email: string): Promise<string> {
    return string.random(64)
  }

  async verifyEmail(customerId: string): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.emailVerifiedAt = DateTime.now()
    await customer.save()
  }
}
