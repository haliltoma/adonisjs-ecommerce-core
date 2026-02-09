import { Head } from '@inertiajs/react'
import { Image, Plus, Calendar, Eye } from 'lucide-react'

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
  banners: any[]
}

export default function ContentBanners({ banners }: Props) {
  return (
    <AdminLayout
      title="Banners"
      description="Manage promotional banners and hero sections"
      actions={
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Banner
        </Button>
      }
    >
      <Head title="Banners - Admin" />

      <div className="animate-fade-in space-y-6">
        {banners.length === 0 ? (
          <Card className="animate-fade-up">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#e9b96e20' }}>
                  <Image className="h-8 w-8" style={{ color: '#d4872e' }} />
                </div>
                <div>
                  <h3 className="font-display text-lg">Banner Management</h3>
                  <p className="text-muted-foreground mt-1 max-w-md text-sm">
                    Create eye-catching promotional banners for your storefront. Schedule campaigns,
                    target specific pages, and track banner performance.
                  </p>
                </div>
                <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-3">
                  {[
                    { title: 'Hero Banners', desc: 'Full-width banners for the homepage and landing pages' },
                    { title: 'Promotional Bars', desc: 'Announcement bars for sales, free shipping, and more' },
                    { title: 'Sidebar Banners', desc: 'Compact banners for sidebars and category pages' },
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
                    <Calendar className="h-4 w-4" />
                    <span>Schedule campaigns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Track impressions</span>
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
