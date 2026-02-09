import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface Customer {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  acceptsMarketing: boolean
}

interface Props {
  customer: Customer
}

export default function Profile({ customer }: Props) {
  const profileForm = useForm({
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || '',
  })

  const passwordForm = useForm({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: '',
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    profileForm.patch('/account/profile')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    passwordForm.patch('/account/password', {
      onSuccess: () => {
        passwordForm.reset()
      },
    })
  }

  return (
    <StorefrontLayout>
      <Head title="Profile" />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="animate-fade-up mb-8">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/account">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
          </Button>
        </div>

        <div className="animate-fade-up delay-100">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Settings</span>
          <h1 className="font-display text-3xl tracking-tight mt-2">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account details and password.
          </p>
        </div>

        {/* Profile Form */}
        <Card className="animate-fade-up delay-200 mt-8 border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-tight">Personal Information</CardTitle>
            <CardDescription>Update your name and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profileForm.data.firstName}
                    onChange={(e) => profileForm.setData('firstName', e.target.value)}
                    className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  />
                  {profileForm.errors.firstName && (
                    <p className="text-destructive text-sm">{profileForm.errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profileForm.data.lastName}
                    onChange={(e) => profileForm.setData('lastName', e.target.value)}
                    className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  />
                  {profileForm.errors.lastName && (
                    <p className="text-destructive text-sm">{profileForm.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  disabled
                  className="h-11 border-border/60"
                />
                <p className="text-muted-foreground text-xs">
                  Email cannot be changed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileForm.data.phone}
                  onChange={(e) => profileForm.setData('phone', e.target.value)}
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                />
                {profileForm.errors.phone && (
                  <p className="text-destructive text-sm">{profileForm.errors.phone}</p>
                )}
              </div>

              <Button
                type="submit"
                className="h-11 text-sm font-medium tracking-wide"
                disabled={profileForm.processing}
              >
                {profileForm.processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Form */}
        <Card className="animate-fade-up delay-300 mt-6 border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-tight">Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.data.currentPassword}
                  onChange={(e) => passwordForm.setData('currentPassword', e.target.value)}
                  required
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                />
                {passwordForm.errors.currentPassword && (
                  <p className="text-destructive text-sm">{passwordForm.errors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs uppercase tracking-wider text-muted-foreground">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.data.newPassword}
                  onChange={(e) => passwordForm.setData('newPassword', e.target.value)}
                  required
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                />
                {passwordForm.errors.newPassword && (
                  <p className="text-destructive text-sm">{passwordForm.errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPasswordConfirmation" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="newPasswordConfirmation"
                  type="password"
                  value={passwordForm.data.newPasswordConfirmation}
                  onChange={(e) => passwordForm.setData('newPasswordConfirmation', e.target.value)}
                  required
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                />
              </div>

              <Button
                type="submit"
                className="h-11 text-sm font-medium tracking-wide"
                disabled={passwordForm.processing}
              >
                {passwordForm.processing ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  )
}
