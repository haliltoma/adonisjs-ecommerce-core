import { Head, useForm } from '@inertiajs/react'
import { Check, Clock, MapPin, Package, Search, Truck } from 'lucide-react'
import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn, formatDateTime } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface TrackingEvent {
  id: string
  status: string
  description: string
  location?: string
  timestamp: string
}

interface TrackingInfo {
  orderNumber: string
  status: string
  carrier: string
  trackingNumber: string
  estimatedDelivery: string | null
  events: TrackingEvent[]
}

interface Props {
  tracking?: TrackingInfo
}

const statusIcons: Record<string, typeof Package> = {
  'order_placed': Package,
  'processing': Clock,
  'shipped': Truck,
  'in_transit': Truck,
  'out_for_delivery': MapPin,
  'delivered': Check,
}

export default function OrderTrackingPage({ tracking }: Props) {
  const { t } = useTranslation()
  const { data, setData, get, processing } = useForm({ orderNumber: '', email: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    get('/order-tracking')
  }

  return (
    <StorefrontLayout>
      <Head title={t('storefront.orderTracking.title')} />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{t('storefront.orderTracking.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('storefront.orderTracking.description')}
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('storefront.orderTracking.orderNumber')}</label>
                  <Input
                    value={data.orderNumber}
                    onChange={(e) => setData('orderNumber', e.target.value)}
                    placeholder={t('storefront.orderTracking.orderNumberPlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('storefront.orderTracking.emailAddress')}</label>
                  <Input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder={t('storefront.orderTracking.emailPlaceholder')}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={processing}>
                <Search className="mr-2 h-4 w-4" />
                {processing ? t('storefront.orderTracking.searching') : t('storefront.orderTracking.trackOrder')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {tracking && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{t('storefront.orderTracking.order')} {tracking.orderNumber}</CardTitle>
                  <CardDescription>
                    {tracking.carrier} - {tracking.trackingNumber}
                  </CardDescription>
                </div>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  tracking.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                )}>
                  {tracking.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
              {tracking.estimatedDelivery && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('storefront.orderTracking.estimatedDelivery')} <span className="font-medium text-foreground">{tracking.estimatedDelivery}</span>
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {tracking.events.map((event, index) => {
                  const isFirst = index === 0
                  const isLast = index === tracking.events.length - 1
                  const Icon = statusIcons[event.status] || Package

                  return (
                    <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {!isLast && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                      )}
                      <div className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                        isFirst
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                      )}>
                        <Icon className="size-4" />
                      </div>
                      <div className="pt-1">
                        <p className={cn('text-sm font-medium', !isFirst && 'text-muted-foreground')}>
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <time className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</time>
                          {event.location && (
                            <>
                              <span className="text-muted-foreground text-xs">-</span>
                              <span className="text-xs text-muted-foreground">{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StorefrontLayout>
  )
}
