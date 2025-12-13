'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HizmetTipi } from '@/types/database'
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
import { SatisDurumu, MailDurumu } from '@/types/database'

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
      satis_durumu: SatisDurumu.YENI_LEAD,
      mail_1_durumu: MailDurumu.BEKLIYOR,
      mail_2_durumu: MailDurumu.BEKLIYOR
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
                      <SelectItem value={HizmetTipi.SANAL_OFIS}>{HizmetTipi.SANAL_OFIS}</SelectItem>
                      <SelectItem value={HizmetTipi.HAZIR_OFIS}>{HizmetTipi.HAZIR_OFIS}</SelectItem>
                      <SelectItem value={HizmetTipi.COWORKING}>{HizmetTipi.COWORKING}</SelectItem>
                      <SelectItem value={HizmetTipi.TOPLANTI}>{HizmetTipi.TOPLANTI}</SelectItem>
                      <SelectItem value={HizmetTipi.ETKINLIK}>{HizmetTipi.ETKINLIK}</SelectItem>
                      <SelectItem value={HizmetTipi.DIGER}>{HizmetTipi.DIGER}</SelectItem>
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
                      <SelectItem value={SatisDurumu.YENI_LEAD}>{SatisDurumu.YENI_LEAD}</SelectItem>
                      <SelectItem value={SatisDurumu.GORUSULUYOR}>{SatisDurumu.GORUSULUYOR}</SelectItem>
                      <SelectItem value={SatisDurumu.TEKLIF_ATILDI}>{SatisDurumu.TEKLIF_ATILDI}</SelectItem>
                      <SelectItem value={SatisDurumu.KAZANILDI}>{SatisDurumu.KAZANILDI}</SelectItem>
                      <SelectItem value={SatisDurumu.KAYBEDILDI}>{SatisDurumu.KAYBEDILDI}</SelectItem>
                      <SelectItem value={SatisDurumu.CEVAP_YOK}>{SatisDurumu.CEVAP_YOK}</SelectItem>
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
                      <SelectItem value={MailDurumu.BEKLIYOR}>{MailDurumu.BEKLIYOR}</SelectItem>
                      <SelectItem value={MailDurumu.GONDERILMEDI}>{MailDurumu.GONDERILMEDI}</SelectItem>
                      <SelectItem value={MailDurumu.GONDERILDI}>{MailDurumu.GONDERILDI}</SelectItem>
                      <SelectItem value={MailDurumu.ACILDI}>{MailDurumu.ACILDI}</SelectItem>
                      <SelectItem value={MailDurumu.CEVAPLANDI}>{MailDurumu.CEVAPLANDI}</SelectItem>
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
                      <SelectItem value={MailDurumu.BEKLIYOR}>{MailDurumu.BEKLIYOR}</SelectItem>
                      <SelectItem value={MailDurumu.GONDERILMEDI}>{MailDurumu.GONDERILMEDI}</SelectItem>
                      <SelectItem value={MailDurumu.GONDERILDI}>{MailDurumu.GONDERILDI}</SelectItem>
                      <SelectItem value={MailDurumu.ACILDI}>{MailDurumu.ACILDI}</SelectItem>
                      <SelectItem value={MailDurumu.CEVAPLANDI}>{MailDurumu.CEVAPLANDI}</SelectItem>
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