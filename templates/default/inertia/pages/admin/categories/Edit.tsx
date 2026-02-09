import { Head, Link, router, useForm } from '@inertiajs/react'
import { ArrowLeft, Save, Trash } from 'lucide-react'
import { FormEvent, useEffect } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, slugify } from '@/lib/utils'

interface Props {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
    parentId: string | null
    depth: number
    path: string
    metaTitle: string | null
    metaDescription: string | null
    isActive: boolean
    position: number
    createdAt: string
    updatedAt: string
  }
  parentOptions: { id: string; name: string; depth: number }[]
  ancestors: { id: string; name: string }[]
}

export default function EditCategory({ category, parentOptions, ancestors }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    parentId: category.parentId || '',
    imageUrl: category.imageUrl || '',
    metaTitle: category.metaTitle || '',
    metaDescription: category.metaDescription || '',
    isActive: category.isActive,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    patch(`/admin/categories/${category.id}`)
  }

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      router.delete(`/admin/categories/${category.id}`)
    }
  }

  return (
    <AdminLayout
      title="Edit Category"
      description={`Update ${category.name}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      }
    >
      <Head title={`Edit ${category.name} - Admin`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="font-display text-lg">Category Information</CardTitle>
                <CardDescription>
                  Basic information about the category
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2 text-muted-foreground text-[11px] tracking-wide">
                <div>Created: {formatDate(category.createdAt)}</div>
                <div>Updated: {formatDate(category.updatedAt)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ancestors.length > 0 && (
              <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
                <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Category Path
                </Label>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {ancestors.map((ancestor, index) => (
                    <div key={ancestor.id} className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${ancestor.id}/edit`}
                        className="text-sm text-accent hover:underline underline-offset-4"
                      >
                        {ancestor.name}
                      </Link>
                      {index < ancestors.length - 1 && (
                        <span className="text-muted-foreground">/</span>
                      )}
                    </div>
                  ))}
                  <span className="text-muted-foreground">/</span>
                  <Badge className="bg-accent text-accent-foreground">{category.name}</Badge>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Electronics"
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
                  placeholder="electronics"
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
                placeholder="Category description..."
                rows={4}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Parent Category</Label>
              <Select
                value={data.parentId || 'none'}
                onValueChange={(value) => setData('parentId', value === 'none' ? '' : value)}
              >
                <SelectTrigger id="parentId" className="h-11 border-border/60">
                  <SelectValue placeholder="None (Root Category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {parentOptions
                    .filter((option) => option.id !== category.id)
                    .map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {'\u00A0'.repeat(option.depth * 4)}
                        {option.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.parentId && (
                <p className="text-sm text-destructive">{errors.parentId}</p>
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
                    alt="Category preview"
                    className="h-32 w-32 rounded-md object-cover border border-border/60"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">SEO</CardTitle>
            <CardDescription>
              Search engine optimization settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Meta Title</Label>
              <Input
                id="metaTitle"
                value={data.metaTitle}
                onChange={(e) => setData('metaTitle', e.target.value)}
                placeholder="Category name"
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.metaTitle && (
                <p className="text-sm text-destructive">{errors.metaTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={data.metaDescription}
                onChange={(e) => setData('metaDescription', e.target.value)}
                placeholder="Description for search engines..."
                rows={3}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.metaDescription && (
                <p className="text-sm text-destructive">{errors.metaDescription}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Status</CardTitle>
            <CardDescription>Control category visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Make this category visible to customers
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

        <div className="flex items-center justify-end gap-4 animate-fade-up delay-400">
          <Button variant="outline" asChild type="button">
            <Link href="/admin/categories">Cancel</Link>
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
