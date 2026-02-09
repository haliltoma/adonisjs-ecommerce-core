import { Head, Link, useForm } from '@inertiajs/react'
import { ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TwoFactor() {
  const { data, setData, post, processing, errors } = useForm({
    code: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/2fa')
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Two-Factor Authentication - Admin" />

      {/* Left Panel — Brand / Editorial */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-foreground text-background lg:flex">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex max-w-md flex-col items-start px-16">
          <h1 className="font-display animate-fade-up text-4xl leading-tight tracking-tight xl:text-5xl">
            AdonisCommerce
          </h1>
          <div className="animate-fade-up delay-200 mt-4 h-px w-16 bg-accent opacity-60" />
          <p className="animate-fade-up delay-300 mt-6 text-lg leading-relaxed opacity-70">
            Security is the foundation of trust. Verify your identity to continue.
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            Two-Factor Authentication
          </p>
        </div>
      </div>

      {/* Right Panel — 2FA Form */}
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
              <ShieldCheck className="h-7 w-7" style={{ color: '#d4872e' }} />
            </div>
            <h2 className="font-display mt-6 text-2xl tracking-tight text-foreground">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="animate-fade-up delay-200 space-y-2">
              <Label htmlFor="code" className="text-xs uppercase tracking-wider text-muted-foreground">
                Authentication Code
              </Label>
              <Input
                id="code"
                value={data.code}
                onChange={(e) => setData('code', e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="h-11 border-border/60 bg-background text-center text-2xl tracking-widest transition-colors focus-visible:border-accent"
                autoFocus
                required
              />
              {errors.code && (
                <p className="text-destructive text-sm">{errors.code}</p>
              )}
            </div>

            <div className="animate-fade-up delay-300">
              <Button
                type="submit"
                className="h-11 w-full text-sm font-medium tracking-wide"
                disabled={processing}
              >
                {processing ? 'Verifying...' : 'Verify'}
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

          {/* Footer */}
          <p className="animate-fade-up delay-500 mt-8 text-center text-xs text-muted-foreground">
            Lost access to your authenticator?{' '}
            <Link href="/admin/forgot-password" className="text-accent hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
