interface ErrorDetails {
  message: string
  code?: string
  context?: string
}

interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info'
}

class ErrorHandler {
  private isDevelopment = process.env.NODE_ENV === 'development'

  logError(error: Error | string, context?: string, details?: Record<string, unknown>) {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorDetails: ErrorDetails = {
      message: errorMessage,
      context,
      ...(typeof error === 'object' && 'code' in error && { code: error.code as string })
    }

    // In development, still log to console for debugging
    if (this.isDevelopment) {
      console.error(`[${context || 'Error'}]:`, errorMessage, details)
    }

    // In production, you would send to error reporting service
    // like Sentry, LogRocket, or custom logging endpoint
    if (!this.isDevelopment) {
      this.sendToErrorReporting(errorDetails)
    }
  }

  logWarning(message: string, context?: string, details?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.warn(`[${context || 'Warning'}]:`, message, details)
    }
    // Production warning logging would go here
  }

  logInfo(message: string, context?: string, details?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.info(`[${context || 'Info'}]:`, message, details)
    }
    // Production info logging would go here
  }

  private sendToErrorReporting(error: ErrorDetails) {
    // This is where you'd integrate with your error reporting service
    // For now, we'll use a placeholder
    try {
      // Example: Sentry.captureException(error)
      // Example: LogRocket.captureException(error)
      // Example: Custom API call to logging service
    } catch (reportingError) {
      // Fallback to console if error reporting fails
      console.error('Error reporting failed:', reportingError)
      console.error('Original error:', error)
    }
  }

  handleAsyncError = (error: unknown, context: string): void => {
    if (error instanceof Error) {
      this.logError(error, context, {
        stack: error.stack,
        name: error.name
      })
    } else if (typeof error === 'object' && error !== null) {
      // Handle Supabase specific error format
      if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
        const supabaseError = error as {
          message: string
          details?: string
          hint?: string
          code?: string
        }
        
        this.logError(supabaseError.message, context, {
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code,
          errorType: 'Supabase Error'
        })
        return
      }

      // Try to safely serialize the error object
      try {
        // Custom replacer to avoid circular references
        const errorMessage = JSON.stringify(error, (key, value: unknown) => {
          if (value === error) return '[Circular]'
          if (typeof value === 'function') return '[Function]'
          if (typeof value === 'object' && value !== null) {
            // Only include basic properties
            const safeObj: Record<string, string | number | boolean> = {}
            const errorObj = value as Record<string, unknown>
            for (const prop of ['message', 'code', 'details', 'hint', 'status']) {
              if (prop in errorObj && typeof errorObj[prop] !== 'function') {
                const propValue = errorObj[prop]
                if (typeof propValue === 'string' || typeof propValue === 'number' || typeof propValue === 'boolean') {
                  safeObj[prop] = propValue
                }
              }
            }
            return Object.keys(safeObj).length > 0 ? safeObj : '[Object]'
          }
          return value
        }, 2)
        
        this.logError(errorMessage, context)
      } catch {
        // Extract meaningful information without serialization
        const errorObj = error as Record<string, unknown>
        const errorInfo = {
          type: error.constructor?.name || 'Unknown',
          hasMessage: 'message' in error,
          hasCode: 'code' in error,
          hasDetails: 'details' in error,
          keys: Object.keys(error).slice(0, 10) // First 10 keys only
        }
        
        const errorMessage = typeof errorObj.message === 'string' ? errorObj.message : '[No message]'
        this.logError(`Error serialization failed: ${errorMessage}`, context, errorInfo)
      }
    } else {
      this.logError(String(error), context)
    }
  }

  createErrorBoundaryHandler = (componentName: string) => {
    return (error: Error, errorInfo: React.ErrorInfo) => {
      this.logError(error, `ErrorBoundary-${componentName}`, {
        componentStack: errorInfo.componentStack
      })
    }
  }
}

export const errorHandler = new ErrorHandler()

// Helper function for async error handling
export const handleAsyncError = (error: unknown, context: string) => {
  errorHandler.handleAsyncError(error, context)
}

// Helper for React error boundaries
export const createErrorBoundaryHandler = (componentName: string) => {
  return errorHandler.createErrorBoundaryHandler(componentName)
}