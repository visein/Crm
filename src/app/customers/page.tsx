'use client'

import { Suspense } from 'react'
import { CustomersContent } from './components/CustomersContent'
import { AppLayout } from '@/components/layout/AppLayout'

export default function CustomersPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        </div>
      }>
        <CustomersContent />
      </Suspense>
    </AppLayout>
  )
}