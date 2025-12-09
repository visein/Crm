'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePayments, useOverduePayments, useUpdatePaymentStatus } from '@/hooks/useData'
import { formatDate, formatCurrency, getDaysUntil } from '@/lib/utils'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { AddPaymentModal } from '@/components/modals/AddPaymentModal'
import {
  Search,
  Plus,
  Filter,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  User,
  Mail
} from 'lucide-react'
import type { Odeme } from '@/types/database'
import { AppLayout } from '@/components/layout/AppLayout'

// Extended type for payments with customer info
type PaymentWithCustomer = Odeme & {
  musteriler?: {
    ad_soyad: string
    sirket_adi?: string | null
  } | null
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const { data: payments, isLoading, error } = usePayments()
  const { data: overduePayments } = useOverduePayments()
  const updatePaymentStatus = useUpdatePaymentStatus()

  // Filter payments
  const filteredPayments = payments?.filter((payment: PaymentWithCustomer) => {
    const matchesSearch = searchQuery === '' || 
      payment.musteriler?.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.musteriler?.sirket_adi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.aciklama?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
      payment.durum === statusFilter ||
      (statusFilter === 'overdue' && payment.durum !== 'Ödendi' && payment.vade_tarihi && getDaysUntil(payment.vade_tarihi) < 0)
    
    return matchesSearch && matchesStatus
  }) || []

  const getPaymentStatusBadge = (payment: PaymentWithCustomer) => {
    const isOverdue = payment.vade_tarihi && getDaysUntil(payment.vade_tarihi) < 0
    
    switch (payment.durum) {
      case 'Ödendi':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Ödendi
        </Badge>
      case 'Kısmi':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Kısmi
        </Badge>
      case 'İptal':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          İptal
        </Badge>
      case 'Gecikmiş':
      case 'Ödenmedi':
        if (isOverdue) {
          return <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Gecikmiş ({Math.abs(getDaysUntil(payment.vade_tarihi!))} gün)
          </Badge>
        }
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {payment.durum}
        </Badge>
      default:
        return <Badge variant="outline">{payment.durum}</Badge>
    }
  }

  const handleStatusUpdate = async (paymentId: number, newStatus: string) => {
    try {
      await updatePaymentStatus.mutateAsync({ id: paymentId, status: newStatus })
      toast.success('Ödeme durumu güncellendi!')
    } catch (error) {
      handleAsyncError(error, 'Payments-UpdateStatus')
      toast.error('Ödeme durumu güncellenirken hata oluştu')
    }
  }

  const handleAddPayment = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  // Calculate stats
  const totalAmount = payments?.reduce((sum, payment) => sum + (payment.tutar || 0), 0) || 0
  const paidAmount = payments?.filter(p => p.durum === 'Ödendi').reduce((sum, payment) => sum + (payment.tutar || 0), 0) || 0
  const unpaidAmount = payments?.filter(p => p.durum !== 'Ödendi').reduce((sum, payment) => sum + (payment.tutar || 0), 0) || 0
  const overdueAmount = overduePayments?.reduce((sum, payment) => sum + (payment.tutar || 0), 0) || 0

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Ödeme verilerini yüklerken hata oluştu.</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ödemeler & Tahsilat</h1>
          <p className="text-gray-600 mt-1">
            Ödemelerinizi takip edin ve tahsilat süreçlerini yönetin
          </p>
        </div>
        <Button onClick={handleAddPayment}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ödeme
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ödenen</p>
              <p className="text-2xl font-bold">{formatCurrency(paidAmount)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ödenmemiş</p>
              <p className="text-2xl font-bold">{formatCurrency(unpaidAmount)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gecikmiş</p>
              <p className="text-2xl font-bold">{formatCurrency(overdueAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for Overdue Payments */}
      {overduePayments && overduePayments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Dikkat: Gecikmiş Ödemeler
            </CardTitle>
            <CardDescription className="text-red-700">
              {overduePayments.length} ödeme vadesi geçmiş. Toplam {formatCurrency(overdueAmount)} tahsil edilmedi.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler ve Arama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Müşteri, şirket veya açıklama ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="Ödendi">Ödendi</SelectItem>
                <SelectItem value="Ödenmedi">Ödenmedi</SelectItem>
                <SelectItem value="Kısmi">Kısmi</SelectItem>
                <SelectItem value="Gecikmiş">Gecikmiş</SelectItem>
                <SelectItem value="İptal">İptal</SelectItem>
                <SelectItem value="overdue">Vadesi Geçmiş</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Listesi</CardTitle>
          <CardDescription>
            {filteredPayments.length} ödeme gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Yükleniyor...</div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Ödeme bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Yeni bir ödeme ekleyerek başlayın.
              </p>
              <Button className="mt-4" onClick={handleAddPayment}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Ödemeyi Ekle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Vade Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Hatırlatmalar</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: PaymentWithCustomer) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{payment.musteriler?.ad_soyad}</span>
                          </div>
                          {payment.musteriler?.sirket_adi && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {payment.musteriler.sirket_adi}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">{payment.aciklama}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          {payment.tutar ? formatCurrency(payment.tutar) : 'Belirtilmemiş'}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {payment.vade_tarihi ? formatDate(payment.vade_tarihi) : 'Belirtilmemiş'}
                          </span>
                        </div>
                        {payment.vade_tarihi && getDaysUntil(payment.vade_tarihi) < 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {Math.abs(getDaysUntil(payment.vade_tarihi))} gün gecikmiş
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {getPaymentStatusBadge(payment)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {payment.hatirlatma_bugun_gitti && (
                            <Badge variant="secondary" className="text-xs w-fit">
                              <Mail className="h-3 w-3 mr-1" />
                              Bugün
                            </Badge>
                          )}
                          {payment.hatirlatma_7gun_gitti && (
                            <Badge variant="secondary" className="text-xs w-fit">
                              <Mail className="h-3 w-3 mr-1" />
                              +7 Gün
                            </Badge>
                          )}
                          {payment.hatirlatma_3gun_gitti && (
                            <Badge variant="secondary" className="text-xs w-fit">
                              <Mail className="h-3 w-3 mr-1" />
                              -3 Gün
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {payment.durum !== 'Ödendi' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(payment.id, 'Ödendi')}
                              disabled={updatePaymentStatus.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Ödendi
                            </Button>
                          )}
                          {payment.durum !== 'İptal' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(payment.id, 'İptal')}
                              disabled={updatePaymentStatus.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              İptal
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
    </div>
    </AppLayout>
  )
}