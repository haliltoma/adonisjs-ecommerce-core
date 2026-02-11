import { Head, Link, useForm, usePage } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/use-translation'

export default function Login() {
  const { t } = useTranslation()
  const { props } = usePage<{ flash?: { error?: string; success?: string } }>()
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/account/login')
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Login" />

      {/* Left Panel — Brand / Editorial */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-foreground text-background lg:flex">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex max-w-md flex-col items-start px-16">
          <h1 className="font-display animate-fade-up text-4xl leading-tight tracking-tight xl:text-5xl">
            AdonisCommerce
          </h1>
          <div className="animate-fade-up delay-200 mt-4 h-px w-16 bg-accent opacity-60" />
          <p className="animate-fade-up delay-300 mt-6 text-lg leading-relaxed opacity-70">
            {t('storefront.loginPage.brandTagline')}
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            {t('storefront.loginPage.customerPortal')}
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile brand — visible only below lg */}
          <div className="animate-fade-up mb-10 text-center lg:hidden">
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              AdonisCommerce
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('storefront.loginPage.customerPortal')}</p>
          </div>

          {/* Form header */}
          <div className="animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.loginPage.accountLabel')}</span>
            <h2 className="font-display text-2xl tracking-tight text-foreground mt-2">
              {t('storefront.loginPage.welcomeBack')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('storefront.loginPage.signInDesc')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {props.flash?.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {props.flash.error}
              </div>
            )}
            {props.flash?.success && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                {props.flash.success}
              </div>
            )}

            <div className="animate-fade-up delay-200 space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('storefront.loginPage.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('storefront.loginPage.emailPlaceholder')}
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

            <div className="animate-fade-up delay-300 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('storefront.loginPage.password')}
                </Label>
                <Link
                  href="/account/forgot-password"
                  className="text-xs text-accent hover:underline"
                >
                  {t('storefront.loginPage.forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('storefront.loginPage.passwordPlaceholder')}
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
            </div>

            <div className="animate-fade-up delay-400 flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={data.remember}
                onCheckedChange={(checked) =>
                  setData('remember', checked === true)
                }
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal leading-none text-muted-foreground"
              >
                {t('storefront.loginPage.rememberMe')}
              </Label>
            </div>

            <div className="animate-fade-up delay-500">
              <Button
                type="submit"
                className="h-11 w-full text-sm font-medium tracking-wide"
                disabled={processing}
              >
                {processing ? t('storefront.loginPage.signingIn') : t('storefront.loginPage.signIn')}
              </Button>
            </div>

            {/* Social Login */}
            <div className="animate-fade-up delay-600">
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground tracking-wider">
                    {t('storefront.loginPage.orContinueWith')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-11 border-border/60" asChild>
                  <a href="/auth/google/redirect">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </a>
                </Button>
                <Button variant="outline" className="h-11 border-border/60" asChild>
                  <a href="/auth/facebook/redirect">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                </Button>
              </div>
            </div>

            <div className="animate-fade-up delay-700 border-t border-border/40 pt-5 text-center">
              <p className="text-sm text-muted-foreground">
                {t('storefront.loginPage.noAccount')}{' '}
                <Link href="/account/register" className="text-accent hover:underline">
                  {t('storefront.loginPage.createOne')}
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <p className="animate-fade-up delay-700 mt-8 text-center text-xs text-muted-foreground">
            {t('storefront.loginPage.termsAgreement')}{' '}
            <Link href="/terms" className="text-accent hover:underline">
              {t('storefront.loginPage.termsOfService')}
            </Link>{' '}
            {t('storefront.loginPage.and')}{' '}
            <Link href="/privacy" className="text-accent hover:underline">
              {t('storefront.loginPage.privacyPolicy')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
