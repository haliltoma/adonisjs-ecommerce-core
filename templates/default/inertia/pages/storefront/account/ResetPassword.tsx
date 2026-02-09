import { Head, useForm } from '@inertiajs/react'

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
    post('/account/reset-password')
  }

  return (
    <div className="flex min-h-screen">
      <Head title="Reset Password" />

      {/* Left Panel — Brand / Editorial */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-foreground text-background lg:flex">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex max-w-md flex-col items-start px-16">
          <h1 className="font-display animate-fade-up text-4xl leading-tight tracking-tight xl:text-5xl">
            AdonisCommerce
          </h1>
          <div className="animate-fade-up delay-200 mt-4 h-px w-16 bg-accent opacity-60" />
          <p className="animate-fade-up delay-300 mt-6 text-lg leading-relaxed opacity-70">
            Almost there. Choose a strong new password and you'll be back to shopping in no time.
          </p>
          <p className="animate-fade-up delay-400 mt-10 text-xs uppercase tracking-[0.25em] opacity-40">
            Secure Your Account
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
            <p className="mt-2 text-sm text-muted-foreground">Secure Your Account</p>
          </div>

          {/* Form header */}
          <div className="animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Security</span>
            <h2 className="font-display text-2xl tracking-tight text-foreground mt-2">
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
                placeholder="Enter new password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                required
                autoFocus
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
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
                placeholder="Confirm new password"
                value={data.passwordConfirmation}
                onChange={(e) => setData('passwordConfirmation', e.target.value)}
                required
                className="h-11 border-border/60 bg-background transition-colors focus-visible:border-accent"
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
          </form>
        </div>
      </div>
    </div>
  )
}
