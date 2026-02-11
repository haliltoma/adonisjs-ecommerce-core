import { Head, Link, useForm } from '@inertiajs/react'
import { useState } from 'react'
import { Check, ChevronLeft, Package, Truck } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface CartItem {
  id: string
  title: string
  variantTitle: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  thumbnail: string | null
}

interface Cart {
  id: string
  itemCount: number
  subtotal: number
  discountTotal: number
  discountCode: string | null
  taxTotal: number
  shippingTotal: number
  total: number
  currency: string
  items: CartItem[]
}

interface ShippingMethod {
  id: string
  name: string
  description: string | null
  price: number
  estimatedDays: string | null
}

interface PaymentMethod {
  id: string
  name: string
  description: string | null
  icon: string | null
}

interface Props {
  cart: Cart
  shippingMethods: ShippingMethod[]
  paymentMethods: PaymentMethod[]
  customer: {
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  } | null
}

export default function Checkout({
  cart,
  shippingMethods,
  paymentMethods,
  customer,
}: Props) {
  const [step, setStep] = useState(1)
  const { t, currency } = useTranslation()
  const cur = cart?.currency || currency

  const { data, setData, post, processing, errors } = useForm({
    email: customer?.email || '',
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    phone: customer?.phone || '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
    },
    sameAsBilling: true,
    shippingMethodId: shippingMethods[0]?.id || '',
    paymentMethodId: paymentMethods[0]?.id || '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/checkout')
  }

  const selectedShipping = shippingMethods.find(
    (m) => m.id === data.shippingMethodId
  )
  const total =
    cart.subtotal -
    cart.discountTotal +
    cart.taxTotal +
    (selectedShipping?.price || 0)

  const steps = [t('storefront.checkoutPage.stepInformation'), t('storefront.checkoutPage.stepShipping'), t('storefront.checkoutPage.stepPayment')]

  return (
    <StorefrontLayout>
      <Head title="Checkout" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="animate-fade-up">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.checkoutPage.secureCheckout')}</span>
          <h1 className="font-display text-3xl tracking-tight mt-2">{t('storefront.checkoutPage.checkout')}</h1>
        </div>

        {/* Steps */}
        <div className="mt-10 flex items-center animate-fade-up delay-100">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => step > index + 1 && setStep(index + 1)}
                disabled={step <= index + 1}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                  step > index + 1
                    ? 'bg-accent text-accent-foreground'
                    : step === index + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
              </button>
              <span
                className={`ml-2.5 text-sm font-medium tracking-wide ${step >= index + 1 ? '' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-px w-8 sm:w-16 transition-colors duration-300 ${step > index + 1 ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 lg:grid lg:grid-cols-12 lg:gap-16"
        >
          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Step 1: Contact Information */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-up delay-200">
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.checkoutPage.step1')}</span>
                  <h2 className="font-display text-2xl tracking-tight mt-1">{t('storefront.checkoutPage.contactInfo')}</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t('storefront.checkoutPage.contactInfoDesc')}
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.firstName')}</Label>
                      <Input
                        id="firstName"
                        value={data.firstName}
                        onChange={(e) => setData('firstName', e.target.value)}
                        required
                        className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.lastName')}</Label>
                      <Input
                        id="lastName"
                        value={data.lastName}
                        onChange={(e) => setData('lastName', e.target.value)}
                        required
                        className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                </div>

                <Separator className="my-2" />

                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.checkoutPage.deliveryLabel')}</span>
                  <h2 className="font-display text-2xl tracking-tight mt-1">{t('storefront.checkoutPage.shippingAddress')}</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t('storefront.checkoutPage.shippingAddressDesc')}
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.firstName')}</Label>
                      <Input
                        value={data.shippingAddress.firstName}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            firstName: e.target.value,
                          })
                        }
                        required
                        className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.lastName')}</Label>
                      <Input
                        value={data.shippingAddress.lastName}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            lastName: e.target.value,
                          })
                        }
                        required
                        className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.company')}</Label>
                    <Input
                      value={data.shippingAddress.company}
                      onChange={(e) =>
                        setData('shippingAddress', {
                          ...data.shippingAddress,
                          company: e.target.value,
                        })
                      }
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.address')}</Label>
                    <Input
                      value={data.shippingAddress.address1}
                      onChange={(e) =>
                        setData('shippingAddress', {
                          ...data.shippingAddress,
                          address1: e.target.value,
                        })
                      }
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.apartment')}</Label>
                    <Input
                      value={data.shippingAddress.address2}
                      onChange={(e) =>
                        setData('shippingAddress', {
                          ...data.shippingAddress,
                          address2: e.target.value,
                        })
                      }
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.city')}</Label>
                      <Input
                        value={data.shippingAddress.city}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            city: e.target.value,
                          })
                        }
                        required
                        className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.state')}</Label>
                      <Input
                        value={data.shippingAddress.state}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            state: e.target.value,
                          })
                        }
                        required
                        className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.zipCode')}</Label>
                      <Input
                        value={data.shippingAddress.postalCode}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                        required
                        className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="sameAsBilling"
                      checked={data.sameAsBilling}
                      onCheckedChange={(checked) =>
                        setData('sameAsBilling', checked === true)
                      }
                    />
                    <Label htmlFor="sameAsBilling" className="font-normal text-sm">
                      {t('storefront.checkoutPage.sameAsBilling')}
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="h-12 px-8 tracking-wide"
                  >
                    {t('storefront.checkoutPage.continueToShipping')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-up delay-200">
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.checkoutPage.step2')}</span>
                  <h2 className="font-display text-2xl tracking-tight mt-1">{t('storefront.checkoutPage.shippingMethod')}</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t('storefront.checkoutPage.shippingMethodDesc')}
                  </p>
                </div>

                <div className="space-y-3">
                  {shippingMethods.map((method, i) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-5 transition-all duration-300 animate-fade-up delay-${Math.min((i + 2) * 100, 500)} ${
                        data.shippingMethodId === method.id
                          ? 'border-accent bg-accent/5 shadow-sm'
                          : 'border-border/60 hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={data.shippingMethodId === method.id}
                          onChange={(e) =>
                            setData('shippingMethodId', e.target.value)
                          }
                          className="text-accent h-4 w-4 accent-accent"
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                            <Truck className="text-muted-foreground h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            {method.description && (
                              <div className="text-muted-foreground text-sm mt-0.5">
                                {method.description}
                              </div>
                            )}
                            {method.estimatedDays && (
                              <div className="text-muted-foreground text-xs mt-0.5 tracking-wide">
                                {method.estimatedDays}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-display text-lg">
                        {method.price === 0 ? t('storefront.checkoutPage.free') : formatCurrency(method.price, cur)}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="tracking-wide"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('storefront.checkoutPage.back')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="h-12 px-8 tracking-wide"
                  >
                    {t('storefront.checkoutPage.continueToPayment')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-up delay-200">
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.checkoutPage.step3')}</span>
                  <h2 className="font-display text-2xl tracking-tight mt-1">{t('storefront.checkoutPage.payment')}</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t('storefront.checkoutPage.paymentDesc')}
                  </p>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method, i) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-5 transition-all duration-300 animate-fade-up delay-${Math.min((i + 2) * 100, 500)} ${
                        data.paymentMethodId === method.id
                          ? 'border-accent bg-accent/5 shadow-sm'
                          : 'border-border/60 hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={data.paymentMethodId === method.id}
                          onChange={(e) =>
                            setData('paymentMethodId', e.target.value)
                          }
                          className="text-accent h-4 w-4 accent-accent"
                        />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          {method.description && (
                            <div className="text-muted-foreground text-sm mt-0.5">
                              {method.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">{t('storefront.checkoutPage.orderNotes')}</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={3}
                    placeholder={t('storefront.checkoutPage.orderNotesPlaceholder')}
                    className="border-border/60 transition-colors focus-visible:border-accent"
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="tracking-wide"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('storefront.checkoutPage.back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="h-12 px-10 tracking-wide"
                  >
                    {processing ? t('storefront.checkoutPage.processing') : t('storefront.checkoutPage.placeOrder')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <Card className="sticky top-[88px] animate-fade-up delay-300">
              <CardHeader>
                <CardTitle className="font-display text-lg">{t('storefront.checkoutPage.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="divide-y divide-border/60">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0">
                      <div className="relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                            <Package className="text-muted-foreground/30 h-6 w-6" />
                          </div>
                        )}
                        <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full bg-accent text-accent-foreground p-0 text-[10px]">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.title}</div>
                        {item.variantTitle && (
                          <div className="text-muted-foreground text-xs mt-0.5">
                            {item.variantTitle}
                          </div>
                        )}
                      </div>
                      <div className="font-display text-sm">
                        {formatCurrency(item.totalPrice, cur)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('storefront.checkoutPage.subtotal')}</span>
                    <span className="font-medium">
                      {formatCurrency(cart.subtotal, cur)}
                    </span>
                  </div>

                  {cart.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-emerald-700">
                      <span className="flex items-center gap-2">
                        {t('storefront.checkoutPage.discount')}
                        {cart.discountCode && (
                          <Badge variant="secondary" className="text-[10px]">
                            {cart.discountCode}
                          </Badge>
                        )}
                      </span>
                      <span className="font-medium">
                        -{formatCurrency(cart.discountTotal, cur)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('storefront.checkoutPage.shipping')}</span>
                    <span className="font-medium">
                      {selectedShipping
                        ? selectedShipping.price === 0
                          ? t('storefront.checkoutPage.free')
                          : formatCurrency(selectedShipping.price, cur)
                        : t('storefront.checkoutPage.calculatedNextStep')}
                    </span>
                  </div>

                  {cart.taxTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('storefront.checkoutPage.tax')}</span>
                      <span className="font-medium">
                        {formatCurrency(cart.taxTotal, cur)}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-lg">{t('storefront.checkoutPage.total')}</span>
                    <span className="font-display text-xl">{formatCurrency(total, cur)}</span>
                  </div>
                </div>

                <Button variant="ghost" asChild className="w-full text-sm">
                  <Link href="/cart">{t('storefront.checkoutPage.editCart')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </StorefrontLayout>
  )
}
