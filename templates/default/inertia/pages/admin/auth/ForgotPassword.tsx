import { Head, Link, useForm } from '@inertiajs/react'
import { KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/forgot-password')
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Forgot Password - Admin" />

      {/* Left Panel — Brand / Editorial */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-foreground text-background lg:flex">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex max-w-md flex-col items-start px-16">
          <h1 className="font-display animate-fade-up text-4xl leading-tight tracking-tight xl:text-5xl">
            AdonisCommerce
          </h1>
          <div className="animate-fade-up delay-200 mt-4 h-px w-16 bg-accent opacity-60" />
          <p className="animate-fade-up delay-300 mt-6 text-lg leading-relaxed opacity-70">
            Everyone forgets. We will help you get back on track in no time.
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            Password Recovery
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
            <p className="mt-2 text-sm text-muted-foreground">Admin Portal</p>
          </div>

          {/* Icon + header */}
          <div className="animate-fade-up delay-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#e9b96e20' }}>
              <KeyRound className="h-7 w-7" style={{ color: '#d4872e' }} />
            </div>
            <h2 className="font-display mt-6 text-2xl tracking-tight text-foreground">
              Forgot Password
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
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
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="admin@example.com"
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
                autoFocus
                required
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
                {processing ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>

            <div className="animate-fade-up delay-400 border-t border-border/40 pt-5 text-center">
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
