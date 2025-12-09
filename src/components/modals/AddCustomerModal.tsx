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
import { useCreateCustomer } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { Plus, Save, X } from 'lucide-react'
import type { MusteriInsert } from '@/types/database'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const [formData, setFormData] = useState<Partial<MusteriInsert>>({
    ad_soyad: '',
    telefon: '',
    email: '',
    sirket_adi: '',
    sektor: '',
    kaynak: 'Web',
    notlar: ''
  })

  const createCustomer = useCreateCustomer()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.ad_soyad) {
      toast.warning('Ad soyad alanı zorunludur')
      return
    }

    try {
      await createCustomer.mutateAsync({
        ad_soyad: formData.ad_soyad,
        telefon: formData.telefon || null,
        email: formData.email || null,
        sirket_adi: formData.sirket_adi || null,
        sektor: formData.sektor || null,
        kaynak: formData.kaynak || 'Web',
        notlar: formData.notlar || null,
        dogum_tarihi: null,
        whatsapp_raw_id: null
      })
      
      // Reset form
      setFormData({
        ad_soyad: '',
        telefon: '',
        email: '',
        sirket_adi: '',
        sektor: '',
        kaynak: 'Web',
        notlar: ''
      })
      
      toast.success('Müşteri başarıyla eklendi!')
      onClose()
    } catch (error) {
      handleAsyncError(error, 'AddCustomer-Submit')
      toast.error('Müşteri eklenirken hata oluştu')
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      ad_soyad: '',
      telefon: '',
      email: '',
      sirket_adi: '',
      sektor: '',
      kaynak: 'Web',
      notlar: ''
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Müşteri Ekle
          </DialogTitle>
          <DialogDescription>
            Yeni müşteri bilgilerini girin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ad_soyad">Ad Soyad *</Label>
              <Input
                id="ad_soyad"
                value={formData.ad_soyad || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ad_soyad: e.target.value }))}
                placeholder="Müşteri adı soyadı"
                required
              />
            </div>
            <div>
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                value={formData.telefon || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                placeholder="90xxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="musteri@email.com"
              />
            </div>
            <div>
              <Label htmlFor="sirket_adi">Şirket Adı</Label>
              <Input
                id="sirket_adi"
                value={formData.sirket_adi || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sirket_adi: e.target.value }))}
                placeholder="Şirket adı"
              />
            </div>
            <div>
              <Label htmlFor="sektor">Sektör</Label>
              <Input
                id="sektor"
                value={formData.sektor || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sektor: e.target.value }))}
                placeholder="Örn: Teknoloji, Danışmanlık"
              />
            </div>
            <div>
              <Label htmlFor="kaynak">Kaynak</Label>
              <Select 
                value={formData.kaynak} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, kaynak: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kaynak seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web">Web Sitesi</SelectItem>
                  <SelectItem value="Phone">Telefon</SelectItem>
                  <SelectItem value="Referral">Referans</SelectItem>
                  <SelectItem value="Social Media">Sosyal Medya</SelectItem>
                  <SelectItem value="Walk-in">Direkt Ziyaret</SelectItem>
                  <SelectItem value="Other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notlar">Notlar</Label>
            <Textarea
              id="notlar"
              value={formData.notlar || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notlar: e.target.value }))}
              placeholder="Müşteri hakkında notlar..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-1" />
              İptal
            </Button>
            <Button type="submit" disabled={createCustomer.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {createCustomer.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}