'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useUpdateSalesRecord } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { CalendarIcon, Edit, Save, X } from 'lucide-react'
import { editDealSchema, type EditDealFormData } from '@/lib/validation-schemas'
import type { SatisTakip } from '@/types/database'

interface EditDealModalProps {
  deal: SatisTakip | null
  isOpen: boolean
  onClose: () => void
}

function getInitialFormData(deal: SatisTakip | null): EditDealFormData {
  if (deal) {
    return {
      ilgilenilen_hizmet: deal.ilgilenilen_hizmet || '',
      talep_tarihi: deal.talep_tarihi || '',
      satis_durumu: deal.satis_durumu || '',
      mail_1_durumu: deal.mail_1_durumu || '',
      mail_1_tarihi: deal.mail_1_tarihi || '',
      mail_2_durumu: deal.mail_2_durumu || '',
      mail_2_tarihi: deal.mail_2_tarihi || '',
      kazanilma_tarihi: deal.kazanilma_tarihi || ''
    }
  }
  return {
    ilgilenilen_hizmet: '',
    talep_tarihi: '',
    satis_durumu: '',
    mail_1_durumu: '',
    mail_1_tarihi: '',
    mail_2_durumu: '',
    mail_2_tarihi: '',
    kazanilma_tarihi: ''
  }
}

export function EditDealModal({ deal, isOpen, onClose }: EditDealModalProps) {
  const updateSalesRecord = useUpdateSalesRecord()

  const form = useForm<EditDealFormData>({
    resolver: zodResolver(editDealSchema),
    defaultValues: getInitialFormData(deal)
  })

  // Reset form when deal changes
  useEffect(() => {
    if (isOpen && deal) {
      const initialData = getInitialFormData(deal)
      form.reset(initialData)
    }
  }, [isOpen, deal, form])

  // Watch sales status for conditional rendering
  const salesStatus = useWatch({
    control: form.control,
    name: 'satis_durumu'
  })

  const handleSubmit = async (data: EditDealFormData) => {
    if (!deal) return

    try {
      const updates = {
        ilgilenilen_hizmet: data.ilgilenilen_hizmet,
        talep_tarihi: data.talep_tarihi,
        satis_durumu: data.satis_durumu,
        mail_1_durumu: data.mail_1_durumu,
        mail_1_tarihi: data.mail_1_tarihi || null,
        mail_2_durumu: data.mail_2_durumu,
        mail_2_tarihi: data.mail_2_tarihi || null,
        kazanilma_tarihi: data.kazanilma_tarihi || null
      }

      await updateSalesRecord.mutateAsync({
        id: deal.id,
        updates
      })
      
      toast.success('Satış kaydı başarıyla güncellendi!')
      onClose()
    } catch (error) {
      handleAsyncError(error, 'EditDeal-Update')
      toast.error('Satış kaydı güncellenemedi!')
    }
  }

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  if (!deal) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Satış Kaydı Düzenle
          </DialogTitle>
          <DialogDescription>
            Satış takip bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ilgilenilen_hizmet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İlgilenilen Hizmet *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Hizmet seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sanal Ofis">Sanal Ofis</SelectItem>
                      <SelectItem value="Coworking">Coworking</SelectItem>
                      <SelectItem value="Ofis Kiralama">Ofis Kiralama</SelectItem>
                      <SelectItem value="Toplantı Salonu">Toplantı Salonu</SelectItem>
                      <SelectItem value="Call Center">Call Center</SelectItem>
                      <SelectItem value="Posta Kutusu">Posta Kutusu</SelectItem>
                      <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="talep_tarihi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Talep Tarihi</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        className="pl-10"
                        {...field}
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="satis_durumu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Satış Durumu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yeni Lead">Yeni Lead</SelectItem>
                      <SelectItem value="Görüşme Aşamasında">Görüşme Aşamasında</SelectItem>
                      <SelectItem value="Teklif Verildi">Teklif Verildi</SelectItem>
                      <SelectItem value="Müzakere">Müzakere</SelectItem>
                      <SelectItem value="Kazanıldı">Kazanıldı</SelectItem>
                      <SelectItem value="Kaybedildi">Kaybedildi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mail_1_durumu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Mail Durumu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Gönderilmedi">Gönderilmedi</SelectItem>
                        <SelectItem value="Gönderildi">Gönderildi</SelectItem>
                        <SelectItem value="Açıldı">Açıldı</SelectItem>
                        <SelectItem value="Cevaplandı">Cevaplandı</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mail_1_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Mail Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mail_2_durumu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Mail Durumu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Gönderilmedi">Gönderilmedi</SelectItem>
                        <SelectItem value="Gönderildi">Gönderildi</SelectItem>
                        <SelectItem value="Açıldı">Açıldı</SelectItem>
                        <SelectItem value="Cevaplandı">Cevaplandı</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mail_2_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Mail Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {salesStatus === 'Kazanıldı' && (
              <FormField
                control={form.control}
                name="kazanilma_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kazanılma Tarihi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="pl-10"
                          {...field}
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
              <Button type="submit" disabled={updateSalesRecord.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {updateSalesRecord.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}