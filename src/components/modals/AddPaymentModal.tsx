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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers, useContracts, useCreatePayment } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { Plus, Save, X, Search } from 'lucide-react'
import type { OdemeInsert, Musteri } from '@/types/database'

interface AddPaymentModalProps {
  isOpen: boolean
  onClose: () => void
}


export function AddPaymentModal({ isOpen, onClose }: AddPaymentModalProps) {
  const [formData, setFormData] = useState<Partial<OdemeInsert>>({
    musteri_id: undefined,
    sozlesme_id: undefined,
    tutar: 0,
    vade_tarihi: '',
    durum: 'Ödenmedi',
    aciklama: '',
    hatirlatma_3gun_gitti: false,
    hatirlatma_bugun_gitti: false,
    hatirlatma_7gun_gitti: false
  })
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Musteri | null>(null)

  const { data: customers } = useCustomers()
  const { data: contracts } = useContracts()
  const createPayment = useCreatePayment()

  // Filter customers for selection
  const filteredCustomers = customers?.filter((customer: Musteri) =>
    customer.ad_soyad?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.sirket_adi?.toLowerCase().includes(customerSearch.toLowerCase())
  ) || []

  // Filter contracts for selected customer
  const customerContracts = contracts?.filter((contract) =>
    contract.musteri_id === selectedCustomer?.id && contract.aktif_mi
  ) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.musteri_id) {
      toast.warning('Müşteri seçimi zorunludur')
      return
    }

    if (!formData.tutar || formData.tutar <= 0) {
      toast.warning('Geçerli bir tutar girmelisiniz')
      return
    }

    if (!formData.vade_tarihi) {
      toast.warning('Vade tarihi zorunludur')
      return
    }

    if (!formData.aciklama) {
      toast.warning('Açıklama zorunludur')
      return
    }

    try {
      await createPayment.mutateAsync({
        musteri_id: formData.musteri_id,
        sozlesme_id: formData.sozlesme_id || null,
        tutar: formData.tutar,
        vade_tarihi: formData.vade_tarihi,
        durum: formData.durum || 'Ödenmedi',
        aciklama: formData.aciklama,
        hatirlatma_3gun_gitti: false,
        hatirlatma_bugun_gitti: false,
        hatirlatma_7gun_gitti: false
      })
      
      // Reset form
      setFormData({
        musteri_id: undefined,
        sozlesme_id: undefined,
        tutar: 0,
        vade_tarihi: '',
        durum: 'Ödenmedi',
        aciklama: '',
        hatirlatma_3gun_gitti: false,
        hatirlatma_bugun_gitti: false,
        hatirlatma_7gun_gitti: false
      })
      setCustomerSearch('')
      setSelectedCustomer(null)
      
      toast.success('Ödeme başarıyla eklendi!')
      onClose()
    } catch (error) {
      handleAsyncError(error, 'AddPayment-Submit')
      toast.error('Ödeme eklenirken hata oluştu')
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      musteri_id: undefined,
      sozlesme_id: undefined,
      tutar: 0,
      vade_tarihi: '',
      durum: 'Ödenmedi',
      aciklama: '',
      hatirlatma_3gun_gitti: false,
      hatirlatma_bugun_gitti: false,
      hatirlatma_7gun_gitti: false
    })
    setCustomerSearch('')
    setSelectedCustomer(null)
    onClose()
  }

  const handleCustomerSelect = (customer: Musteri) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({ ...prev, musteri_id: customer.id, sozlesme_id: undefined }))
    setCustomerSearch(`${customer.ad_soyad || 'İsimsiz Müşteri'}${customer.sirket_adi ? ` (${customer.sirket_adi})` : ''}`)
  }

  const handleContractSelect = (contractId: string) => {
    if (contractId === 'none') {
      setFormData(prev => ({
        ...prev,
        sozlesme_id: undefined,
        tutar: 0,
        aciklama: ''
      }))
    } else {
      const contract = customerContracts.find(c => c.id.toString() === contractId)
      if (contract) {
        setFormData(prev => ({
          ...prev,
          sozlesme_id: contract.id,
          tutar: contract.sozlesme_bedeli || 0,
          aciklama: `${contract.hizmet_tipi} - ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} dönemi`
        }))
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Ödeme Ekle
          </DialogTitle>
          <DialogDescription>
            Yeni ödeme bilgilerini girin
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
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      if (!e.target.value) {
                        setSelectedCustomer(null)
                        setFormData(prev => ({ ...prev, musteri_id: undefined, sozlesme_id: undefined }))
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                
                {customerSearch && !selectedCustomer && (
                  <div className="max-h-32 overflow-y-auto border rounded-md">
                    {filteredCustomers.slice(0, 5).map((customer: Musteri) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => handleCustomerSelect(customer)}
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

            {/* Contract Selection (Optional) */}
            {selectedCustomer && customerContracts.length > 0 && (
              <div className="col-span-2">
                <Label htmlFor="sozlesme_id">Sözleşme (İsteğe Bağlı)</Label>
                <Select 
                  value={formData.sozlesme_id?.toString() || ''} 
                  onValueChange={handleContractSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sözleşme seçin (otomatik tutar ve açıklama)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sözleşme Seçilmedi</SelectItem>
                    {customerContracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.hizmet_tipi} - {contract.sozlesme_bedeli ? `${contract.sozlesme_bedeli} TL` : 'Tutar Belirtilmemiş'} ({contract.odeme_periyodu})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount */}
            <div>
              <Label htmlFor="tutar">Tutar (TL) *</Label>
              <Input
                id="tutar"
                type="number"
                step="0.01"
                min="0"
                value={formData.tutar || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tutar: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="vade_tarihi">Vade Tarihi *</Label>
              <Input
                id="vade_tarihi"
                type="date"
                value={formData.vade_tarihi || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, vade_tarihi: e.target.value }))}
                required
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="durum">Durum</Label>
              <Select 
                value={formData.durum || 'Ödenmedi'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, durum: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ödenmedi">Ödenmedi</SelectItem>
                  <SelectItem value="Ödendi">Ödendi</SelectItem>
                  <SelectItem value="Kısmi">Kısmi</SelectItem>
                  <SelectItem value="Gecikmiş">Gecikmiş</SelectItem>
                  <SelectItem value="İptal">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="aciklama">Açıklama *</Label>
              <Textarea
                id="aciklama"
                value={formData.aciklama || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                placeholder="Örn: Ocak 2025 Sanal Ofis ücreti"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-1" />
              İptal
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {createPayment.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}