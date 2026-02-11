import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { useTranslation } from '@/hooks/use-translation'
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
  const { t } = useTranslation()
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
      <Head title={t('storefront.profilePage.profileSettings')} />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="animate-fade-up mb-8">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/account">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('storefront.profilePage.backToAccount')}
            </Link>
          </Button>
        </div>

        <div className="animate-fade-up delay-100">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.profilePage.settings')}</span>
          <h1 className="font-display text-3xl tracking-tight mt-2">{t('storefront.profilePage.profileSettings')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('storefront.profilePage.profileDesc')}
          </p>
        </div>

        {/* Profile Form */}
        <Card className="animate-fade-up delay-200 mt-8 border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-tight">{t('storefront.profilePage.personalInfo')}</CardTitle>
            <CardDescription>{t('storefront.profilePage.personalInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t('storefront.profilePage.firstName')}
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
                    {t('storefront.profilePage.lastName')}
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
                  {t('storefront.profilePage.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  disabled
                  className="h-11 border-border/60"
                />
                <p className="text-muted-foreground text-xs">
                  {t('storefront.profilePage.emailCannotChange')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('storefront.profilePage.phone')}
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
                {profileForm.processing ? t('storefront.profilePage.saving') : t('storefront.profilePage.saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Form */}
        <Card className="animate-fade-up delay-300 mt-6 border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-tight">{t('storefront.profilePage.changePassword')}</CardTitle>
            <CardDescription>{t('storefront.profilePage.changePasswordDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('storefront.profilePage.currentPassword')}
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
                  {t('storefront.profilePage.newPassword')}
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
                  {t('storefront.profilePage.confirmNewPassword')}
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
                {passwordForm.processing ? t('storefront.profilePage.updating') : t('storefront.profilePage.updatePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  )
}
