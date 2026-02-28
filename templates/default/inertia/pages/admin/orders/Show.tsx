import { Head, router, useForm } from '@inertiajs/react'
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
  ShieldAlert,
  Repeat,
  Truck,
  User,
  XCircle,
  Clock,
  AlertCircle,
  Pencil,
} from 'lucide-react'
import { FormEvent, useState } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface Props {
  order: {
    id: string
    orderNumber: string
    email: string
    phone: string | null
    status: string
    paymentStatus: string
    fulfillmentStatus: string
    currency: string
    subtotal: number
    discountTotal: number
    discountCode: string | null
    shippingTotal: number
    taxTotal: number
    total: number
    itemCount: number
    billingAddress: any
    shippingAddress: any
    shippingMethod: string | null
    notes: string | null
    metadata: any
    paidAt: string | null
    cancelledAt: string | null
    createdAt: string
    updatedAt: string
    customer: {
      id: string
      name: string
      email: string
      phone: string | null
    } | null
    items: {
      id: string
      productId: string
      variantId: string | null
      sku: string | null
      title: string
      variantTitle: string | null
      quantity: number
      unitPrice: number
      discountAmount: number
      taxAmount: number
      totalPrice: number
      fulfilledQuantity: number
      returnedQuantity: number
    }[]
    transactions: {
      id: string
      type: string
      amount: number
      currencyCode: string
      paymentMethod: string
      status: string
      createdAt: string
    }[]
    fulfillments: {
      id: string
      status: string
      trackingNumber: string | null
      trackingUrl: string | null
      carrier: string | null
      shippedAt: string | null
      deliveredAt: string | null
      items: { orderItemId: string; quantity: number }[]
    }[]
    refunds: {
      id: string
      amount: number
      reason: string | null
      status: string
      createdAt: string
      items: { orderItemId: string; quantity: number; amount: number }[]
    }[]
    statusHistory: {
      previousStatus: string
      status: string
      title: string
      description: string | null
      createdAt: string
    }[]
  }
  unfulfilledItems: {
    id: string
    title: string
    variantTitle: string | null
    quantity: number
    fulfilledQuantity: number
    remainingQuantity: number
  }[]
  returns: {
    id: string
    status: string
    refundAmount: number | null
    note: string | null
    receivedAt: string | null
    createdAt: string
    items: {
      id: string
      quantity: number
      receivedQuantity: number
      orderItem: { id: string; title: string; variantTitle: string | null } | null
      reason: { label: string } | null
      note: string | null
    }[]
  }[]
  claims: {
    id: string
    type: string
    status: string
    refundAmount: number | null
    note: string | null
    createdAt: string
    items: {
      id: string
      quantity: number
      reason: string
      note: string | null
      orderItem: { id: string; title: string } | null
    }[]
  }[]
  exchanges: {
    id: string
    status: string
    differenceAmount: number
    paymentStatus: string
    note: string | null
    newItems: any[]
    createdAt: string
  }[]
  edits: {
    id: string
    status: string
    differenceAmount: number
    internalNote: string | null
    changes: any[]
    creator: { name: string } | null
    requestedAt: string | null
    confirmedAt: string | null
    createdAt: string
  }[]
  returnReasons: { id: string; label: string }[]
}

