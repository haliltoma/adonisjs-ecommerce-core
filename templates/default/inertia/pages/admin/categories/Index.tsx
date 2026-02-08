import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  ChevronRight,
  Edit,
  FolderTree,
  GripVertical,
  Image,
  MoreHorizontal,
  Plus,
  Trash,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  position: number
  parentId: string | null
  productCount: number
  children: Category[]
}

interface Props {
  categories: Category[]
}

export default function CategoriesIndex({ categories }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const deleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      router.delete(`/admin/categories/${id}`)
    }
  }

  const getTotalCount = (cats: Category[]): number => {
    return cats.reduce((acc, cat) => {
      return acc + 1 + (cat.children ? getTotalCount(cat.children) : 0)
    }, 0)
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedIds.has(category.id)

    return (
      <Collapsible
        key={category.id}
        open={isExpanded}
        onOpenChange={() => toggleExpand(category.id)}
      >
        <div
          className={`group flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/50 ${
            level > 0 ? 'bg-muted/20' : ''
          }`}
          style={{ paddingLeft: `${1 + level * 1.5}rem` }}
        >
          <GripVertical className="text-muted-foreground/50 h-4 w-4 cursor-grab" />

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={!hasChildren}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                } ${!hasChildren ? 'opacity-0' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>

          <div className="bg-muted h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                <Image className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/categories/${category.id}/edit`}
              className="font-medium hover:underline"
            >
              {category.name}
            </Link>
            <p className="text-muted-foreground truncate text-sm">
              /{category.slug}
            </p>
          </div>

          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <span>{category.productCount}</span>
            <span className="hidden sm:inline">products</span>
          </div>

          <Badge variant={category.isActive ? 'default' : 'secondary'}>
            {category.isActive ? 'Active' : 'Inactive'}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/categories/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/categories/create?parent=${category.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add subcategory
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => deleteCategory(category.id, category.name)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            {category.children.map((child) => renderCategory(child, level + 1))}
          </CollapsibleContent>
        )}
      </Collapsible>
    )
  }

  return (
    <AdminLayout
      title="Categories"
      description={`${getTotalCount(categories)} categories to organize your products`}
      actions={
        <Button asChild>
          <Link href="/admin/categories/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      }
    >
      <Head title="Categories - Admin" />

      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16">
              <FolderTree className="text-muted-foreground h-12 w-12" />
              <h3 className="mt-2 font-medium">No categories</h3>
              <p className="text-muted-foreground text-sm">
                Get started by creating a new category.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/categories/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {categories.map((category) => renderCategory(category))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
