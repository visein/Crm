'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Shield, Users, Trash2, UserPlus } from 'lucide-react'
import type { UserRole } from '@/types/app'

interface AppUser {
  id: string
  email: string
  raw_user_meta_data: {
    full_name?: string
    role?: UserRole
  }
  profile?: {
    full_name: string
    role: UserRole
    created_at?: string
    updated_at?: string
  }
  created_at: string
  last_sign_in_at?: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'sales' as UserRole
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users as unknown as AppUser[])
      } else {
        toast.error(data.error || 'Kullanıcılar yüklenemedi')
      }
      
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Kullanıcı listesi yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast.error('Tüm alanları doldurun')
      return
    }

    if (newUser.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }

    setIsAddingUser(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          fullName: newUser.fullName,
          role: newUser.role
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Kullanıcı başarıyla oluşturuldu!')
        setShowAddModal(false)
        setNewUser({
          email: '',
          password: '',
          fullName: '',
          role: 'sales'
        })
        await loadUsers()
      } else {
        toast.error(data.error || 'Kullanıcı oluşturulamadı')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('Kullanıcı oluşturulurken hata oluştu')
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`${email} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Kullanıcı silindi')
        await loadUsers()
      } else {
        toast.error(data.error || 'Kullanıcı silinemedi')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Kullanıcı silinirken hata oluştu')
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      admin: { label: 'Yönetici', variant: 'destructive' as const, icon: Shield },
      sales: { label: 'Satış', variant: 'default' as const, icon: Users },
      finance: { label: 'Finans', variant: 'secondary' as const, icon: Users },
      operations: { label: 'Operasyon', variant: 'outline' as const, icon: Users }
    }
    
    const config = roleConfig[role] || roleConfig.sales
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if current user is admin
  const isAdmin = user?.user_metadata?.role === 'admin'
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>
              Bu sayfaya sadece yöneticiler erişebilir
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600">Sistem kullanıcılarını yönetin</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Yeni Kullanıcı Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
              <DialogDescription>
                Sisteme yeni bir kullanıcı ekleyin
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Kullanıcı Adı Soyadı"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="kullanici@sirket.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="En az 6 karakter"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Departman</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
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
                    <SelectItem value="sales">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Satış
                      </div>
                    </SelectItem>
                    <SelectItem value="finance">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Finans
                      </div>
                    </SelectItem>
                    <SelectItem value="operations">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Operasyon
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isAddingUser} className="flex-1">
                  {isAddingUser ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    'Kullanıcı Oluştur'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kullanıcılar ({users.length})
          </CardTitle>
          <CardDescription>
            Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead>Son Giriş</TableHead>
                  <TableHead className="w-20">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.profile?.full_name || user.raw_user_meta_data?.full_name || 'Bilinmiyor'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {getRoleBadge(user.profile?.role || user.raw_user_meta_data?.role || 'sales')}
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Hiç giriş yapmadı'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}