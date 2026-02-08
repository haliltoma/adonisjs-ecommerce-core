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

  const steps = ['Information', 'Shipping', 'Payment']

  return (
    <StorefrontLayout>
      <Head title="Checkout" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

        {/* Steps */}
        <div className="mt-8 flex items-center">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => step > index + 1 && setStep(index + 1)}
                disabled={step <= index + 1}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step > index + 1
                    ? 'bg-green-500 text-white'
                    : step === index + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
              </button>
              <span
                className={`ml-2 text-sm font-medium ${step >= index + 1 ? '' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <div className="bg-border mx-4 h-px w-8 sm:w-12" />
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 lg:grid lg:grid-cols-12 lg:gap-12"
        >
          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Step 1: Contact Information */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    We'll use this to send you order updates
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      required
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={data.firstName}
                        onChange={(e) => setData('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={data.lastName}
                        onChange={(e) => setData('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Where should we send your order?
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={data.shippingAddress.firstName}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={data.shippingAddress.lastName}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Company (optional)</Label>
                    <Input
                      value={data.shippingAddress.company}
                      onChange={(e) =>
                        setData('shippingAddress', {
                          ...data.shippingAddress,
                          company: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={data.shippingAddress.address1}
                      onChange={(e) =>
                        setData('shippingAddress', {
                          ...data.shippingAddress,
                          address1: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Apartment, suite, etc. (optional)</Label>
                    <Input
                      value={data.shippingAddress.address2}
                      onChange={(e) =>
                        setData('shippingAddress', {
                          ...data.shippingAddress,
                          address2: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={data.shippingAddress.city}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={data.shippingAddress.state}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            state: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input
                        value={data.shippingAddress.postalCode}
                        onChange={(e) =>
                          setData('shippingAddress', {
                            ...data.shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsBilling"
                      checked={data.sameAsBilling}
                      onCheckedChange={(checked) =>
                        setData('sameAsBilling', checked as boolean)
                      }
                    />
                    <Label htmlFor="sameAsBilling" className="font-normal">
                      Billing address same as shipping
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={() => setStep(2)}>
                    Continue to Shipping
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold">Shipping Method</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Choose how you'd like your order delivered
                  </p>
                </div>

                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        data.shippingMethodId === method.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={data.shippingMethodId === method.id}
                          onChange={(e) =>
                            setData('shippingMethodId', e.target.value)
                          }
                          className="text-primary h-4 w-4"
                        />
                        <div className="flex items-center gap-3">
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                            <Truck className="text-muted-foreground h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            {method.description && (
                              <div className="text-muted-foreground text-sm">
                                {method.description}
                              </div>
                            )}
                            {method.estimatedDays && (
                              <div className="text-muted-foreground text-sm">
                                {method.estimatedDays}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">
                        {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold">Payment</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Select your payment method
                  </p>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        data.paymentMethodId === method.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={data.paymentMethodId === method.id}
                          onChange={(e) =>
                            setData('paymentMethodId', e.target.value)
                          }
                          className="text-primary h-4 w-4"
                        />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          {method.description && (
                            <div className="text-muted-foreground text-sm">
                              {method.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={3}
                    placeholder="Special instructions for your order..."
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="divide-y">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0">
                      <div className="bg-muted relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="text-muted-foreground h-6 w-6" />
                          </div>
                        )}
                        <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.title}</div>
                        {item.variantTitle && (
                          <div className="text-muted-foreground text-xs">
                            {item.variantTitle}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(cart.subtotal)}
                    </span>
                  </div>

                  {cart.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-2">
                        Discount
                        {cart.discountCode && (
                          <Badge variant="secondary" className="text-xs">
                            {cart.discountCode}
                          </Badge>
                        )}
                      </span>
                      <span className="font-medium">
                        -{formatCurrency(cart.discountTotal)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {selectedShipping
                        ? selectedShipping.price === 0
                          ? 'Free'
                          : formatCurrency(selectedShipping.price)
                        : 'Calculated next step'}
                    </span>
                  </div>

                  {cart.taxTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        {formatCurrency(cart.taxTotal)}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button variant="ghost" asChild className="w-full">
                  <Link href="/cart">Edit Cart</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </StorefrontLayout>
  )
}
