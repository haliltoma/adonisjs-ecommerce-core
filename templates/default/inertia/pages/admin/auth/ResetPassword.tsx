import { Head, Link, useForm } from '@inertiajs/react'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  token: string
}

export default function ResetPassword({ token }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    token,
    password: '',
    passwordConfirmation: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/reset-password')
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Reset Password - Admin" />

      {/* Left Panel — Brand / Editorial */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-foreground text-background lg:flex">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex max-w-md flex-col items-start px-16">
          <h1 className="font-display animate-fade-up text-4xl leading-tight tracking-tight xl:text-5xl">
            AdonisCommerce
          </h1>
          <div className="animate-fade-up delay-200 mt-4 h-px w-16 bg-accent opacity-60" />
          <p className="animate-fade-up delay-300 mt-6 text-lg leading-relaxed opacity-70">
            A fresh start. Choose a strong password and get back to building.
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            Password Reset
          </p>
        </div>
      </div>

      {/* Right Panel — Reset Password Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile brand — visible only below lg */}
          <div className="animate-fade-up mb-10 text-center lg:hidden">
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              AdonisCommerce
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Admin Portal</p>
          </div>

          {/* Icon + header */}
          <div className="animate-fade-up delay-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#e9b96e20' }}>
              <Lock className="h-7 w-7" style={{ color: '#d4872e' }} />
            </div>
            <h2 className="font-display mt-6 text-2xl tracking-tight text-foreground">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="animate-fade-up delay-200 space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Enter your new password"
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
                autoFocus
                required
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
            </div>

            <div className="animate-fade-up delay-300 space-y-2">
              <Label htmlFor="passwordConfirmation" className="text-xs uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                id="passwordConfirmation"
                type="password"
                value={data.passwordConfirmation}
                onChange={(e) => setData('passwordConfirmation', e.target.value)}
                placeholder="Confirm your new password"
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
                required
              />
            </div>

            <div className="animate-fade-up delay-400">
              <Button
                type="submit"
                className="h-11 w-full text-sm font-medium tracking-wide"
                disabled={processing}
              >
                {processing ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>

            <div className="animate-fade-up delay-500 border-t border-border/40 pt-5 text-center">
              <Link
                href="/admin/login"
                className="text-xs text-accent hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
