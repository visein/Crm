'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Dashboard&apos;a yönlendiriliyorsunuz...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Turkish CRM
          </CardTitle>
          <CardDescription>
            Sanal Ofis Yönetim Sistemi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Sisteme giriş yapmak için aşağıdaki butona tıklayın
          </div>
          <Button 
            className="w-full" 
            onClick={() => signIn('admin@example.com', 'password123')}
          >
            Demo Girişi (Admin)
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => signIn('sales@example.com', 'password123')}
            >
              Satış
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => signIn('finance@example.com', 'password123')}
            >
              Finans
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => signIn('operations@example.com', 'password123')}
            >
              Operasyon
            </Button>
          </div>
          <div className="text-xs text-center text-gray-500">
            Demo sisteminde otomatik giriş yapılacaktır
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
