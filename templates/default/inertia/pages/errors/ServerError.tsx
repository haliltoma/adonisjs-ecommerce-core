import { Head, Link } from '@inertiajs/react'
import { Home, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  error?: string
}

export default function ServerError({ error }: Props) {
  return (
    <>
      <Head title="Server Error" />

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="animate-fade-up mb-8">
            <span className="font-display text-[160px] leading-none select-none text-destructive/[0.08]">
              500
            </span>
          </div>

          <div className="animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-destructive/70">
              Server Error
            </span>
            <h1 className="font-display text-3xl tracking-tight mt-2">
              Something Went Wrong
            </h1>
          </div>

          <p className="animate-fade-up delay-200 text-muted-foreground mt-4 text-[15px] leading-relaxed max-w-sm mx-auto">
            We're sorry, but something unexpected happened. Our team has been
            notified and we're working to fix the issue.
          </p>

          {error && process.env.NODE_ENV !== 'production' && (
            <div className="animate-fade-up delay-300 mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-left">
              <p className="text-sm font-mono text-destructive break-all">{error}</p>
            </div>
          )}

          <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="px-8 tracking-wide"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="animate-fade-up delay-500 mt-14 pt-8 border-t border-border/50">
            <div className="inline-flex items-center px-4 py-2 bg-secondary rounded-full">
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse mr-2" />
              <span className="text-sm text-muted-foreground">
                Error reported to our team
              </span>
            </div>
          </div>

          <p className="animate-fade-up delay-600 mt-8 text-sm text-muted-foreground">
            If the problem persists, please{' '}
            <Link
              href="/contact"
              className="text-accent hover:underline underline-offset-4"
            >
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  )
}
