import { Head, Link, useForm } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    acceptTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/account/register')
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Create Account" />

      {/* Left Panel — Brand / Editorial */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-foreground text-background lg:flex">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex max-w-md flex-col items-start px-16">
          <h1 className="font-display animate-fade-up text-4xl leading-tight tracking-tight xl:text-5xl">
            AdonisCommerce
          </h1>
          <div className="animate-fade-up delay-200 mt-4 h-px w-16 bg-accent opacity-60" />
          <p className="animate-fade-up delay-300 mt-6 text-lg leading-relaxed opacity-70">
            Join a community that values quality, craftsmanship, and thoughtful design in every detail.
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            Begin Your Journey
          </p>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile brand — visible only below lg */}
          <div className="animate-fade-up mb-10 text-center lg:hidden">
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              AdonisCommerce
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Create Your Account</p>
          </div>

          {/* Form header */}
          <div className="animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">New Account</span>
            <h2 className="font-display text-2xl tracking-tight text-foreground mt-2">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join us and start shopping
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="animate-fade-up delay-200 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={data.firstName}
                  onChange={(e) => setData('firstName', e.target.value)}
                  required
                  autoFocus
                  className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
                />
                {errors.firstName && (
                  <p className="text-destructive text-sm">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={data.lastName}
                  onChange={(e) => setData('lastName', e.target.value)}
                  required
                  className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
                />
                {errors.lastName && (
                  <p className="text-destructive text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="animate-fade-up delay-300 space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            <div className="animate-fade-up delay-400 space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                required
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
            </div>

            <div className="animate-fade-up delay-500 space-y-2">
              <Label htmlFor="passwordConfirmation" className="text-xs uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                id="passwordConfirmation"
                type="password"
                value={data.passwordConfirmation}
                onChange={(e) =>
                  setData('passwordConfirmation', e.target.value)
                }
                required
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
              />
              {errors.passwordConfirmation && (
                <p className="text-destructive text-sm">
                  {errors.passwordConfirmation}
                </p>
              )}
            </div>

            <div className="animate-fade-up delay-500 flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={data.acceptTerms}
                onCheckedChange={(checked) =>
                  setData('acceptTerms', checked === true)
                }
                className="mt-0.5"
              />
              <Label htmlFor="acceptTerms" className="font-normal leading-snug text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="text-accent hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-destructive text-sm">{errors.acceptTerms}</p>
            )}

            <div className="animate-fade-up delay-600">
              <Button
                type="submit"
                className="h-11 w-full text-sm font-medium tracking-wide"
                disabled={processing}
              >
                {processing ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>

            <div className="animate-fade-up delay-600 relative my-2">
              <Separator />
              <span className="bg-background text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-sm">
                Or continue with
              </span>
            </div>

            <div className="animate-fade-up delay-700 grid gap-3 sm:grid-cols-2">
              <Button variant="outline" type="button" className="h-11 border-border/60">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" className="h-11 border-border/60">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </Button>
            </div>

            <div className="animate-fade-up delay-700 border-t border-border/40 pt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/account/login" className="text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
