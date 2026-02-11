import { Head, Link, useForm } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/use-translation'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/account/forgot-password')
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Forgot Password" />

      {/* Left Panel — Brand / Editorial */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-foreground text-background lg:flex">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex max-w-md flex-col items-start px-16">
          <h1 className="font-display animate-fade-up text-4xl leading-tight tracking-tight xl:text-5xl">
            AdonisCommerce
          </h1>
          <div className="animate-fade-up delay-200 mt-4 h-px w-16 bg-accent opacity-60" />
          <p className="animate-fade-up delay-300 mt-6 text-lg leading-relaxed opacity-70">
            {t('storefront.forgotPasswordPage.brandTagline')}
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            {t('storefront.forgotPasswordPage.accountRecovery')}
          </p>
        </div>
      </div>

      {/* Right Panel — Forgot Password Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile brand — visible only below lg */}
          <div className="animate-fade-up mb-10 text-center lg:hidden">
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              AdonisCommerce
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('storefront.forgotPasswordPage.accountRecovery')}</p>
          </div>

          {/* Form header */}
          <div className="animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.forgotPasswordPage.recoveryLabel')}</span>
            <h2 className="font-display text-2xl tracking-tight text-foreground mt-2">
              {t('storefront.forgotPasswordPage.title')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('storefront.forgotPasswordPage.description')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="animate-fade-up delay-200 space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('storefront.forgotPasswordPage.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('storefront.forgotPasswordPage.emailPlaceholder')}
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
                autoFocus
                autoComplete="email"
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            <div className="animate-fade-up delay-300">
              <Button
                type="submit"
                className="h-11 w-full text-sm font-medium tracking-wide"
                disabled={processing}
              >
                {processing ? t('storefront.forgotPasswordPage.sending') : t('storefront.forgotPasswordPage.sendResetLink')}
              </Button>
            </div>

            <div className="animate-fade-up delay-400 border-t border-border/40 pt-5 text-center">
              <p className="text-sm text-muted-foreground">
                {t('storefront.forgotPasswordPage.rememberPassword')}{' '}
                <Link href="/account/login" className="text-accent hover:underline">
                  {t('storefront.forgotPasswordPage.signIn')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
