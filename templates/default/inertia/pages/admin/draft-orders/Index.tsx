import { Head, Link, router } from '@inertiajs/react'
import { FileText, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'

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
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface DraftOrder {
  id: string
  displayId: string
  status: string
  customer: { id?: string; name?: string; email: string } | null
  itemCount: number
  grandTotal: number
  currencyCode: string
  createdAt: string
}

interface Props {
  draftOrders: {
    data: DraftOrder[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }
  filters: {
    status: string | null
    search: string | null
  }
}

export default function DraftOrdersIndex({ draftOrders, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get('/admin/draft-orders', { search }, { preserveState: true })
  }

  const handleFilterStatus = (status: string) => {
    router.get(
      '/admin/draft-orders',
      { ...filters, status: status === 'all' ? undefined : status },
      { preserveState: true }
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this draft order?')) {
      router.delete(`/admin/draft-orders/${id}`)
    }
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'open':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <AdminLayout
      title="Draft Orders"
      description="Create orders on behalf of customers"
      actions={
        <Button asChild>
          <Link href="/admin/draft-orders/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Draft Order
          </Link>
        </Button>
      }
    >
      <Head title="Draft Orders - Admin" />

      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by draft ID or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  Search
                </Button>
              </form>
              <Select
                value={filters.status || 'all'}
                onValueChange={handleFilterStatus}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {draftOrders.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <CardTitle className="mb-2 font-display">No Draft Orders</CardTitle>
              <CardDescription className="mb-6 text-center">
                Create draft orders to manually place orders for customers.
              </CardDescription>
              <Button asChild>
                <Link href="/admin/draft-orders/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Draft Order
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Draft</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftOrders.data.map((draft) => (
                    <TableRow
                      key={draft.id}
                      className="cursor-pointer"
                      onClick={() => router.get(`/admin/draft-orders/${draft.id}`)}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {draft.displayId}
                      </TableCell>
                      <TableCell>
                        {draft.customer ? (
                          <div>
                            {draft.customer.name && (
                              <div className="font-medium">{draft.customer.name}</div>
                            )}
                            <div className="text-muted-foreground text-sm">
                              {draft.customer.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No customer</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(draft.status)}>
                          {draft.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{draft.itemCount}</TableCell>
                      <TableCell className="text-right font-display">
                        {formatCurrency(draft.grandTotal, draft.currencyCode)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px] tracking-wide">
                        {formatDateTime(draft.createdAt)}
                      </TableCell>
                      <TableCell>
                        {draft.status === 'open' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(draft.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {draftOrders.meta.lastPage > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {(draftOrders.meta.currentPage - 1) * draftOrders.meta.perPage + 1} to{' '}
              {Math.min(
                draftOrders.meta.currentPage * draftOrders.meta.perPage,
                draftOrders.meta.total
              )}{' '}
              of {draftOrders.meta.total} draft orders
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={draftOrders.meta.currentPage <= 1}
                onClick={() =>
                  router.get('/admin/draft-orders', {
                    ...filters,
                    page: draftOrders.meta.currentPage - 1,
                  })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={draftOrders.meta.currentPage >= draftOrders.meta.lastPage}
                onClick={() =>
                  router.get('/admin/draft-orders', {
                    ...filters,
                    page: draftOrders.meta.currentPage + 1,
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
