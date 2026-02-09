import { Head } from '@inertiajs/react'
import {
  FolderOpen,
  Plus,
  Tag,
  Filter,
  Sparkles,
} from 'lucide-react'

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

interface Collection {
  id: string
  name: string
  description: string | null
  productCount: number
  type: 'manual' | 'automated'
  isActive: boolean
}

interface Props {
  collections: Collection[]
}

export default function CollectionsIndex({ collections }: Props) {
  return (
    <AdminLayout
      title="Collections"
      description="Group products into curated collections"
      actions={
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Collection
        </Button>
      }
    >
      <Head title="Collections - Admin" />

      <div className="space-y-6 animate-fade-in">
        {collections.length === 0 ? (
          <>
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                    <FolderOpen className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg">Product Collections</h3>
                    <p className="text-muted-foreground mt-1 max-w-md text-sm">
                      Organize your products into collections to help customers discover items.
                      Create manual collections or set up automated rules to group products dynamically.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="bg-muted mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Tag className="text-muted-foreground h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm">Manual Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Hand-pick products for curated collections like "Staff Picks" or "Gift Ideas"
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="bg-muted mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Sparkles className="text-muted-foreground h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm">Automated Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Set conditions to automatically group products by tags, price, vendor, or other attributes
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="bg-muted mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Filter className="text-muted-foreground h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm">Smart Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Combine multiple conditions with AND/OR logic for precise product grouping
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <div className="text-sm font-medium">{collection.name}</div>
                      {collection.description && (
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={collection.isActive ? 'default' : 'outline'} className="text-[11px]">
                        {collection.type === 'manual' ? 'Manual' : 'Automated'}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {collection.productCount} products
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
