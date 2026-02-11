import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface LoadMoreButtonProps {
  currentPage: number
  lastPage: number
  url: string
  params?: Record<string, string>
  className?: string
}

export function LoadMoreButton({
  currentPage,
  lastPage,
  url,
  params = {},
  className,
}: LoadMoreButtonProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  if (currentPage >= lastPage) return null

  const handleLoadMore = () => {
    setLoading(true)
    router.get(
      url,
      { ...params, page: currentPage + 1 },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['products'],
        onFinish: () => setLoading(false),
      }
    )
  }

  return (
    <div className={cn('flex justify-center py-8', className)}>
      <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t('storefront.loadMore.loading') : t('storefront.loadMore.loadMore')}
      </Button>
    </div>
  )
}
