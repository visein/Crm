'use client'

import { useState, FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomers, useCreateSalesRecord } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { showToast } from '@/lib/toast'
import type { SatisTakipInsert } from '@/types/database'

interface NewDealFormData {
  musteri_id: number | null
  ilgilenilen_hizmet: string
  satis_durumu: string
  talep_tarihi: string
}

interface NewDealModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const SERVICE_OPTIONS = [
  'Sanal Ofis',
  'Hazır Ofis', 
  'Coworking',
  'Toplantı',
  'Etkinlik'
]

const STATUS_OPTIONS = [
  { value: 'Yeni Lead', label: 'Yeni Lead' },
  { value: 'Görüşülüyor', label: 'Görüşülüyor' },
  { value: 'Teklif Atıldı', label: 'Teklif Atıldı' }
]

export function NewDealModal({ isOpen, onOpenChange }: NewDealModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NewDealFormData>({
    musteri_id: null,
    ilgilenilen_hizmet: '',
    satis_durumu: 'Yeni Lead',
    talep_tarihi: new Date().toISOString().split('T')[0]
  })
  
  const { data: customers, isLoading: customersLoading } = useCustomers()
  const createSalesRecord = useCreateSalesRecord()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.musteri_id) {
      showToast('Müşteri seçmelisiniz', 'error')
      return
    }
    if (!formData.ilgilenilen_hizmet) {
      showToast('Hizmet türü seçmelisiniz', 'error')
      return
    }

    setIsSubmitting(true)
    
    try {
      const dealData: SatisTakipInsert = {
        musteri_id: formData.musteri_id,
        ilgilenilen_hizmet: formData.ilgilenilen_hizmet,
        satis_durumu: formData.satis_durumu,
        talep_tarihi: formData.talep_tarihi
      }

      await createSalesRecord.mutateAsync(dealData)
      
      showToast('Yeni deal başarıyla oluşturuldu!', 'success')
      onOpenChange(false)
      resetForm()
    } catch (error) {
      handleAsyncError(error, 'NewDeal-Create')
      showToast('Deal oluşturulurken hata oluştu: ' +
        (error instanceof Error ? error.message : String(error)), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      musteri_id: null,
      ilgilenilen_hizmet: '',
      satis_durumu: 'Yeni Lead',
      talep_tarihi: new Date().toISOString().split('T')[0]
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Deal Oluştur</DialogTitle>
          <DialogDescription>
            Mevcut bir müşteri için yeni satış takip kaydı oluşturun
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="musteri_id">Müşteri</Label>
            <Select
              value={formData.musteri_id?.toString() || ''}
              onValueChange={(value) => setFormData({...formData, musteri_id: parseInt(value)})}
              disabled={customersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={customersLoading ? "Müşteriler yükleniyor..." : "Müşteri seç"} />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.ad_soyad}</span>
                      {customer.sirket_adi && (
                        <span className="text-sm text-gray-500">{customer.sirket_adi}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="ilgilenilen_hizmet">İlgilenilen Hizmet</Label>
            <Select
              value={formData.ilgilenilen_hizmet}
              onValueChange={(value) => setFormData({...formData, ilgilenilen_hizmet: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hizmet türü seç" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sales Status */}
          <div className="space-y-2">
            <Label htmlFor="satis_durumu">Başlangıç Durumu</Label>
            <Select
              value={formData.satis_durumu}
              onValueChange={(value) => setFormData({...formData, satis_durumu: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seç" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Request Date */}
          <div className="space-y-2">
            <Label htmlFor="talep_tarihi">Talep Tarihi</Label>
            <Input
              type="date"
              value={formData.talep_tarihi}
              onChange={(e) => setFormData({...formData, talep_tarihi: e.target.value})}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'Deal Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}