import { Head, useForm } from '@inertiajs/react'
import { CreditCard, Lock, Shield } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'

interface PaymentMethod {
  id: string
  name: string
  icon: string
}

interface Order {
  id: string
  orderNumber: string
  total: number
  currency: string
}

interface Props {
  order: Order
  paymentMethods: PaymentMethod[]
}

export default function Payment({ order, paymentMethods }: Props) {
  const { data, setData, post, processing } = useForm({
    paymentMethod: paymentMethods[0]?.id || 'card',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(`/checkout/payment/${order.id}`)
  }

  return (
    <StorefrontLayout>
      <Head title="Payment" />

      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        {/* Page Header */}
        <div className="text-center animate-fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Shield className="text-accent h-7 w-7" />
          </div>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mt-6 block">Secure Checkout</span>
          <h1 className="font-display text-3xl tracking-tight mt-2">Payment</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Order <span className="font-medium">#{order.orderNumber}</span>
          </p>
        </div>

        <Card className="mt-10 animate-fade-up delay-200">
          <CardHeader>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Choose Method</span>
            <h2 className="font-display text-xl tracking-tight mt-1">Payment Method</h2>
            <p className="text-muted-foreground text-sm mt-1">Select how you'd like to pay.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                {paymentMethods.map((method, i) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-5 transition-all duration-300 animate-fade-up delay-${Math.min((i + 3) * 100, 600)} ${
                      data.paymentMethod === method.id
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-border/60 hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={data.paymentMethod === method.id}
                      onChange={(e) => setData('paymentMethod', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{method.name}</span>
                    {data.paymentMethod === method.id && (
                      <div className="bg-accent ml-auto h-3 w-3 rounded-full" />
                    )}
                  </label>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-display text-lg">Total</span>
                <span className="font-display text-2xl">{formatCurrency(order.total)}</span>
              </div>

              <Button
                type="submit"
                className="w-full h-12 tracking-wide text-sm"
                size="lg"
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(order.total)}`}
              </Button>

              <p className="text-muted-foreground text-center text-xs flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3" />
                Your payment information is encrypted and secure.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  )
}
