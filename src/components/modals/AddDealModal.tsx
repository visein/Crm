'use client'

import { useForm } from 'react-hook-form'
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
import { useCreateSalesRecord } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { CalendarIcon, Plus, X } from 'lucide-react'
import { addDealSchema, type AddDealFormData } from '@/lib/validation-schemas'
import type { SatisTakipInsert } from '@/types/database'

interface AddDealModalProps {
  customerId: number
  isOpen: boolean
  onClose: () => void
}

export function AddDealModal({ customerId, isOpen, onClose }: AddDealModalProps) {
  const createSalesRecord = useCreateSalesRecord()

  const form = useForm<AddDealFormData>({
    resolver: zodResolver(addDealSchema),
    defaultValues: {
      ilgilenilen_hizmet: '',
      talep_tarihi: new Date().toISOString().split('T')[0],
      satis_durumu: 'Görüşme Aşamasında',
      mail_1_durumu: 'Gönderilmedi',
      mail_2_durumu: 'Gönderilmedi'
    }
  })

  const handleSubmit = async (data: AddDealFormData) => {
    try {
      const submitData: SatisTakipInsert = {
        ...data,
        musteri_id: customerId
      }

      await createSalesRecord.mutateAsync(submitData)
      
      toast.success('Satış kaydı başarıyla eklendi!')
      form.reset()
      onClose()
    } catch (error) {
      handleAsyncError(error, 'AddDeal-Create')
      toast.error('Satış kaydı eklenemedi!')
    }
  }

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Satış Kaydı Ekle
          </DialogTitle>
          <DialogDescription>
            Müşteri için yeni satış takip kaydı oluşturun
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
              <Button type="submit" disabled={createSalesRecord.isPending}>
                <Plus className="h-4 w-4 mr-1" />
                {createSalesRecord.isPending ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}