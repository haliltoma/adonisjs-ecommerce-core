import { Head } from '@inertiajs/react'
import { Menu, Plus, GripVertical, ExternalLink } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Props {
  menus: any[]
}

export default function ContentMenus({ menus }: Props) {
  return (
    <AdminLayout
      title="Navigation Menus"
      description="Manage your store's navigation menus"
      actions={
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Menu
        </Button>
      }
    >
      <Head title="Menus - Admin" />

      <div className="animate-fade-in space-y-6">
        {menus.length === 0 ? (
          <Card className="animate-fade-up">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#e9b96e20' }}>
                  <Menu className="h-8 w-8" style={{ color: '#d4872e' }} />
                </div>
                <div>
                  <h3 className="font-display text-lg">Menu Management</h3>
                  <p className="text-muted-foreground mt-1 max-w-md text-sm">
                    Create and manage navigation menus for your storefront. Organize header, footer,
                    and sidebar navigation with drag-and-drop ordering.
                  </p>
                </div>
                <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-3">
                  {[
                    { title: 'Header Navigation', desc: 'Main navigation links displayed in the store header' },
                    { title: 'Footer Navigation', desc: 'Link groups displayed in the footer area' },
                    { title: 'Sidebar Menus', desc: 'Category and filter menus for product browsing' },
                  ].map((item, index) => (
                    <Card key={item.title} className={`card-hover animate-fade-up delay-${(index + 2) * 100}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="font-display text-sm">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          {item.desc}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="text-muted-foreground mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4" />
                    <span>Drag-and-drop ordering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Custom & internal links</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AdminLayout>
  )
}
