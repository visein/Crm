'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { createErrorBoundaryHandler } from '@/lib/error-handler'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private handleError = createErrorBoundaryHandler('ErrorBoundary')

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.handleError(error, errorInfo)
    
    this.setState({
      hasError: true,
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Bir Hata Oluştu</CardTitle>
          <CardDescription>
            Beklenmeyen bir hata ile karşılaştık. Lütfen sayfayı yenilemeyi deneyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {process.env.NODE_ENV === 'development' && error && (
            <div className="text-left p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800 mb-2">Hata Detayları:</p>
              <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-x-auto">
                {error.message}
              </pre>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={resetError} 
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'} 
              className="flex-1 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Ana Sayfa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export the class component wrapped in a function for easier usage
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  )
}

// Hook to trigger error boundary in components
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}

export default ErrorBoundary