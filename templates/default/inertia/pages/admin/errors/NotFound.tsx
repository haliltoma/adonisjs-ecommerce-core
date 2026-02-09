import { Head, Link } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  resource?: string
}

export default function NotFound({ resource }: Props) {
  return (
    <>
      <Head title={`${resource || 'Resource'} Not Found`} />

      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="animate-fade-up">
          <span className="font-display text-[100px] leading-none select-none text-foreground/[0.06]">
            404
          </span>
        </div>
        <div className="animate-fade-up delay-100">
          <h1 className="font-display text-2xl tracking-tight">
            {resource || 'Resource'} Not Found
          </h1>
        </div>
        <p className="animate-fade-up delay-200 text-muted-foreground mt-2 max-w-md text-sm">
          The {resource?.toLowerCase() || 'resource'} you're looking for doesn't exist or has been
          removed.
        </p>
        <Button asChild className="animate-fade-up delay-300 mt-8 px-6 tracking-wide">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </>
  )
}
