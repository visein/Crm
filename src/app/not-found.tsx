import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">404 - Sayfa Bulunamadı</CardTitle>
          <CardDescription className="text-base">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="text-gray-600">
            <p className="mb-4">Bu durum şu nedenlerle olabilir:</p>
            <ul className="text-left space-y-2 max-w-sm mx-auto">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-sm">URL yanlış yazılmış olabilir</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-sm">Sayfa taşınmış veya silinmiş olabilir</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-sm">Bağlantı süresi dolmuş olabilir</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="javascript:history.back()" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Ana Sayfa
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Yardıma ihtiyacınız varsa sistem yöneticinizle iletişime geçebilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}