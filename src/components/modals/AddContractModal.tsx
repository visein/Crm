'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers, useCreateContract } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { Plus, Save, X, Search } from 'lucide-react'
import type { SozlesmeInsert, Musteri } from '@/types/database'

interface AddContractModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddContractModal({ isOpen, onClose }: AddContractModalProps) {
  const [formData, setFormData] = useState<Partial<SozlesmeInsert>>({
    musteri_id: undefined,
    hizmet_tipi: '',
    baslangic_tarihi: '',
    bitis_tarihi: '',
    sozlesme_bedeli: 0,
    odeme_periyodu: 'Aylık',
    aktif_mi: true
  })
  const [customerSearch, setCustomerSearch] = useState('')

  const { data: customers } = useCustomers()
  const createContract = useCreateContract()

  // Filter customers for selection
  const filteredCustomers = customers?.filter((customer: Musteri) =>
    customer.ad_soyad?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.sirket_adi?.toLowerCase().includes(customerSearch.toLowerCase())
  ) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.musteri_id) {
      toast.warning('Müşteri seçimi zorunludur')
      return
    }

    if (!formData.hizmet_tipi) {
      toast.warning('Hizmet türü zorunludur')
      return
    }

    if (!formData.baslangic_tarihi) {
      toast.warning('Başlangıç tarihi zorunludur')
      return
    }

    try {
      await createContract.mutateAsync({
        musteri_id: formData.musteri_id,
        hizmet_tipi: formData.hizmet_tipi,
        baslangic_tarihi: formData.baslangic_tarihi,
        bitis_tarihi: formData.bitis_tarihi || null,
        sozlesme_bedeli: formData.sozlesme_bedeli || null,
        odeme_periyodu: formData.odeme_periyodu || 'Aylık',
        aktif_mi: formData.aktif_mi ?? true
      })
      
      // Reset form
      setFormData({
        musteri_id: undefined,
        hizmet_tipi: '',
        baslangic_tarihi: '',
        bitis_tarihi: '',
        sozlesme_bedeli: 0,
        odeme_periyodu: 'Aylık',
        aktif_mi: true
      })
      setCustomerSearch('')
      
      toast.success('Sözleşme başarıyla eklendi!')
      onClose()
    } catch (error) {
      handleAsyncError(error, 'AddContract-Submit')
      toast.error('Sözleşme eklenirken hata oluştu')
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      musteri_id: undefined,
      hizmet_tipi: '',
      baslangic_tarihi: '',
      bitis_tarihi: '',
      sozlesme_bedeli: 0,
      odeme_periyodu: 'Aylık',
      aktif_mi: true
    })
    setCustomerSearch('')
    onClose()
  }

  // Calculate end date based on period and start date
  const calculateEndDate = (startDate: string, period: string) => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const endDate = new Date(start)
    
    switch (period) {
      case 'Aylık':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case '3 Aylık':
        endDate.setMonth(endDate.getMonth() + 3)
        break
      case '6 Aylık':
        endDate.setMonth(endDate.getMonth() + 6)
        break
      case 'Yıllık':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
      default:
        endDate.setMonth(endDate.getMonth() + 1)
    }
    
    return endDate.toISOString().split('T')[0]
  }

  const handleStartDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      baslangic_tarihi: date,
      bitis_tarihi: calculateEndDate(date, prev.odeme_periyodu || 'Aylık')
    }))
  }

  const handlePeriodChange = (period: string) => {
    setFormData(prev => ({
      ...prev,
      odeme_periyodu: period,
      bitis_tarihi: calculateEndDate(prev.baslangic_tarihi || '', period)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Sözleşme Ekle
          </DialogTitle>
          <DialogDescription>
            Yeni sözleşme bilgilerini girin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="col-span-2">
              <Label htmlFor="customer">Müşteri *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Müşteri ara..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {customerSearch && (
                  <div className="max-h-32 overflow-y-auto border rounded-md">
                    {filteredCustomers.slice(0, 5).map((customer: Musteri) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, musteri_id: customer.id }))
                          setCustomerSearch(`${customer.ad_soyad || 'İsimsiz Müşteri'}${customer.sirket_adi ? ` (${customer.sirket_adi})` : ''}`)
                        }}
                      >
                        <div className="font-medium">{customer.ad_soyad || 'İsimsiz Müşteri'}</div>
                        {customer.sirket_adi && (
                          <div className="text-sm text-gray-600">{customer.sirket_adi}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Service Type */}
            <div>
              <Label htmlFor="hizmet_tipi">Hizmet Türü *</Label>
              <Select 
                value={formData.hizmet_tipi || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, hizmet_tipi: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hizmet türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sanal Ofis">Sanal Ofis</SelectItem>
                  <SelectItem value="Hazır Ofis">Hazır Ofis</SelectItem>
                  <SelectItem value="Coworking">Coworking</SelectItem>
                  <SelectItem value="Toplantı">Toplantı Salonu</SelectItem>
                  <SelectItem value="Etkinlik">Etkinlik</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Period */}
            <div>
              <Label htmlFor="odeme_periyodu">Ödeme Periyodu *</Label>
              <Select 
                value={formData.odeme_periyodu || 'Aylık'}
                onValueChange={handlePeriodChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Periyot seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aylık">Aylık</SelectItem>
                  <SelectItem value="3 Aylık">3 Aylık</SelectItem>
                  <SelectItem value="6 Aylık">6 Aylık</SelectItem>
                  <SelectItem value="Yıllık">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="baslangic_tarihi">Başlangıç Tarihi *</Label>
              <Input
                id="baslangic_tarihi"
                type="date"
                value={formData.baslangic_tarihi || ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <Label htmlFor="bitis_tarihi">Bitiş Tarihi</Label>
              <Input
                id="bitis_tarihi"
                type="date"
                value={formData.bitis_tarihi || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bitis_tarihi: e.target.value }))}
              />
            </div>

            {/* Contract Amount */}
            <div>
              <Label htmlFor="sozlesme_bedeli">Sözleşme Bedeli (TL)</Label>
              <Input
                id="sozlesme_bedeli"
                type="number"
                step="0.01"
                min="0"
                value={formData.sozlesme_bedeli || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sozlesme_bedeli: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            {/* Active Status */}
            <div>
              <Label htmlFor="aktif_mi">Durum</Label>
              <Select 
                value={formData.aktif_mi ? 'true' : 'false'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, aktif_mi: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-1" />
              İptal
            </Button>
            <Button type="submit" disabled={createContract.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {createContract.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}