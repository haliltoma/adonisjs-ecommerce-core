import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  error?: string
}

export default function NotFound({ error }: Props) {
  return (
    <>
      <Head title="Page Not Found" />

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="animate-fade-up mb-8">
            <span className="font-display text-[160px] leading-none select-none text-foreground/[0.06]">
              404
            </span>
          </div>

          <div className="animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Lost in Space
            </span>
            <h1 className="font-display text-3xl tracking-tight mt-2">
              Page Not Found
            </h1>
          </div>

          <p className="animate-fade-up delay-200 text-muted-foreground mt-4 text-[15px] leading-relaxed max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. Perhaps you've
            mistyped the URL or the page has been moved.
          </p>

          {error && (
            <p className="animate-fade-up delay-300 text-sm text-muted-foreground mt-4 bg-secondary px-4 py-2 rounded-lg inline-block">
              {error}
            </p>
          )}

          <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="px-8 tracking-wide" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="animate-fade-up delay-500 mt-14 pt-8 border-t border-border/50">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">
              Helpful Links
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/products"
                className="text-accent hover:underline underline-offset-4"
              >
                Browse Products
              </Link>
              <Link
                href="/categories"
                className="text-accent hover:underline underline-offset-4"
              >
                Categories
              </Link>
              <Link
                href="/contact"
                className="text-accent hover:underline underline-offset-4"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