export default function OrderShow({ order, unfulfilledItems, returns = [], claims = [], exchanges = [], edits = [], returnReasons = [] }: Props) {
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isClaimOpen, setIsClaimOpen] = useState(false)
  const [returnItems, setReturnItems] = useState<{ orderItemId: string; quantity: number; returnReasonId?: string; note?: string }[]>([])
  const [claimItems, setClaimItems] = useState<{ orderItemId: string; quantity: number; reason: string }[]>([])
  const [claimType, setClaimType] = useState<'refund' | 'replace'>('refund')

  const noteForm = useForm({
    note: '',
  })

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
      case 'fulfilled':
        return 'default'
      case 'processing':
      case 'shipped':
      case 'pending':
      case 'partial':
        return 'secondary'
      case 'cancelled':
      case 'failed':
      case 'refunded':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleUpdateStatus = () => {
    if (selectedStatus === order.status) return

    setIsUpdatingStatus(true)
    router.patch(
      `/admin/orders/${order.id}/status`,
      { status: selectedStatus },
      {
        onFinish: () => setIsUpdatingStatus(false),
      }
    )
  }

  const handleAddNote = (e: FormEvent) => {
    e.preventDefault()
    noteForm.post(`/admin/orders/${order.id}/note`, {
      onSuccess: () => noteForm.reset(),
    })
  }

  const handleCancelOrder = () => {
    if (
      confirm('Are you sure you want to cancel this order? This action cannot be undone.')
    ) {
      router.post(`/admin/orders/${order.id}/cancel`)
    }
  }

  const handleCreateFulfillment = () => {
    const unfulfilledItems = order.items
      .filter((item: any) => (item.fulfilledQuantity || 0) < item.quantity)
      .map((item: any) => ({
        orderItemId: item.id,
        quantity: item.quantity - (item.fulfilledQuantity || 0),
      }))

    if (unfulfilledItems.length === 0) return

    router.post(`/admin/orders/${order.id}/fulfillments`, { items: unfulfilledItems })
  }

  const handleToggleReturnItem = (itemId: string, quantity: number) => {
    setReturnItems((prev) => {
      const existing = prev.find((i) => i.orderItemId === itemId)
      if (existing) return prev.filter((i) => i.orderItemId !== itemId)
      return [...prev, { orderItemId: itemId, quantity }]
    })
  }

  const handleSubmitReturn = () => {
    if (returnItems.length === 0) return
    router.post(`/admin/orders/${order.id}/returns`, { items: returnItems }, {
      onSuccess: () => {
        setIsReturnOpen(false)
        setReturnItems([])
      },
    })
  }

  const handleToggleClaimItem = (itemId: string, quantity: number) => {
    setClaimItems((prev) => {
      const existing = prev.find((i) => i.orderItemId === itemId)
      if (existing) return prev.filter((i) => i.orderItemId !== itemId)
      return [...prev, { orderItemId: itemId, quantity, reason: 'other' }]
    })
  }

  const handleSubmitClaim = () => {
    if (claimItems.length === 0) return
    router.post(`/admin/orders/${order.id}/claims`, { type: claimType, items: claimItems }, {
      onSuccess: () => {
        setIsClaimOpen(false)
        setClaimItems([])
      },
    })
  }

  const formatAddress = (address: any) => {
    if (!address) return 'No address provided'
    return [
      address.line1,
      address.line2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ]
      .filter(Boolean)
      .join(', ')
  }

  return (
    <AdminLayout
      title={`Order ${order.orderNumber}`}
      description={`Created ${formatDateTime(order.createdAt)}`}
      actions={
        <Button variant="outline" onClick={() => router.get('/admin/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      }
    >
      <Head title={`Order ${order.orderNumber} - Admin`} />

      <div className="space-y-6 animate-fade-in">
        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 animate-fade-up delay-100">
          <Badge variant={getStatusVariant(order.status)} className="text-sm">
            {order.status}
          </Badge>
          <Badge variant={getStatusVariant(order.paymentStatus)} className="text-sm">
            Payment: {order.paymentStatus}
          </Badge>
          <Badge
            variant={getStatusVariant(order.fulfillmentStatus)}
            className="text-sm"
          >
            Fulfillment: {order.fulfillmentStatus}
          </Badge>
          {order.cancelledAt && (
            <Badge variant="destructive" className="text-sm">
              Cancelled {formatDate(order.cancelledAt)}
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Order Items</CardTitle>
                <CardDescription>
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            {item.variantTitle && (
                              <div className="text-muted-foreground text-[11px] tracking-wide">
                                {item.variantTitle}
                              </div>
                            )}
                            {item.sku && (
                              <div className="text-muted-foreground text-[11px] tracking-wide font-mono">
                                SKU: {item.sku}
                              </div>
                            )}
                            {item.fulfilledQuantity > 0 && (
                              <div className="text-muted-foreground mt-1 text-[11px] tracking-wide">
                                Fulfilled: {item.fulfilledQuantity} /{' '}
                                {item.quantity}
                              </div>
                            )}
                            {item.returnedQuantity > 0 && (
                              <div className="text-muted-foreground text-[11px] tracking-wide">
                                Returned: {item.returnedQuantity}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice, order.currency)}
                        </TableCell>
                        <TableCell className="text-right font-display">
                          {formatCurrency(item.totalPrice, order.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Subtotal</span>
                    <span>{formatCurrency(order.subtotal, order.currency)}</span>
                  </div>
                  {order.discountTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
                        Discount
                        {order.discountCode && ` (${order.discountCode})`}
                      </span>
                      <span className="text-green-600">
                        -{formatCurrency(order.discountTotal, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
                      Shipping {order.shippingMethod && `(${order.shippingMethod})`}
                    </span>
                    <span>{formatCurrency(order.shippingTotal, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Tax</span>
                    <span>{formatCurrency(order.taxTotal, order.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span className="font-display">Total</span>
                    <span className="text-lg font-display">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fulfillments */}
            {order.fulfillments.length > 0 && (
              <Card className="animate-fade-up delay-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Truck className="h-4 w-4" />
                    Fulfillments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.fulfillments.map((fulfillment) => (
                    <div
                      key={fulfillment.id}
                      className="rounded-lg border border-border/60 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant={getStatusVariant(fulfillment.status)}>
                          {fulfillment.status}
                        </Badge>
                        {fulfillment.trackingNumber && (
                          <span className="text-muted-foreground text-[11px] tracking-wide font-mono">
                            Tracking: {fulfillment.trackingNumber}
                          </span>
                        )}
                      </div>
                      {fulfillment.carrier && (
                        <div className="text-muted-foreground text-sm">
                          Carrier: {fulfillment.carrier}
                        </div>
                      )}
                      {fulfillment.shippedAt && (
                        <div className="text-muted-foreground text-sm">
                          Shipped: {formatDateTime(fulfillment.shippedAt)}
                        </div>
                      )}
                      {fulfillment.deliveredAt && (
                        <div className="text-muted-foreground text-sm">
                          Delivered: {formatDateTime(fulfillment.deliveredAt)}
                        </div>
                      )}
                      <div className="text-muted-foreground mt-2 text-[11px] tracking-wide">
                        Items: {fulfillment.items.length}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Unfulfilled Items */}
            {unfulfilledItems.length > 0 && (
              <Card className="animate-fade-up delay-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 font-display text-lg">
                        <AlertCircle className="h-4 w-4 text-accent" />
                        Unfulfilled Items
                      </CardTitle>
                      <CardDescription>
                        {unfulfilledItems.length}{' '}
                        {unfulfilledItems.length === 1 ? 'item' : 'items'} pending
                        fulfillment
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={handleCreateFulfillment} className="tracking-wide">
                      <Package className="mr-2 h-4 w-4" />
                      Create Fulfillment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unfulfilledItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <div className="font-medium">{item.title}</div>
                          {item.variantTitle && (
                            <div className="text-muted-foreground text-[11px] tracking-wide">
                              {item.variantTitle}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {item.remainingQuantity} remaining
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transactions */}
            {order.transactions.length > 0 && (
              <Card className="animate-fade-up delay-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <CreditCard className="h-4 w-4" />
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="capitalize">
                            {transaction.type}
                          </TableCell>
                          <TableCell className="capitalize">
                            {transaction.paymentMethod}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-display">
                            {formatCurrency(
                              transaction.amount,
                              transaction.currencyCode
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] tracking-wide">
                            {formatDateTime(transaction.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Refunds */}
            {order.refunds.length > 0 && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Refunds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.refunds.map((refund) => (
                    <div
                      key={refund.id}
                      className="rounded-lg border border-border/60 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant={getStatusVariant(refund.status)}>
                          {refund.status}
                        </Badge>
                        <span className="font-display">
                          {formatCurrency(refund.amount, order.currency)}
                        </span>
                      </div>
                      {refund.reason && (
                        <div className="text-muted-foreground text-sm">
                          Reason: {refund.reason}
                        </div>
                      )}
                      <div className="text-muted-foreground text-[11px] tracking-wide">
                        {formatDateTime(refund.createdAt)}
                      </div>
                      <div className="text-muted-foreground mt-2 text-[11px] tracking-wide">
                        Items: {refund.items.length}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Returns */}
            {returns.length > 0 && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <RotateCcw className="h-4 w-4" />
                    Returns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {returns.map((ret) => (
                    <div key={ret.id} className="rounded-lg border border-border/60 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant={getStatusVariant(ret.status)}>{ret.status}</Badge>
                        {ret.refundAmount && (
                          <span className="font-display">
                            Refund: {formatCurrency(ret.refundAmount, order.currency)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {ret.items.map((ri) => (
                          <div key={ri.id} className="flex items-center justify-between text-sm">
                            <span>
                              {ri.orderItem?.title}
                              {ri.reason && <span className="text-muted-foreground ml-1">({ri.reason.label})</span>}
                            </span>
                            <span className="text-muted-foreground">
                              Qty: {ri.quantity} {ri.receivedQuantity > 0 && `(received: ${ri.receivedQuantity})`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-muted-foreground mt-2 text-[11px] tracking-wide">
                        {formatDateTime(ret.createdAt)}
                      </div>
                      {ret.status === 'requested' && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.post(`/admin/orders/${order.id}/returns/${ret.id}/receive`, {
                              items: ret.items.map((ri) => ({ returnItemId: ri.id, receivedQuantity: ri.quantity })),
                            })}
                          >
                            Mark Received
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => router.post(`/admin/orders/${order.id}/returns/${ret.id}/cancel`)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {ret.status === 'received' && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const amount = prompt('Enter refund amount:')
                            if (amount) {
                              router.post(`/admin/orders/${order.id}/returns/${ret.id}/complete`, {
                                refundAmount: parseFloat(amount),
                              })
                            }
                          }}
                        >
                          Complete & Refund
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Claims */}
            {claims.length > 0 && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <ShieldAlert className="h-4 w-4" />
                    Claims
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="rounded-lg border border-border/60 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant={getStatusVariant(claim.status)}>{claim.status}</Badge>
                        <Badge variant="outline">{claim.type}</Badge>
                        {claim.refundAmount && (
                          <span className="text-sm font-display ml-auto">
                            {formatCurrency(claim.refundAmount, order.currency)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {claim.items.map((ci) => (
                          <div key={ci.id} className="text-sm">
                            {ci.orderItem?.title} × {ci.quantity}
                            <span className="text-muted-foreground ml-1">({ci.reason})</span>
                          </div>
                        ))}
                      </div>
                      {claim.note && (
                        <div className="text-muted-foreground text-sm mt-2">{claim.note}</div>
                      )}
                      <div className="text-muted-foreground mt-2 text-[11px] tracking-wide">
                        {formatDateTime(claim.createdAt)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Exchanges */}
            {exchanges.length > 0 && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Repeat className="h-4 w-4" />
                    Exchanges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exchanges.map((ex) => (
                    <div key={ex.id} className="rounded-lg border border-border/60 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant={getStatusVariant(ex.status)}>{ex.status}</Badge>
                        <Badge variant="outline">Payment: {ex.paymentStatus}</Badge>
                        {ex.differenceAmount !== 0 && (
                          <span className="text-sm font-display ml-auto">
                            Difference: {formatCurrency(ex.differenceAmount, order.currency)}
                          </span>
                        )}
                      </div>
                      {ex.note && (
                        <div className="text-muted-foreground text-sm">{ex.note}</div>
                      )}
                      <div className="text-muted-foreground mt-2 text-[11px] tracking-wide">
                        {formatDateTime(ex.createdAt)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Order Edits */}
            {edits.length > 0 && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Pencil className="h-4 w-4" />
                    Order Edits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {edits.map((edit) => (
                    <div key={edit.id} className="rounded-lg border border-border/60 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant={getStatusVariant(edit.status)}>{edit.status}</Badge>
                        {edit.differenceAmount !== 0 && (
                          <span className="text-sm font-display ml-auto">
                            {formatCurrency(edit.differenceAmount, order.currency)}
                          </span>
                        )}
                      </div>
                      {edit.internalNote && (
                        <div className="text-muted-foreground text-sm">{edit.internalNote}</div>
                      )}
                      {edit.creator && (
                        <div className="text-muted-foreground text-[11px] tracking-wide">
                          By {edit.creator.name}
                        </div>
                      )}
                      <div className="text-muted-foreground text-[11px] tracking-wide">
                        {formatDateTime(edit.createdAt)}
                      </div>
                      {edit.status === 'created' && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => router.post(`/admin/orders/${order.id}/edits/${edit.id}/request`)}
                          >
                            Request Confirmation
                          </Button>
                        </div>
                      )}
                      {edit.status === 'requested' && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => router.post(`/admin/orders/${order.id}/edits/${edit.id}/confirm`)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => router.post(`/admin/orders/${order.id}/edits/${edit.id}/decline`)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {order.statusHistory.length > 0 && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Clock className="h-4 w-4" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative">
                          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                            {history.status === 'completed' ||
                            history.status === 'delivered' ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : history.status === 'cancelled' ? (
                              <XCircle className="h-4 w-4 text-white" />
                            ) : (
                              <Clock className="h-4 w-4 text-white" />
                            )}
                          </div>
                          {index < order.statusHistory.length - 1 && (
                            <div className="bg-border absolute left-4 top-8 h-full w-px" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-medium">{history.title}</div>
                          {history.description && (
                            <div className="text-muted-foreground text-sm">
                              {history.description}
                            </div>
                          )}
                          <div className="text-muted-foreground mt-1 text-[11px] tracking-wide">
                            {formatDateTime(history.createdAt)}
                          </div>
                          <div className="text-muted-foreground text-[11px] tracking-wide">
                            {history.previousStatus} → {history.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <User className="h-4 w-4" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.customer ? (
                  <>
                    <div>
                      <div className="font-display text-base">{order.customer.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {order.customer.email}
                      </div>
                      {order.customer.phone && (
                        <div className="text-muted-foreground text-sm">
                          {order.customer.phone}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full tracking-wide"
                      onClick={() =>
                        router.get(`/admin/customers/${order.customer!.id}`)
                      }
                    >
                      View Customer
                    </Button>
                  </>
                ) : (
                  <div>
                    <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Guest Order</div>
                    <div className="text-sm mt-0.5">{order.email}</div>
                    {order.phone && (
                      <div className="text-muted-foreground text-sm">
                        {order.phone}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="animate-fade-up delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.shippingAddress ? (
                  <div className="text-sm">
                    {order.shippingAddress.name && (
                      <div className="font-medium">
                        {order.shippingAddress.name}
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      {formatAddress(order.shippingAddress)}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No shipping address
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="animate-fade-up delay-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <MapPin className="h-4 w-4" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.billingAddress ? (
                  <div className="text-sm">
                    {order.billingAddress.name && (
                      <div className="font-medium">{order.billingAddress.name}</div>
                    )}
                    <div className="text-muted-foreground">
                      {formatAddress(order.billingAddress)}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No billing address
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card className="animate-fade-up delay-500">
              <CardHeader>
                <CardTitle className="font-display text-lg">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger id="status" className="h-11 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={selectedStatus === order.status || isUpdatingStatus}
                  className="w-full tracking-wide"
                >
                  Update Status
                </Button>
              </CardContent>
            </Card>

            {/* Add Note */}
            <Card className="animate-fade-up delay-600">
              <CardHeader>
                <CardTitle className="font-display text-lg">Add Note</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Note</Label>
                    <Textarea
                      id="note"
                      placeholder="Add internal note..."
                      value={noteForm.data.note}
                      onChange={(e) => noteForm.setData('note', e.target.value)}
                      rows={3}
                      className="border-border/60 focus-visible:border-accent"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!noteForm.data.note || noteForm.processing}
                    className="w-full tracking-wide"
                  >
                    Add Note
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card className="animate-fade-up delay-700">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    {order.notes}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Lifecycle Actions */}
            {order.status !== 'cancelled' && !order.cancelledAt && (
              <Card className="animate-fade-up delay-700">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Create Return */}
                  <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full tracking-wide">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Create Return
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display">Create Return</DialogTitle>
                        <DialogDescription>Select items to return from this order.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
                        {order.items.map((item) => {
                          const isSelected = returnItems.some((ri) => ri.orderItemId === item.id)
                          return (
                            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleReturnItem(item.id, item.quantity - item.returnedQuantity)}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.title}</div>
                                {item.variantTitle && (
                                  <div className="text-muted-foreground text-xs">{item.variantTitle}</div>
                                )}
                                <div className="text-muted-foreground text-xs">
                                  Available: {item.quantity - item.returnedQuantity}
                                </div>
                              </div>
                              {isSelected && (
                                <Input
                                  type="number"
                                  min="1"
                                  max={item.quantity - item.returnedQuantity}
                                  value={returnItems.find((ri) => ri.orderItemId === item.id)?.quantity || 1}
                                  onChange={(e) => {
                                    setReturnItems((prev) =>
                                      prev.map((ri) =>
                                        ri.orderItemId === item.id
                                          ? { ...ri, quantity: parseInt(e.target.value) || 1 }
                                          : ri
                                      )
                                    )
                                  }}
                                  className="w-20 h-8"
                                />
                              )}
                              {isSelected && returnReasons.length > 0 && (
                                <Select
                                  value={returnItems.find((ri) => ri.orderItemId === item.id)?.returnReasonId || ''}
                                  onValueChange={(val) => {
                                    setReturnItems((prev) =>
                                      prev.map((ri) =>
                                        ri.orderItemId === item.id ? { ...ri, returnReasonId: val } : ri
                                      )
                                    )
                                  }}
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue placeholder="Reason" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {returnReasons.map((r) => (
                                      <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReturnOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitReturn} disabled={returnItems.length === 0}>
                          Create Return
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Create Claim */}
                  <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full tracking-wide">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Create Claim
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display">Create Claim</DialogTitle>
                        <DialogDescription>File a claim for damaged or incorrect items.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Claim Type</Label>
                          <Select value={claimType} onValueChange={(val: 'refund' | 'replace') => setClaimType(val)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="refund">Refund</SelectItem>
                              <SelectItem value="replace">Replace</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {order.items.map((item) => {
                            const isSelected = claimItems.some((ci) => ci.orderItemId === item.id)
                            return (
                              <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleClaimItem(item.id, item.quantity)}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{item.title}</div>
                                </div>
                                {isSelected && (
                                  <Select
                                    value={claimItems.find((ci) => ci.orderItemId === item.id)?.reason || 'other'}
                                    onValueChange={(val) => {
                                      setClaimItems((prev) =>
                                        prev.map((ci) =>
                                          ci.orderItemId === item.id ? { ...ci, reason: val } : ci
                                        )
                                      )
                                    }}
                                  >
                                    <SelectTrigger className="w-40 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="missing_item">Missing Item</SelectItem>
                                      <SelectItem value="wrong_item">Wrong Item</SelectItem>
                                      <SelectItem value="production_failure">Production Failure</SelectItem>
                                      <SelectItem value="damaged">Damaged</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClaimOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitClaim} disabled={claimItems.length === 0}>
                          Create Claim
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Separator className="my-2" />

                  <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    className="w-full tracking-wide"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
