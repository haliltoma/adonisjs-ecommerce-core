import { Head, Link, router } from '@inertiajs/react'
import { FileText, Plus, Search, Pencil, Trash, ExternalLink, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

interface PageItem {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  template: string
  isSystem: boolean
  updatedAt: string | null
}

interface Props {
  pages: PageItem[]
}

export default function ContentPages({ pages }: Props) {
  const [search, setSearch] = useState('')

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(search.toLowerCase()) ||
      page.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (page: PageItem) => {
    if (page.isSystem) return
    if (confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
      router.delete(`/admin/content/pages/${page.id}`)
    }
  }

  return (
    <AdminLayout
      title="Pages"
      description="Manage your store's content pages"
      actions={
        <Button asChild>
          <Link href="/admin/content/pages/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Link>
        </Button>
      }
    >
      <Head title="Pages - Admin" />

      <div className="animate-fade-in">
        <Card className="animate-fade-up">
          <CardHeader className="pb-4">
            <div className="relative max-w-xs">
              <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
              <Input
                placeholder="Search pages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Slug</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Last Updated</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8" style={{ color: '#e9b96e' }} />
                        <p className="text-muted-foreground text-sm">
                          {search ? 'No pages match your search' : 'No pages created yet'}
                        </p>
                        {!search && (
                          <p className="text-muted-foreground text-xs">
                            Create your first page to get started
                          </p>
                        )}
                        {!search && (
                          <Button asChild className="mt-2" size="sm">
                            <Link href="/admin/content/pages/create">
                              <Plus className="mr-2 h-4 w-4" />
                              Create Page
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => (
                    <TableRow key={page.id} className="group">
                      <TableCell>
                        <Link
                          href={`/admin/content/pages/${page.id}/edit`}
                          className="flex items-center gap-3 hover:underline underline-offset-4"
                        >
                          <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#d4872e' }} />
                          <div>
                            <span className="text-sm font-medium">{page.title}</span>
                            {page.isSystem && (
                              <Badge variant="outline" className="ml-2 text-[10px] py-0">
                                System
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <code className="text-muted-foreground text-sm">/pages/{page.slug}</code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={page.status === 'published' ? 'default' : 'secondary'}
                          className={page.status === 'published' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {page.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {page.updatedAt ? formatDate(page.updatedAt) : '-'}
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
                              <Link href={`/admin/content/pages/${page.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {page.status === 'published' && (
                              <DropdownMenuItem asChild>
                                <a href={`/pages/${page.slug}`} target="_blank" rel="noopener">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Page
                                </a>
                              </DropdownMenuItem>
                            )}
                            {!page.isSystem && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(page)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
