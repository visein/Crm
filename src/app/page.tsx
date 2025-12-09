'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Shield, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    } else if (!loading && !user) {
      checkSetupStatus()
    }
  }, [user, loading, router])

  const checkSetupStatus = async () => {
    try {
      // Check if there are any users in the system
      const { count, error } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Setup check error:', error)
        setSetupNeeded(true)
      } else {
        setSetupNeeded(count === 0)
      }
    } catch (error) {
      console.error('Setup check error:', error)
      setSetupNeeded(true)
    } finally {
      setCheckingSetup(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email ve şifre alanları gereklidir')
      return
    }

    setIsLoading(true)
    try {
      await signIn(email, password)
      toast.success('Başarıyla giriş yapıldı!')
    } catch {
      toast.error('Giriş başarısız. Email ve şifrenizi kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || checkingSetup) {
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
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          
          {setupNeeded && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">İlk Kurulum</h3>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Sistemde henüz kullanıcı bulunmuyor. İlk admin kullanıcıyı oluşturun.
              </p>
              <Button 
                onClick={() => router.push('/setup')}
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Users className="h-4 w-4 mr-2" />
                İlk Kurulum Yap
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
