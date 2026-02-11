import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import { Shield, User } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/lib/utils'

interface Props {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    displayName: string
    avatarUrl: string | null
    role: string
    twoFactorEnabled: boolean
    lastLoginAt: string | null
    createdAt: string
  }
}

export default function Profile({ user }: Props) {
  const profileForm = useForm({
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
  })

  const passwordForm = useForm({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: '',
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    profileForm.patch('/admin/profile')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    passwordForm.patch('/admin/profile/password', {
      onSuccess: () => passwordForm.reset(),
    })
  }

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <AdminLayout title="Profile" description="Manage your account settings">
      <Head title="Profile - Admin" />

      <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
        {/* Profile Overview */}
        <Card className="animate-fade-up">
          <CardContent className="flex items-center gap-6 pt-6">
            <Avatar className="h-20 w-20 border-2" style={{ borderColor: '#e5e0db' }}>
              <AvatarFallback className="font-display text-2xl" style={{ backgroundColor: '#e9b96e20', color: '#d4872e' }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-xl text-foreground">{user.displayName}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-accent text-accent-foreground">{user.role}</Badge>
                {user.twoFactorEnabled && (
                  <Badge variant="outline" className="text-green-600">
                    <Shield className="mr-1 h-3 w-3" />
                    2FA Enabled
                  </Badge>
                )}
              </div>
              {user.lastLoginAt && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Last login: {formatDateTime(user.lastLoginAt)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Personal Information</CardTitle>
            <CardDescription>Update your name and display preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileForm.data.firstName}
                    onChange={(e) => profileForm.setData('firstName', e.target.value)}
                    className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  />
                  {profileForm.errors.firstName && (
                    <p className="text-destructive text-sm">{profileForm.errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileForm.data.lastName}
                    onChange={(e) => profileForm.setData('lastName', e.target.value)}
                    className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  />
                  {profileForm.errors.lastName && (
                    <p className="text-destructive text-sm">{profileForm.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-xs uppercase tracking-wider text-muted-foreground">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileForm.data.displayName}
                  onChange={(e) => profileForm.setData('displayName', e.target.value)}
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="h-11"
                />
                <p className="text-muted-foreground text-xs">Email cannot be changed.</p>
              </div>

              <Button type="submit" disabled={profileForm.processing}>
                {profileForm.processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs uppercase tracking-wider text-muted-foreground">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.data.currentPassword}
                  onChange={(e) => passwordForm.setData('currentPassword', e.target.value)}
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs uppercase tracking-wider text-muted-foreground">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.data.newPassword}
                  onChange={(e) => passwordForm.setData('newPassword', e.target.value)}
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPasswordConfirmation" className="text-xs uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                <Input
                  id="newPasswordConfirmation"
                  type="password"
                  value={passwordForm.data.newPasswordConfirmation}
                  onChange={(e) => passwordForm.setData('newPasswordConfirmation', e.target.value)}
                  className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  required
                />
              </div>
              <Button type="submit" disabled={passwordForm.processing}>
                {passwordForm.processing ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <TwoFactorCard twoFactorEnabled={user.twoFactorEnabled} />
      </div>
    </AdminLayout>
  )
}

function TwoFactorCard({ twoFactorEnabled }: { twoFactorEnabled: boolean }) {
  const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null)
  const [confirmCode, setConfirmCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [error, setError] = useState('')

  const handleEnable = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/admin/profile/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
        },
      })
      const data = await response.json()
      if (data.qrCode) {
        setSetupData(data)
      } else {
        setError(data.error || 'Failed to enable 2FA')
      }
    } catch {
      setError('Failed to initialize 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/admin/profile/2fa/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
        },
        body: JSON.stringify({ code: confirmCode }),
      })
      const data = await response.json()
      if (data.success) {
        setSetupData(null)
        setConfirmCode('')
        router.reload()
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = () => {
    router.post('/admin/profile/2fa/disable', { code: disableCode } as any)
  }

  return (
    <Card className="animate-fade-up delay-300">
      <CardHeader>
        <CardTitle className="font-display text-lg">Two-Factor Authentication</CardTitle>
        <CardDescription>Add an extra layer of security to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {twoFactorEnabled && !showDisable ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">2FA is enabled</p>
                <p className="text-muted-foreground text-sm">
                  Your account is protected with two-factor authentication.
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowDisable(true)}>
              Disable
            </Button>
          </div>
        ) : twoFactorEnabled && showDisable ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your authenticator code to disable two-factor authentication.
            </p>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-3">
              <Input
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="h-10 w-40 text-center tracking-widest border-border/60"
              />
              <Button variant="destructive" size="sm" onClick={handleDisable}>
                Confirm Disable
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDisable(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : setupData ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="inline-block rounded-lg border border-border/60 bg-white p-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCode)}`}
                  alt="2FA QR Code"
                  className="h-48 w-48"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Or enter this secret manually:
              </p>
              <code className="block rounded border border-border/60 bg-muted/50 px-3 py-2 text-xs font-mono break-all select-all">
                {setupData.secret}
              </code>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Enter verification code
              </Label>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="flex gap-3">
                <Input
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="h-10 w-40 text-center tracking-widest border-border/60"
                />
                <Button onClick={handleConfirm} disabled={loading || confirmCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
                <Button variant="ghost" onClick={() => setSetupData(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#e9b96e20' }}>
                <Shield className="h-5 w-5" style={{ color: '#d4872e' }} />
              </div>
              <div>
                <p className="text-sm font-medium">2FA is not enabled</p>
                <p className="text-muted-foreground text-sm">
                  Enable two-factor authentication for additional security.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleEnable} disabled={loading}>
              {loading ? 'Setting up...' : 'Enable'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
