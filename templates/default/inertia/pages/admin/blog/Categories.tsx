import { Head, Link, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, FolderOpen, Loader2, Pencil, Plus, Save, Trash, X } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  postCount: number
}

interface Props {
  categories: BlogCategory[]
}

export default function BlogCategories({ categories }: Props) {
  const [editing, setEditing] = useState<BlogCategory | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const createForm = useForm({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
  })

  const editForm = useForm({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
  })

  const openEdit = (cat: BlogCategory) => {
    setEditing(cat)
    editForm.setData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sortOrder: cat.sortOrder,
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createForm.post('/admin/blog/categories', {
      onSuccess: () => {
        setShowCreate(false)
        createForm.reset()
      },
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    editForm.patch(`/admin/blog/categories/${editing.id}`, {
      onSuccess: () => setEditing(null),
    })
  }

  const handleDelete = (cat: BlogCategory) => {
    if (cat.postCount > 0) {
      alert(`Cannot delete "${cat.name}" because it has ${cat.postCount} posts. Reassign the posts first.`)
      return
    }
    if (confirm(`Delete category "${cat.name}"?`)) {
      router.delete(`/admin/blog/categories/${cat.id}`)
    }
  }

  return (
    <AdminLayout
      title="Blog Categories"
      description="Organize your blog posts with categories"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      }
    >
      <Head title="Blog Categories - Admin" />

      <div className="animate-fade-in">
        <Card className="animate-fade-up">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Slug</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Posts</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Order</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FolderOpen className="h-8 w-8" style={{ color: '#e9b96e' }} />
                        <p className="text-muted-foreground text-sm">No categories yet</p>
                        <Button size="sm" className="mt-2" onClick={() => setShowCreate(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Category
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} className="group">
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium">{cat.name}</span>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-muted-foreground text-sm">{cat.slug}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{cat.postCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm tabular-nums">
                        {cat.sortOrder}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(cat)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>Add a new blog category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={createForm.data.name}
                  onChange={(e) => createForm.setData('name', e.target.value)}
                  placeholder="Category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-slug">Slug</Label>
                <Input
                  id="create-slug"
                  value={createForm.data.slug}
                  onChange={(e) => createForm.setData('slug', e.target.value)}
                  placeholder="Leave empty to auto-generate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={createForm.data.description}
                  onChange={(e) => createForm.setData('description', e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-order">Sort Order</Label>
                <Input
                  id="create-order"
                  type="number"
                  value={createForm.data.sortOrder}
                  onChange={(e) => createForm.setData('sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.processing}>
                {createForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update category details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.data.name}
                  onChange={(e) => editForm.setData('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editForm.data.slug}
                  onChange={(e) => editForm.setData('slug', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.data.description}
                  onChange={(e) => editForm.setData('description', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order">Sort Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={editForm.data.sortOrder}
                  onChange={(e) => editForm.setData('sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                {editForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
