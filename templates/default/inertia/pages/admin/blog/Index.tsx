import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash,
  FolderOpen,
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
import { formatDate } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  viewCount: number
  category: { name: string; slug: string } | null
  publishedAt: string | null
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  posts: {
    data: BlogPost[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  categories: Category[]
  filters: {
    status: string
    search: string
    category: string
  }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'default' },
  archived: { label: 'Archived', variant: 'outline' },
}

export default function BlogIndex({ posts, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const handleFilter = (key: string, value: string) => {
    router.get('/admin/blog', {
      ...filters,
      [key]: value,
      page: 1,
    }, { preserveState: true, preserveScroll: true })
  }

  const handleSearch = () => {
    handleFilter('search', search)
  }

  const handleDelete = (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      router.delete(`/admin/blog/${post.id}`)
    }
  }

  return (
    <AdminLayout
      title="Blog"
      description="Manage blog posts and content"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/blog/categories">
              <FolderOpen className="mr-2 h-4 w-4" />
              Categories
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/blog/create">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      }
    >
      <Head title="Blog - Admin" />

      <div className="animate-fade-in">
        <Card className="animate-fade-up">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative max-w-xs flex-1">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-11 pl-8"
                />
              </div>
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => handleFilter('status', v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-[140px] h-11">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.category || 'all'}
                onValueChange={(v) => handleFilter('category', v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-[160px] h-11">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Views</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8" style={{ color: '#e9b96e' }} />
                        <p className="text-muted-foreground text-sm">
                          {filters.search ? 'No posts match your search' : 'No blog posts yet'}
                        </p>
                        {!filters.search && (
                          <Button asChild className="mt-2" size="sm">
                            <Link href="/admin/blog/create">
                              <Plus className="mr-2 h-4 w-4" />
                              Create Post
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.data.map((post) => (
                    <TableRow key={post.id} className="group">
                      <TableCell>
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="flex items-center gap-3 hover:underline underline-offset-4"
                        >
                          <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#d4872e' }} />
                          <div>
                            <span className="text-sm font-medium">{post.title}</span>
                            {post.isFeatured && (
                              <Badge variant="outline" className="ml-2 text-[10px] py-0">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {post.category?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[post.status]?.variant || 'secondary'}>
                          {statusConfig[post.status]?.label || post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm tabular-nums">
                        {post.viewCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/blog/${post.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {post.status === 'published' && (
                              <DropdownMenuItem asChild>
                                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(post)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
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
            {posts.meta.lastPage > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-sm">
                  Page {posts.meta.currentPage} of {posts.meta.lastPage} ({posts.meta.total} posts)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={posts.meta.currentPage <= 1}
                    onClick={() => handleFilter('page', String(posts.meta.currentPage - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={posts.meta.currentPage >= posts.meta.lastPage}
                    onClick={() => handleFilter('page', String(posts.meta.currentPage + 1))}
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
