'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { handleAsyncError } from '@/lib/error-handler'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    handleAsyncError(error, 'Global-ErrorBoundary')
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">Bir Hata Oluştu</CardTitle>
          <CardDescription className="text-base">
            Sistem beklenmeyen bir hata ile karşılaştı. Bu durum geliştiricilerimize otomatik olarak bildirilmiştir.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Geliştirici Bilgileri:</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong className="text-red-800">Hata:</strong>
                  <p className="text-red-700 font-mono text-xs mt-1 p-2 bg-red-100 rounded">
                    {error.message}
                  </p>
                </div>
                {error.digest && (
                  <div className="text-sm">
                    <strong className="text-red-800">Hata ID:</strong>
                    <p className="text-red-700 font-mono text-xs">{error.digest}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User friendly message */}
          <div className="text-center text-gray-600">
            <p className="mb-4">
              Bu sorunu çözmek için aşağıdaki seçenekleri deneyebilirsiniz:
            </p>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-sm">Sayfayı yenileyin</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-sm">Birkaç dakika bekleyin ve tekrar deneyin</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-sm">Ana sayfaya dönerek devam edin</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={reset} 
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'} 
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Ana Sayfa
            </Button>
          </div>

          {/* Support information */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Sorun devam ediyorsa, lütfen sistem yöneticinizle iletişime geçin.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-1">
                Hata Kodu: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}