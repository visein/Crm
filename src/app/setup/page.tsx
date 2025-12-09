'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Shield, Users, Check } from 'lucide-react'
import type { UserRole } from '@/types/app'

export default function SetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin' as UserRole
  })

  const checkSetupStatus = useCallback(async () => {
    try {
      const { error } = await supabase.auth.getSession()
      if (error) throw error

      // Check if there are any users in the system
      const { count, error: countError } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        // If we can't check users table, continue with setup
        setIsCheckingSetup(false)
        return
      }

      if (count && count > 0) {
        // Users exist, redirect to login
        router.replace('/')
        return
      }

      setIsCheckingSetup(false)
    } catch (error) {
      console.error('Setup check error:', error)
      setIsCheckingSetup(false)
    }
  }, [router])

  // Check if setup is already completed
  useEffect(() => {
    checkSetupStatus()
  }, [checkSetupStatus])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Tüm alanları doldurun')
      return
    }

    if (!validateEmail(formData.email)) {
      toast.error('Lütfen geçerli bir email adresi girin (örn: admin@sirket.com)')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }

    setIsLoading(true)

    try {
      // Create the first admin user (email confirmation might be required)
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      })

      if (error) throw error

      if (data.user) {
        if (data.user.email_confirmed_at) {
          // Email confirmed, sign in automatically
          toast.success('İlk admin kullanıcı başarıyla oluşturuldu!')
          
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          })

          if (signInError) throw signInError

          router.replace('/dashboard')
        } else {
          // Email confirmation needed
          toast.success('Admin kullanıcı oluşturuldu! Email adresinizi kontrol ederek hesabınızı onaylayın.')
          setFormData({
            email: '',
            password: '',
            fullName: '',
            role: 'admin'
          })
        }
      }
    } catch (error) {
      console.error('Setup error:', error)
      const errorMessage = (error as Error).message || 'Bilinmeyen hata'
      
      if (errorMessage.includes('Email address') && errorMessage.includes('invalid')) {
        toast.error(
          `Email adresi "${formData.email}" Supabase tarafından geçersiz kabul ediliyor.\n\n` +
          'Muhtemel çözümler:\n' +
          '• Farklı bir şirket email adresi deneyin\n' +
          '• Supabase admin panelinde email validation ayarlarını kontrol edin\n' +
          '• Test için geçici olarak Gmail kullanın'
        )
      } else if (errorMessage.includes('Password')) {
        toast.error('Şifre gereksinimlerini kontrol edin. En az 6 karakter olmalıdır.')
      } else if (errorMessage.includes('User already registered')) {
        toast.error('Bu email adresi zaten kayıtlı. Farklı bir email deneyin.')
      } else {
        toast.error('Kurulum hatası: ' + errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Kurulum kontrolü yapılıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Turkish CRM Kurulumu</CardTitle>
          <CardDescription>
            Hoş geldiniz! İlk admin kullanıcıyı oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input
                id="fullName"
                placeholder="Admin Kullanıcı"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sirket.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Yönetici (Tam Erişim)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Oluşturuluyor...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Admin Kullanıcı Oluştur
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            {/* Success info */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Kurulum Tamamlandıktan Sonra:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Dashboard&apos;da tüm modüllere erişebilirsiniz</li>
                    <li>Diğer kullanıcıları Admin panelinden ekleyebilirsiniz</li>
                    <li>Roller: Admin, Satış, Finans, Operasyon</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}