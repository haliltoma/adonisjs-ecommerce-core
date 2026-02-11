import { Head, Link, router, useForm } from '@inertiajs/react'
import { ArrowLeft, Save, Trash } from 'lucide-react'
import { FormEvent } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'

interface Props {
  collection: {
    id: string
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
    isActive: boolean
    sortOrder: number
    createdAt: string
    updatedAt: string
  }
}

export default function EditCollection({ collection }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    name: collection.name,
    slug: collection.slug,
    description: collection.description || '',
    imageUrl: collection.imageUrl || '',
    isActive: collection.isActive,
    sortOrder: collection.sortOrder,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    patch(`/admin/collections/${collection.id}`)
  }

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this collection? This action cannot be undone.'
      )
    ) {
      router.delete(`/admin/collections/${collection.id}`)
    }
  }

  return (
    <AdminLayout
      title="Edit Collection"
      description={`Update ${collection.name}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      }
    >
      <Head title={`Edit ${collection.name} - Admin`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="font-display text-lg">Collection Information</CardTitle>
                <CardDescription>
                  Basic information about the collection
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2 text-muted-foreground text-[11px] tracking-wide">
                <div>Created: {formatDate(collection.createdAt)}</div>
                <div>Updated: {formatDate(collection.updatedAt)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Summer Collection"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  placeholder="summer-collection"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Collection description..."
                rows={4}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={data.imageUrl}
                onChange={(e) => setData('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl}</p>
              )}
              {data.imageUrl && (
                <div className="mt-2">
                  <img
                    src={data.imageUrl}
                    alt="Collection preview"
                    className="h-32 w-32 rounded-md object-cover border border-border/60"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={data.sortOrder}
                onChange={(e) => setData('sortOrder', Number(e.target.value))}
                placeholder="0"
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">{errors.sortOrder}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Status</CardTitle>
            <CardDescription>Control collection visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Make this collection visible to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={data.isActive}
                onCheckedChange={(checked) => setData('isActive', checked)}
              />
            </div>
            {errors.isActive && (
              <p className="text-sm text-destructive mt-2">{errors.isActive}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 animate-fade-up delay-300">
          <Button variant="outline" asChild type="button">
            <Link href="/admin/collections">Cancel</Link>
          </Button>
          <Button type="submit" disabled={processing} className="tracking-wide">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
