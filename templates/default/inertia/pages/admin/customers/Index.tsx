import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  UserPlus,
  Users,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface Customer {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string
  phone: string | null
  status: 'active' | 'disabled' | 'banned'
  acceptsMarketing: boolean
  totalOrders: number
  totalSpent: number
  lastOrderAt: string | null
  createdAt: string
}

interface Props {
  customers: {
    data: Customer[]
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
  }
}

export default function CustomersIndex({ customers, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const debouncedSearch = debounce((value: string) => {
    router.get(
      '/admin/customers',
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
      '/admin/customers',
      { ...filters, [key]: value || undefined, page: 1 },
      { preserveState: true }
    )
  }

  const getFullName = (customer: Customer) => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    }
    return 'No name'
  }

  const getInitials = (customer: Customer) => {
    const name = getFullName(customer)
    if (name === 'No name') return customer.email.charAt(0).toUpperCase()
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'banned':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <AdminLayout
      title="Customers"
      description={`${customers.meta.total} customers in your store`}
      actions={
        <Button asChild>
          <Link href="/admin/customers/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      }
    >
      <Head title="Customers - Admin" />

      <div className="animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={handleSearchChange}
                  className="bg-secondary/50 border-0 pl-8 text-sm h-9"
                />
              </div>

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
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Orders</TableHead>
                  <TableHead className="text-xs">Total Spent</TableHead>
                  <TableHead className="text-xs">Last Order</TableHead>
                  <TableHead className="text-xs">Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">
                          {filters.search
                            ? 'No customers found'
                            : 'No customers yet'}
                        </p>
                        {!filters.search && (
                          <p className="text-muted-foreground text-[11px]">
                            Customers will appear here once they register
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.data.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">{getInitials(customer)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="text-sm font-medium hover:underline underline-offset-4"
                            >
                              {getFullName(customer)}
                            </Link>
                            <p className="text-muted-foreground text-[11px] mt-0.5">
                              {customer.email}
                            </p>
                            {customer.phone && (
                              <p className="text-muted-foreground text-[11px]">
                                {customer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(customer.status)} className="text-[11px]">
                          {customer.status.charAt(0).toUpperCase() +
                            customer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="text-muted-foreground h-3 w-3" />
                          <span className="text-sm">{customer.totalOrders}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {customer.lastOrderAt
                          ? formatDate(customer.lastOrderAt)
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(customer.createdAt)}
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
                              <Link href={`/admin/customers/${customer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {customers.meta.lastPage > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-xs">
                  Page {customers.meta.currentPage} of {customers.meta.lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={customers.meta.currentPage <= 1}
                    onClick={() =>
                      router.get('/admin/customers', {
                        ...filters,
                        page: customers.meta.currentPage - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={customers.meta.currentPage >= customers.meta.lastPage}
                    onClick={() =>
                      router.get('/admin/customers', {
                        ...filters,
                        page: customers.meta.currentPage + 1,
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
