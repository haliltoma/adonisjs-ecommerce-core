import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/use-translation'

interface GuestConversionProps {
  email: string
  orderNumber: string
  className?: string
}

export function GuestConversion({ email, orderNumber, className }: GuestConversionProps) {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(false)
  const form = useForm({ email, password: '', fullName: '', orderNumber })

  if (dismissed) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/account/convert-guest', {
      onSuccess: () => setDismissed(true),
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{t('storefront.guestConversion.title')}</CardTitle>
            <CardDescription>
              {t('storefront.guestConversion.description')}
            </CardDescription>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground text-sm hover:text-foreground"
          >
            {t('storefront.guestConversion.dismiss')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">{t('storefront.guestConversion.fullName')}</Label>
            <Input
              value={form.data.fullName}
              onChange={(e) => form.setData('fullName', e.target.value)}
              placeholder={t('storefront.guestConversion.fullNamePlaceholder')}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t('storefront.guestConversion.email')}</Label>
            <Input value={email} disabled className="bg-muted" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t('storefront.guestConversion.password')}</Label>
            <Input
              type="password"
              value={form.data.password}
              onChange={(e) => form.setData('password', e.target.value)}
              placeholder={t('storefront.guestConversion.passwordPlaceholder')}
            />
            {form.errors.password && (
              <p className="text-destructive text-xs">{form.errors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={form.processing}>
            {form.processing ? t('storefront.guestConversion.submitting') : t('storefront.guestConversion.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
