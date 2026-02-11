import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/use-translation'

interface NewsletterFormProps {
  className?: string
}

export function NewsletterForm({ className }: NewsletterFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    router.post(
      '/newsletter/subscribe',
      { email },
      {
        preserveState: true,
        onSuccess: () => {
          setStatus('success')
          setMessage(t('storefront.newsletter.successMessage'))
          setEmail('')
        },
        onError: () => {
          setStatus('error')
          setMessage(t('storefront.newsletter.errorMessage'))
        },
      }
    )
  }

  return (
    <div className={className}>
      {status === 'success' ? (
        <p className="text-sm text-emerald-600">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('storefront.newsletter.placeholder')}
            required
            className="flex-1 text-sm"
          />
          <Button type="submit" size="sm" disabled={status === 'loading'}>
            {status === 'loading' ? t('storefront.newsletter.subscribing') : t('storefront.newsletter.subscribe')}
          </Button>
        </form>
      )}
      {status === 'error' && <p className="text-destructive text-xs mt-1">{message}</p>}
    </div>
  )
}
