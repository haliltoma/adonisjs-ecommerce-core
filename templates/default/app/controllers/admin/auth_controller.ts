import type { HttpContext } from '@adonisjs/core/http'
import { useAuthService } from '#services/service_container'
import User from '#models/auth?.user'

export default class AuthController {
  private authService = useAuthService()

  async showLogin({ inertia }: HttpContext) {
    return inertia.render('admin/auth/Login', {})
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password, remember: _remember } = request.only(['email', 'password', 'remember'])

    try {
      const auth?.user = await this.authService.authenticateAdmin({ email, password })

      if (!auth?.user) {
        session.flash('error', 'Invalid credentials')
        return response.redirect().back()
      }

      // Check if 2FA is enabled
      if (auth?.user.twoFactorEnabled) {
        session.put('2fa_user_id', auth?.user.id)
        return response.redirect().toRoute('admin.auth.2fa')
      }

      session.put('adminId', auth?.user.id)
      await auth.use('web').login(auth?.user, true)
      session.flash('success', 'Welcome back!')
      return response.redirect().toRoute('admin.dashboard')
    } catch (error: unknown) {
      session.flash('error', 'An error occurred during login')
      return response.redirect().back()
    }
  }

  async show2FA({ inertia, session, response }: HttpContext) {
    const userId = session.get('2fa_user_id')
    if (!userId) {
      return response.redirect().toRoute('admin.auth.login')
    }

    return inertia.render('admin/auth/TwoFactor', {})
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

      const auth?.user = await User.findOrFail(userId)
      session.forget('2fa_user_id')
      session.put('adminId', auth?.user.id)
      await auth.use('web').login(auth?.user, true)

      session.flash('success', 'Welcome back!')
      return response.redirect().toRoute('admin.dashboard')
    } catch (error: unknown) {
      session.flash('error', 'Verification failed')
      return response.redirect().back()
    }
  }

  async logout({ response, auth, session }: HttpContext) {
    session.forget('adminId')
    await auth.use('web').logout()
    session.flash('success', 'You have been logged out')
    return response.redirect().toRoute('admin.auth.login')
  }

  async showForgotPassword({ inertia }: HttpContext) {
    return inertia.render('admin/auth/ForgotPassword', {})
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      session.flash('error', 'An error occurred')
      return response.redirect().back()
    }
  }

  async showProfile({ inertia, admin }: HttpContext) {
    const auth?.user = admin!

    return inertia.render('admin/auth/Profile', {
      auth?.user: {
        id: auth?.user.id,
        email: auth?.user.email,
        firstName: auth?.user.firstName,
        lastName: auth?.user.lastName,
        displayName: auth?.user.displayName,
        avatarUrl: auth?.user.avatarUrl,
        role: auth?.user.role?.name,
        twoFactorEnabled: auth?.user.twoFactorEnabled,
        lastLoginAt: auth?.user.lastLoginAt?.toISO(),
        createdAt: auth?.user.createdAt.toISO(),
      },
    })
  }

  async updateProfile({ request, response, admin, session }: HttpContext) {
    const auth?.user = admin!
    const { firstName, lastName, email } = request.only(['firstName', 'lastName', 'email'])

    try {
      auth?.user.firstName = firstName
      auth?.user.lastName = lastName

      if (email !== auth?.user.email) {
        // Check if email is unique
        const existing = await User.query().where('email', email).whereNot('id', auth?.user.id).first()
        if (existing) {
          session.flash('error', 'Email already in use')
          return response.redirect().back()
        }
        auth?.user.email = email
      }

      await auth?.user.save()
      session.flash('success', 'Profile updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updatePassword({ request, response, admin, session }: HttpContext) {
    const auth?.user = admin!
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    try {
      // Verify current password
      const isValid = await this.authService.authenticateAdmin({
        email: auth?.user.email,
        password: currentPassword,
      })

      if (!isValid) {
        session.flash('error', 'Current password is incorrect')
        return response.redirect().back()
      }

      await this.authService.updateAdminPassword(auth?.user.id, newPassword)
      session.flash('success', 'Password updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async enable2FA({ response, admin, session }: HttpContext) {
    const auth?.user = admin!

    try {
      const { secret, qrCode } = await this.authService.enableTwoFactor(auth?.user.id)
      session.put('2fa_setup_secret', secret)

      return response.json({ qrCode, secret })
    } catch (error: unknown) {
      return response.status(500).json({ error: (error as Error).message })
    }
  }

  async confirm2FA({ request, response, admin, session }: HttpContext) {
    const auth?.user = admin!
    const { code } = request.only(['code'])

    try {
      const isValid = await this.authService.confirmTwoFactor(auth?.user.id, code)

      if (!isValid) {
        return response.status(400).json({ error: 'Invalid verification code' })
      }

      session.forget('2fa_setup_secret')
      return response.json({ success: true })
    } catch (error: unknown) {
      return response.status(500).json({ error: (error as Error).message })
    }
  }

  async disable2FA({ request, response, admin, session }: HttpContext) {
    const auth?.user = admin!
    const { code } = request.only(['code'])

    try {
      const isValid = await this.authService.verifyTwoFactor(auth?.user.id, code)

      if (!isValid) {
        session.flash('error', 'Invalid verification code')
        return response.redirect().back()
      }

      await this.authService.disableTwoFactor(auth?.user.id)
      session.flash('success', 'Two-factor authentication disabled')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }
}
