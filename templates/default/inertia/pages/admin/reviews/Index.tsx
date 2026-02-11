import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  Check,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Search,
  Star,
  Trash,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { formatDate, debounce } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  customerName: string
  customerEmail: string
  productTitle: string
  productId: string
  reply: string | null
  createdAt: string
}

interface Props {
  reviews: {
    data: Review[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }
  filters: { search?: string; status?: string; rating?: string }
}

export default function ReviewsIndex({ reviews, filters = {} }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const debouncedSearch = debounce((value: string) => {
    router.get('/admin/reviews', { ...filters, search: value, page: 1 }, { preserveState: true })
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/reviews', { ...filters, [key]: value || undefined, page: 1 }, { preserveState: true })
  }

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    router.patch(`/admin/reviews/${id}`, { status })
  }

  const deleteReview = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      router.delete(`/admin/reviews/${id}`)
    }
  }

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'approved') return 'default'
    if (status === 'rejected') return 'destructive'
    return 'secondary'
  }

  return (
    <AdminLayout title="Reviews" description={`${reviews.meta.total} product reviews`}>
      <Head title="Reviews - Admin" />
      <div className="animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input placeholder="Search reviews..." value={search} onChange={handleSearchChange} className="bg-secondary/50 border-0 pl-8 text-sm h-9" />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.rating || 'all'} onValueChange={(v) => handleFilter('rating', v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ratings</SelectItem>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={String(r)}>{r} stars</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Review</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">No reviews yet</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.data.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Link href={`/admin/products/${review.productId}`} className="text-sm font-medium hover:underline underline-offset-4">
                          {review.productTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">{review.customerName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{review.customerName}</p>
                            <p className="text-muted-foreground text-[11px]">{review.customerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        {review.title && <p className="text-sm font-medium truncate">{review.title}</p>}
                        <p className="text-muted-foreground text-[11px] truncate">{review.comment}</p>
                        {review.reply && (
                          <p className="text-[11px] text-primary mt-0.5">Replied</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(review.status)} className="text-[11px]">
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(review.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {review.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => updateStatus(review.id, 'approved')}>
                                  <Check className="mr-2 h-4 w-4" />Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(review.id, 'rejected')}>
                                  <X className="mr-2 h-4 w-4" />Reject
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteReview(review.id)}>
                              <Trash className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {reviews.meta.lastPage > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-xs">Page {reviews.meta.currentPage} of {reviews.meta.lastPage}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={reviews.meta.currentPage <= 1} onClick={() => router.get('/admin/reviews', { ...filters, page: reviews.meta.currentPage - 1 })}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={reviews.meta.currentPage >= reviews.meta.lastPage} onClick={() => router.get('/admin/reviews', { ...filters, page: reviews.meta.currentPage + 1 })}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
