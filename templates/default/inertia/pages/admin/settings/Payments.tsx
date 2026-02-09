import { Head } from '@inertiajs/react'
import {
  CreditCard,
  Plus,
  Shield,
  Banknote,
  Wallet,
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

interface Provider {
  id: string
  name: string
  type: string
  isEnabled: boolean
}

interface Props {
  providers: Provider[]
}

export default function PaymentSettings({ providers }: Props) {
  const availableProviders = [
    {
      name: 'Stripe',
      description: 'Accept credit cards, debit cards, and other payment methods via Stripe',
      icon: CreditCard,
      badge: 'Recommended',
    },
    {
      name: 'PayPal',
      description: 'Let customers pay with their PayPal account or credit card',
      icon: Wallet,
      badge: null,
    },
    {
      name: 'Manual Payment',
      description: 'Accept bank transfers, checks, or cash on delivery',
      icon: Banknote,
      badge: null,
    },
  ]

  return (
    <AdminLayout
      title="Payment Providers"
      description="Configure payment methods for your store"
      actions={
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      }
    >
      <Head title="Payment Settings - Admin" />

      <div className="animate-fade-in space-y-6">
        {providers.length === 0 ? (
          <>
            {/* Info Card */}
            <Card className="animate-fade-up">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#e9b96e20' }}>
                    <Shield className="h-5 w-5" style={{ color: '#d4872e' }} />
                  </div>
                  <div>
                    <CardTitle className="font-display text-base">Secure Payment Processing</CardTitle>
                    <CardDescription>
                      All payment providers use industry-standard encryption and PCI-compliant processing
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Available Providers */}
            <div className="animate-fade-up delay-100">
              <h3 className="font-display mb-4 text-sm">Available Payment Providers</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableProviders.map((provider, index) => (
                  <Card key={provider.name} className={`card-hover animate-fade-up delay-${(index + 2) * 100} relative`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#e9b96e20' }}>
                          <provider.icon className="h-5 w-5" style={{ color: '#d4872e' }} />
                        </div>
                        {provider.badge && (
                          <Badge className="bg-accent text-accent-foreground">{provider.badge}</Badge>
                        )}
                      </div>
                      <CardTitle className="font-display mt-3 text-base">{provider.name}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" disabled>
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
              <Card key={provider.id} className={`card-hover animate-fade-up delay-${(index + 1) * 100}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">{provider.name}</CardTitle>
                    <Badge variant={provider.isEnabled ? 'default' : 'secondary'}>
                      {provider.isEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{provider.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
