import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  Calendar,
  Copy,
  Edit,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Tag,
  Trash,
  Truck,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate, debounce } from '@/lib/utils'

interface Discount {
  id: string
  code: string
  name: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
  minPurchaseAmount: number | null
  maxDiscountAmount: number | null
  usageLimit: number | null
  usageCount: number
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
}

interface Props {
  discounts: {
    data: Discount[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  filters: {
    search?: string
    status?: string
    type?: string
  }
}

type DiscountStatus = 'active' | 'inactive' | 'scheduled' | 'expired' | 'limit_reached'

export default function DiscountsIndex({ discounts, filters = {} }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const debouncedSearch = debounce((value: string) => {
    router.get(
      '/admin/discounts',
      { ...filters, search: value, page: 1 },
      { preserveState: true }
    )
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      '/admin/discounts',
      { ...filters, [key]: value || undefined, page: 1 },
      { preserveState: true }
    )
  }

  const getDiscountStatus = (discount: Discount): DiscountStatus => {
    const now = new Date()
    const startsAt = discount.startsAt ? new Date(discount.startsAt) : null
    const endsAt = discount.endsAt ? new Date(discount.endsAt) : null

    if (!discount.isActive) return 'inactive'
    if (startsAt && startsAt > now) return 'scheduled'
    if (endsAt && endsAt < now) return 'expired'
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return 'limit_reached'
    return 'active'
  }

  const getStatusVariant = (
    status: DiscountStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'scheduled':
        return 'secondary'
      case 'expired':
      case 'limit_reached':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: DiscountStatus): string => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      case 'scheduled':
        return 'Scheduled'
      case 'expired':
        return 'Expired'
      case 'limit_reached':
        return 'Limit Reached'
      default:
        return status
    }
  }

  const getTypeIcon = (type: Discount['type']) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-3 w-3" />
      case 'fixed_amount':
        return <Tag className="h-3 w-3" />
      case 'free_shipping':
        return <Truck className="h-3 w-3" />
    }
  }

  const getValueDisplay = (discount: Discount) => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}% off`
      case 'fixed_amount':
        return `${formatCurrency(discount.value)} off`
      case 'free_shipping':
        return 'Free shipping'
      default:
        return String(discount.value)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const deleteDiscount = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete the discount "${code}"?`)) {
      router.delete(`/admin/discounts/${id}`)
    }
  }

  return (
    <AdminLayout
      title="Discounts"
      description={`Manage your ${discounts.meta.total} discount codes`}
      actions={
        <Button asChild>
          <Link href="/admin/discounts/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Discount
          </Link>
        </Button>
      }
    >
      <Head title="Discounts - Admin" />

      <div className="animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search by code or name..."
                  value={search}
                  onChange={handleSearchChange}
                  className="bg-secondary/50 border-0 pl-8 text-sm h-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('status', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('type', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger className="w-[150px] h-9 text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs">Value</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Usage</TableHead>
                  <TableHead className="text-xs">Valid Period</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">
                          {filters.search ? 'No discounts found' : 'No discounts yet'}
                        </p>
                        {!filters.search && (
                          <Button asChild size="sm" variant="outline">
                            <Link href="/admin/discounts/create">
                              Create your first discount
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  discounts.data.map((discount) => {
                    const status = getDiscountStatus(discount)
                    return (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/discounts/${discount.id}/edit`}
                                  className="font-mono text-sm font-medium hover:underline underline-offset-4"
                                >
                                  {discount.code}
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyCode(discount.code)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-muted-foreground text-[11px] mt-0.5">
                                {discount.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getTypeIcon(discount.type)}
                            <span className="text-sm font-medium">
                              {getValueDisplay(discount)}
                            </span>
                          </div>
                          {discount.minPurchaseAmount && (
                            <p className="text-muted-foreground text-[11px] mt-0.5">
                              Min: {formatCurrency(discount.minPurchaseAmount)}
                            </p>
                          )}
                          {discount.maxDiscountAmount && (
                            <p className="text-muted-foreground text-[11px]">
                              Max: {formatCurrency(discount.maxDiscountAmount)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(status)} className="text-[11px]">
                            {getStatusLabel(status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{discount.usageCount}</span>
                            {discount.usageLimit && (
                              <span className="text-muted-foreground">
                                {' '}
                                / {discount.usageLimit}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {discount.startsAt || discount.endsAt ? (
                            <div className="flex items-start gap-1">
                              <Calendar className="mt-0.5 h-3 w-3" />
                              <div className="text-[11px]">
                                {discount.startsAt && (
                                  <div>From: {formatDate(discount.startsAt)}</div>
                                )}
                                {discount.endsAt && (
                                  <div>Until: {formatDate(discount.endsAt)}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px]">No limit</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/discounts/${discount.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => copyCode(discount.code)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy code
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  deleteDiscount(discount.id, discount.code)
                                }
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {discounts.meta.lastPage > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-xs">
                  Page {discounts.meta.currentPage} of {discounts.meta.lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={discounts.meta.currentPage <= 1}
                    onClick={() =>
                      router.get('/admin/discounts', {
                        ...filters,
                        page: discounts.meta.currentPage - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={discounts.meta.currentPage >= discounts.meta.lastPage}
                    onClick={() =>
                      router.get('/admin/discounts', {
                        ...filters,
                        page: discounts.meta.currentPage + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
