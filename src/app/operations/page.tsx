'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCustomersWithOperations, useUpsertOperationDetails } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import {
  Search,
  Settings,
  Wifi,
  Key,
  Package,
  FileText,
  Plus,
  Check,
  X,
  Building,
  User,
  Edit,
  Save,
  Smartphone
} from 'lucide-react'
import type { Musteri, OperasyonDetayInsert, MusteriWithOperations } from '@/types/database'
import { AppLayout } from '@/components/layout/AppLayout'

interface OperationFormData {
  wifi_adi: string
  wifi_sifresi: string
  kapi_sifresi: string
  kargo_tercihi: string
  ozel_notlar: string
}

export default function OperationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Musteri | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<OperationFormData>({
    wifi_adi: '',
    wifi_sifresi: '',
    kapi_sifresi: '',
    kargo_tercihi: 'Güvenliğe bırak',
    ozel_notlar: ''
  })
  
  const { data: customers, isLoading, error } = useCustomersWithOperations()
  const upsertOperationsMutation = useUpsertOperationDetails()

  // Filter customers
  const filteredCustomers = customers?.filter((customer: Musteri) => {
    if (!searchQuery) return true
    return (
      customer.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.sirket_adi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.telefon?.includes(searchQuery)
    )
  }) || []

  // Get customers with/without operation details
  const customersWithOperations = filteredCustomers.filter(customer => 
    customer.operasyon_detaylari && customer.operasyon_detaylari.length > 0
  )
  const customersWithoutOperations = filteredCustomers.filter(customer => 
    !customer.operasyon_detaylari || customer.operasyon_detaylari.length === 0
  )

  const handleEdit = (customer: MusteriWithOperations) => {
    setSelectedCustomer(customer)
    
    // Load existing data if available
    const existingData = customer.operasyon_detaylari?.[0]
    if (existingData) {
      setFormData({
        wifi_adi: existingData.wifi_adi || '',
        wifi_sifresi: existingData.wifi_sifresi || '',
        kapi_sifresi: existingData.kapi_sifresi || '',
        kargo_tercihi: existingData.kargo_tercihi || 'Güvenliğe bırak',
        ozel_notlar: existingData.ozel_notlar || ''
      })
    } else {
      setFormData({
        wifi_adi: '',
        wifi_sifresi: '',
        kapi_sifresi: '',
        kargo_tercihi: 'Güvenliğe bırak',
        ozel_notlar: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!selectedCustomer) return

    try {
      const operationData: OperasyonDetayInsert = {
        musteri_id: selectedCustomer.id,
        ...formData
      }

      await upsertOperationsMutation.mutateAsync(operationData)
      setIsModalOpen(false)
      setSelectedCustomer(null)
      toast.success('Operasyon detayları kaydedildi!')
    } catch (error) {
      handleAsyncError(error, 'Operations-SaveDetails')
      toast.error('Operasyon detayları kaydedilemedi!')
    }
  }

  const getCargoIcon = (preference: string) => {
    switch (preference) {
      case 'Güvenliğe bırak':
        return <Building className="h-4 w-4" />
      case 'Beni ara':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Operasyon verilerini yüklerken hata oluştu.</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Operasyon Detayları</h1>
          <p className="text-gray-600 mt-1">
            Müşteri başına WiFi, kapı kodu ve kargo ayarları
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-600" />
            {customersWithOperations.length} Yapılandırıldı
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <X className="h-3 w-3 text-orange-600" />
            {customersWithoutOperations.length} Bekliyor
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Müşteri adı, şirket veya telefon ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <User className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Toplam</p>
              <p className="text-lg md:text-2xl font-bold">{filteredCustomers.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <Check className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Hazır</p>
              <p className="text-lg md:text-2xl font-bold">{customersWithOperations.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <Settings className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Bekliyor</p>
              <p className="text-lg md:text-2xl font-bold">{customersWithoutOperations.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <Package className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Tamamlanma</p>
              <p className="text-lg md:text-2xl font-bold">
                {filteredCustomers.length > 0 ? Math.round((customersWithOperations.length / filteredCustomers.length) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Customers needing setup */}
          {customersWithoutOperations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Settings className="h-5 w-5" />
                  Kurulum Bekleyen Müşteriler
                </CardTitle>
                <CardDescription>
                  Bu müşteriler için operasyon detayları henüz girilmemiş
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {customersWithoutOperations.map((customer: MusteriWithOperations) => (
                    <div 
                      key={customer.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        <div>
                          <div className="font-medium text-gray-900">{customer.ad_soyad}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {customer.sirket_adi && (
                              <>
                                <Building className="h-3 w-3" />
                                {customer.sirket_adi}
                              </>
                            )}
                            {customer.telefon && (
                              <span className="ml-2">{customer.telefon}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleEdit(customer)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Kurulum Yap
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configured customers */}
          {customersWithOperations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  Yapılandırılmış Müşteriler
                </CardTitle>
                <CardDescription>
                  Bu müşteriler için operasyon detayları mevcut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {customersWithOperations.map((customer: MusteriWithOperations) => {
                    const ops = customer.operasyon_detaylari?.[0]
                    if (!ops) return null

                    return (
                      <div 
                        key={customer.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <div>
                              <div className="font-medium text-gray-900">{customer.ad_soyad}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {customer.sirket_adi && (
                                  <>
                                    <Building className="h-3 w-3" />
                                    {customer.sirket_adi}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(customer)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Düzenle
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          {ops.wifi_adi && (
                            <div className="flex items-center gap-2">
                              <Wifi className="h-4 w-4 text-blue-600" />
                              <span className="text-gray-600">WiFi:</span>
                              <span className="font-medium">{ops.wifi_adi}</span>
                            </div>
                          )}
                          
                          {ops.kapi_sifresi && (
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4 text-yellow-600" />
                              <span className="text-gray-600">Kapı:</span>
                              <span className="font-mono">{'*'.repeat(ops.kapi_sifresi.length)}</span>
                            </div>
                          )}
                          
                          {ops.kargo_tercihi && (
                            <div className="flex items-center gap-2">
                              {getCargoIcon(ops.kargo_tercihi)}
                              <span className="text-gray-600">Kargo:</span>
                              <span className="font-medium">{ops.kargo_tercihi}</span>
                            </div>
                          )}
                          
                          {ops.ozel_notlar && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-600">Not:</span>
                              <span className="font-medium truncate" title={ops.ozel_notlar}>
                                {ops.ozel_notlar}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Operasyon Detayları
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer?.ad_soyad} için operasyon bilgilerini düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wifi_adi" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  WiFi Adı
                </Label>
                <Input
                  id="wifi_adi"
                  value={formData.wifi_adi}
                  onChange={(e) => setFormData(prev => ({ ...prev, wifi_adi: e.target.value }))}
                  placeholder="Ağ adı"
                />
              </div>
              
              <div>
                <Label htmlFor="wifi_sifresi" className="flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  WiFi Şifresi
                </Label>
                <Input
                  id="wifi_sifresi"
                  type="password"
                  value={formData.wifi_sifresi}
                  onChange={(e) => setFormData(prev => ({ ...prev, wifi_sifresi: e.target.value }))}
                  placeholder="WiFi şifresi"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="kapi_sifresi" className="flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  Kapı Şifresi
                </Label>
                <Input
                  id="kapi_sifresi"
                  value={formData.kapi_sifresi}
                  onChange={(e) => setFormData(prev => ({ ...prev, kapi_sifresi: e.target.value }))}
                  placeholder="Kapı kodu"
                />
              </div>
              
              <div>
                <Label htmlFor="kargo_tercihi" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Kargo Tercihi
                </Label>
                <Select 
                  value={formData.kargo_tercihi} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, kargo_tercihi: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Güvenliğe bırak">Güvenliğe bırak</SelectItem>
                    <SelectItem value="Beni ara">Beni ara</SelectItem>
                    <SelectItem value="Ofise getir">Ofise getir</SelectItem>
                    <SelectItem value="Reddedilsin">Reddedilsin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ozel_notlar" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Özel Notlar
              </Label>
              <Textarea
                id="ozel_notlar"
                value={formData.ozel_notlar}
                onChange={(e) => setFormData(prev => ({ ...prev, ozel_notlar: e.target.value }))}
                placeholder="Ek bilgiler ve özel talimatlar..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={upsertOperationsMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {upsertOperationsMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  )
}