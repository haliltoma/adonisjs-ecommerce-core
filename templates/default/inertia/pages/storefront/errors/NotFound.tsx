import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Home } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Button } from '@/components/ui/button'

interface Props {
  resource?: string
}

export default function NotFound({ resource }: Props) {
  return (
    <StorefrontLayout>
      <Head title={`${resource || 'Page'} Not Found`} />

      <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
        <div className="animate-fade-up">
          <span className="font-display text-[120px] leading-none select-none text-foreground/[0.06]">
            404
          </span>
        </div>
        <div className="animate-fade-up delay-100">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Not Found
          </span>
          <h1 className="font-display text-3xl tracking-tight mt-2">
            {resource || 'Page'} Not Found
          </h1>
        </div>
        <p className="animate-fade-up delay-200 text-muted-foreground mt-3 max-w-md text-[15px] leading-relaxed">
          Sorry, we couldn't find the {resource?.toLowerCase() || 'page'} you're looking for. It
          may have been removed or the link might be incorrect.
        </p>
        <div className="animate-fade-up delay-300 mt-10 flex gap-3">
          <Button size="lg" className="px-8 tracking-wide" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </StorefrontLayout>
  )
}
