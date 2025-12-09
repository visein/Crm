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
import { Textarea } from '@/components/ui/textarea'
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
import { useCreateCustomer } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { Plus, Save, X } from 'lucide-react'
import { customerSchema, type CustomerFormData } from '@/lib/validation-schemas'
import type { MusteriInsert } from '@/types/database'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const createCustomer = useCreateCustomer()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      ad_soyad: '',
      telefon: '',
      email: '',
      sirket_adi: '',
      sektor: '',
      kaynak: 'Web',
      notlar: ''
    }
  })

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      const submitData: MusteriInsert = {
        ad_soyad: data.ad_soyad,
        telefon: data.telefon || null,
        email: data.email || null,
        sirket_adi: data.sirket_adi || null,
        sektor: data.sektor || null,
        kaynak: data.kaynak || 'Web',
        notlar: data.notlar || null,
        dogum_tarihi: null,
        whatsapp_raw_id: null
      }

      await createCustomer.mutateAsync(submitData)
      
      form.reset()
      toast.success('Müşteri başarıyla eklendi!')
      onClose()
    } catch (error) {
      handleAsyncError(error, 'AddCustomer-Submit')
      toast.error('Müşteri eklenirken hata oluştu')
    }
  }

  const handleClose = () => {
    form.reset()
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ad_soyad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Müşteri adı soyadı"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="05xxxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="musteri@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sirket_adi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şirket Adı</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Şirket adı"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sektor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sektör</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Örn: Teknoloji, Danışmanlık"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kaynak"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kaynak</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kaynak seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Web">Web Sitesi</SelectItem>
                        <SelectItem value="Phone">Telefon</SelectItem>
                        <SelectItem value="Referral">Referans</SelectItem>
                        <SelectItem value="Social Media">Sosyal Medya</SelectItem>
                        <SelectItem value="Walk-in">Direkt Ziyaret</SelectItem>
                        <SelectItem value="Other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notlar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Müşteri hakkında notlar..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  )
}