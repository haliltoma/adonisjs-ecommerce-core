import { Head, Link, useForm } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
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
            Curated collections, timeless design. Your account is the gateway to an elevated shopping experience.
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            Customer Portal
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
            <p className="mt-2 text-sm text-muted-foreground">Customer Portal</p>
          </div>

          {/* Form header */}
          <div className="animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Account</span>
            <h2 className="font-display text-2xl tracking-tight text-foreground mt-2">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="animate-fade-up delay-200 space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
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
                  Password
                </Label>
                <Link
                  href="/account/forgot-password"
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
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
                Remember me for 30 days
              </Label>
            </div>

            <div className="animate-fade-up delay-500">
              <Button
                type="submit"
                className="h-11 w-full text-sm font-medium tracking-wide"
                disabled={processing}
              >
                {processing ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>

            <div className="animate-fade-up delay-600 border-t border-border/40 pt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/account/register" className="text-accent hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <p className="animate-fade-up delay-700 mt-8 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
