'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useUpdateContract } from '@/hooks/useData'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import { Calendar, DollarSign, Save, X } from 'lucide-react'
import { editContractSchema, type EditContractFormData } from '@/lib/validation-schemas'
import type { Sozlesme } from '@/types/database'

interface EditContractModalProps {
  isOpen: boolean
  onClose: () => void
  contract: Sozlesme | null
}

function getInitialFormData(contract: Sozlesme | null): EditContractFormData {
  if (contract) {
    return {
      hizmet_tipi: contract.hizmet_tipi || '',
      baslangic_tarihi: contract.baslangic_tarihi || '',
      bitis_tarihi: contract.bitis_tarihi || '',
      sozlesme_bedeli: contract.sozlesme_bedeli?.toString() || '',
      odeme_periyodu: contract.odeme_periyodu || 'Aylık',
      aktif_mi: contract.aktif_mi
    }
  }
  return {
    hizmet_tipi: '',
    baslangic_tarihi: '',
    bitis_tarihi: '',
    sozlesme_bedeli: '',
    odeme_periyodu: 'Aylık',
    aktif_mi: true
  }
}

export function EditContractModal({ isOpen, onClose, contract }: EditContractModalProps) {
  const updateContract = useUpdateContract()

  const form = useForm<EditContractFormData>({
    resolver: zodResolver(editContractSchema),
    defaultValues: getInitialFormData(contract)
  })

  // Reset form when contract changes
  useEffect(() => {
    if (isOpen && contract) {
      form.reset(getInitialFormData(contract))
    }
  }, [isOpen, contract, form])

  const handleSubmit = async (data: EditContractFormData) => {
    if (!contract) return

    try {
      const updates = {
        hizmet_tipi: data.hizmet_tipi.trim(),
        baslangic_tarihi: data.baslangic_tarihi || null,
        bitis_tarihi: data.bitis_tarihi || null,
        sozlesme_bedeli: data.sozlesme_bedeli ? parseFloat(data.sozlesme_bedeli) : null,
        odeme_periyodu: data.odeme_periyodu,
        aktif_mi: data.aktif_mi
      }

      await updateContract.mutateAsync({ id: contract.id, updates })
      toast.success('Sözleşme başarıyla güncellendi!')
      onClose()
    } catch (error) {
      handleAsyncError(error, 'EditContract-Submit')
      toast.error('Sözleşme güncellenirken hata oluştu')
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sözleşme Düzenle
          </DialogTitle>
          <DialogDescription>
            Sözleşme bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hizmet_tipi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hizmet Türü *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Hizmet türü seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sanal Ofis">Sanal Ofis</SelectItem>
                      <SelectItem value="Hazır Ofis">Hazır Ofis</SelectItem>
                      <SelectItem value="Coworking">Coworking</SelectItem>
                      <SelectItem value="Toplantı">Toplantı Salonu</SelectItem>
                      <SelectItem value="Etkinlik">Etkinlik</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="baslangic_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç Tarihi</FormLabel>
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
              <FormField
                control={form.control}
                name="bitis_tarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitiş Tarihi</FormLabel>
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

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="sozlesme_bedeli"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Sözleşme Bedeli
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odeme_periyodu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ödeme Periyodu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Aylık">Aylık</SelectItem>
                        <SelectItem value="3 Aylık">3 Aylık</SelectItem>
                        <SelectItem value="6 Aylık">6 Aylık</SelectItem>
                        <SelectItem value="Yıllık">Yıllık</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aktif_mi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durum</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'active')}
                    defaultValue={field.value ? 'active' : 'inactive'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
              <Button type="submit" disabled={updateContract.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {updateContract.isPending ? 'Kaydediliyor...' : 'Güncelle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}