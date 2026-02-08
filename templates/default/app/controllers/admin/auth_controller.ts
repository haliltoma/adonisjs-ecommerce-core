import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import User from '#models/user'

export default class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async showLogin({ inertia }: HttpContext) {
    return inertia.render('admin/auth/Login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password, remember } = request.only(['email', 'password', 'remember'])

    try {
      const user = await this.authService.authenticateAdmin({ email, password })

      if (!user) {
        session.flash('error', 'Invalid credentials')
        return response.redirect().back()
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        session.put('2fa_user_id', user.id)
        return response.redirect().toRoute('admin.auth.2fa')
      }

      await auth.use('web').login(user, remember === 'on')
      session.flash('success', 'Welcome back!')
      return response.redirect().toRoute('admin.dashboard')
    } catch (error) {
      session.flash('error', 'An error occurred during login')
      return response.redirect().back()
    }
  }

  async show2FA({ inertia, session, response }: HttpContext) {
    const userId = session.get('2fa_user_id')
    if (!userId) {
      return response.redirect().toRoute('admin.auth.login')
    }

    return inertia.render('admin/auth/TwoFactor')
  }

  async verify2FA({ request, response, auth, session }: HttpContext) {
    const userId = session.get('2fa_user_id')
    if (!userId) {
      return response.redirect().toRoute('admin.auth.login')
    }

    const { code } = request.only(['code'])

    try {
      const isValid = await this.authService.verifyTwoFactor(userId, code)

      if (!isValid) {
        session.flash('error', 'Invalid verification code')
        return response.redirect().back()
      }

      const user = await User.findOrFail(userId)
      session.forget('2fa_user_id')
      await auth.use('web').login(user)

      session.flash('success', 'Welcome back!')
      return response.redirect().toRoute('admin.dashboard')
    } catch (error) {
      session.flash('error', 'Verification failed')
      return response.redirect().back()
    }
  }

  async logout({ response, auth, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('success', 'You have been logged out')
    return response.redirect().toRoute('admin.auth.login')
  }

  async showForgotPassword({ inertia }: HttpContext) {
    return inertia.render('admin/auth/ForgotPassword')
  }

  async forgotPassword({ request, response, session }: HttpContext) {
    const { email } = request.only(['email'])

    try {
      const token = await this.authService.generatePasswordResetToken(email, true)

      if (token) {
        // Send password reset email
        // await mail.send(...)
      }

      // Always show success message to prevent email enumeration
      session.flash('success', 'If an account exists with this email, you will receive a password reset link.')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'An error occurred')
      return response.redirect().back()
    }
  }

  async showResetPassword({ params, inertia }: HttpContext) {
    return inertia.render('admin/auth/ResetPassword', {
      token: params.token,
    })
  }

  async resetPassword({ request, response, session }: HttpContext) {
    const { token, password } = request.only(['token', 'password'])

    try {
      const success = await this.authService.resetPassword({ token, password }, true)

      if (!success) {
        session.flash('error', 'Invalid or expired reset token')
        return response.redirect().back()
      }

      session.flash('success', 'Password has been reset. Please login with your new password.')
      return response.redirect().toRoute('admin.auth.login')
    } catch (error) {
      session.flash('error', 'An error occurred')
      return response.redirect().back()
    }
  }

  async showProfile({ inertia, auth }: HttpContext) {
    const user = auth.user!
    await user.load('role')

    return inertia.render('admin/auth/Profile', {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role?.name,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt?.toISO(),
        createdAt: user.createdAt.toISO(),
      },
    })
  }

  async updateProfile({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { firstName, lastName, email } = request.only(['firstName', 'lastName', 'email'])

    try {
      user.firstName = firstName
      user.lastName = lastName

      if (email !== user.email) {
        // Check if email is unique
        const existing = await User.query().where('email', email).whereNot('id', user.id).first()
        if (existing) {
          session.flash('error', 'Email already in use')
          return response.redirect().back()
        }
        user.email = email
      }

      await user.save()
      session.flash('success', 'Profile updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updatePassword({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    try {
      // Verify current password
      const isValid = await this.authService.authenticateAdmin({
        email: user.email,
        password: currentPassword,
      })

      if (!isValid) {
        session.flash('error', 'Current password is incorrect')
        return response.redirect().back()
      }

      await this.authService.updateAdminPassword(user.id, newPassword)
      session.flash('success', 'Password updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async enable2FA({ response, auth, session }: HttpContext) {
    const user = auth.user!

    try {
      const { secret, qrCode } = await this.authService.enableTwoFactor(user.id)
      session.put('2fa_setup_secret', secret)

      return response.json({ qrCode, secret })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async confirm2FA({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { code } = request.only(['code'])

    try {
      const isValid = await this.authService.confirmTwoFactor(user.id, code)

      if (!isValid) {
        return response.status(400).json({ error: 'Invalid verification code' })
      }

      session.forget('2fa_setup_secret')
      return response.json({ success: true })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async disable2FA({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { code } = request.only(['code'])

    try {
      const isValid = await this.authService.verifyTwoFactor(user.id, code)

      if (!isValid) {
        session.flash('error', 'Invalid verification code')
        return response.redirect().back()
      }

      await this.authService.disableTwoFactor(user.id)
      session.flash('success', 'Two-factor authentication disabled')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }
}
