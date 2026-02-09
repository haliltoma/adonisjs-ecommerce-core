import { Head } from '@inertiajs/react'
import {
  Truck,
  Plus,
  Globe,
  MapPin,
  Package,
  Clock,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  methods: ShippingMethod[]
}

interface ShippingMethod {
  id: string
  name: string
  type: string
  rate: number
  isEnabled: boolean
}

interface Props {
  zones: ShippingZone[]
  methods: ShippingMethod[]
}

export default function ShippingSettings({ zones, methods }: Props) {
  return (
    <AdminLayout
      title="Shipping Settings"
      description="Configure shipping zones, rates, and delivery methods"
      actions={
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Shipping Zone
        </Button>
      }
    >
      <Head title="Shipping Settings - Admin" />

      <div className="animate-fade-in space-y-6">
        {zones.length === 0 && methods.length === 0 ? (
          <>
            {/* Overview */}
            <Card className="animate-fade-up">
              <CardContent className="py-16">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#e9b96e20' }}>
                    <Truck className="h-8 w-8" style={{ color: '#d4872e' }} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg">Shipping Configuration</h3>
                    <p className="text-muted-foreground mt-1 max-w-md text-sm">
                      Set up shipping zones to define where you ship and configure delivery
                      methods with custom rates for each zone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Globe, title: 'Shipping Zones', desc: 'Group countries and regions into zones with specific shipping rules' },
                { icon: Package, title: 'Flat Rate', desc: 'Set fixed shipping costs per order or per item for each zone' },
                { icon: MapPin, title: 'Weight-Based', desc: 'Calculate shipping costs based on package weight and destination' },
                { icon: Clock, title: 'Free Shipping', desc: 'Offer free shipping on orders above a threshold or specific products' },
              ].map((feature, index) => (
                <Card key={feature.title} className={`card-hover animate-fade-up delay-${(index + 1) * 100}`}>
                  <CardHeader className="pb-2">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#e9b96e20' }}>
                      <feature.icon className="h-5 w-5" style={{ color: '#d4872e' }} />
                    </div>
                    <CardTitle className="font-display text-sm">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {zones.map((zone, index) => (
              <Card key={zone.id} className={`animate-fade-up delay-${(index + 1) * 100}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display">{zone.name}</CardTitle>
                      <CardDescription>
                        {zone.countries.length} countries &middot; {zone.methods.length} shipping methods
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Zone
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
