import { Link } from '@inertiajs/react'
import { ChevronRight, FolderOpen, Package } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import Seo from '@/components/shared/Seo'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/hooks/use-translation'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  depth: number
}

interface Props {
  categories: Category[]
}

export default function Categories({ categories }: Props) {
  const { t } = useTranslation()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  // Build a tree structure from the flat list
  const rootCategories = categories.filter((c) => c.parentId === null)
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId)

  return (
    <StorefrontLayout>
      <Seo
        title={t('storefront.categoriesPage.title')}
        description="Browse all product categories. Find exactly what you're looking for."
        storeName="AdonisCommerce"
        baseUrl={baseUrl}
        canonical={`${baseUrl}/categories`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              {t('storefront.categoriesPage.browse')}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {t('storefront.categoriesPage.title')}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              {t('storefront.categoriesPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {rootCategories.length > 0 ? (
          <div className="space-y-16">
            {rootCategories.map((root, rootIdx) => {
              const children = getChildren(root.id)

              return (
                <section key={root.id} className={`animate-fade-up delay-${Math.min((rootIdx + 1) * 100, 700)}`}>
                  {/* Root Category */}
                  <div className="mb-8 flex items-center justify-between">
                    <Link
                      href={`/category/${root.slug}`}
                      className="group flex items-center gap-3"
                    >
                      <h2 className="font-display group-hover:text-accent text-2xl transition-colors">
                        {root.name}
                      </h2>
                      <ChevronRight className="text-muted-foreground group-hover:text-accent h-5 w-5 transition-colors" />
                    </Link>
                    {root.description && (
                      <p className="text-muted-foreground hidden text-sm sm:block max-w-md text-right">
                        {root.description}
                      </p>
                    )}
                  </div>

                  {/* Root Category Image Card */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                      href={`/category/${root.slug}`}
                      className="group sm:col-span-2 lg:col-span-1"
                    >
                      <Card className="card-hover overflow-hidden border-0 shadow-sm h-full">
                        <div className="bg-muted relative overflow-hidden rounded-t-xl img-zoom">
                          <AspectRatio ratio={4 / 3}>
                            {root.imageUrl ? (
                              <img
                                src={root.imageUrl}
                                alt={root.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
                                <FolderOpen className="text-muted-foreground h-10 w-10" />
                              </div>
                            )}
                          </AspectRatio>
                        </div>
                        <CardContent className="pt-4">
                          <p className="font-display group-hover:text-accent transition-colors">
                            {t('storefront.categoriesPage.viewAll')} {root.name}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Subcategories */}
                    {children.map((child) => {
                      const grandchildren = getChildren(child.id)

                      return (
                        <Link key={child.id} href={`/category/${child.slug}`} className="group">
                          <Card className="card-hover overflow-hidden border-0 shadow-sm h-full">
                            <div className="bg-muted relative overflow-hidden rounded-t-xl img-zoom">
                              <AspectRatio ratio={4 / 3}>
                                {child.imageUrl ? (
                                  <img
                                    src={child.imageUrl}
                                    alt={child.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
                                    <FolderOpen className="text-muted-foreground h-8 w-8" />
                                  </div>
                                )}
                              </AspectRatio>
                            </div>
                            <CardContent className="pt-4">
                              <p className="font-display group-hover:text-accent font-medium transition-colors">
                                {child.name}
                              </p>
                              {grandchildren.length > 0 && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {grandchildren.length === 1 ? t('storefront.categoriesPage.subcategoryCountSingle', { count: '1' }) : t('storefront.categoriesPage.subcategoryCount', { count: String(grandchildren.length) })}
                                </p>
                              )}
                              {child.description && (
                                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                  {child.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>

                  <Separator className="mt-16 bg-border/60" />
                </section>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed border-border/60 animate-fade-up delay-200">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="text-muted-foreground h-12 w-12" />
              <h3 className="font-display mt-4 text-lg">{t('storefront.categoriesPage.noCategories')}</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                {t('storefront.categoriesPage.noCategoriesDesc')}
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">{t('storefront.categoriesPage.browseAllProducts')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </StorefrontLayout>
  )
}
