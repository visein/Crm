type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

class ToastManager {
  private container: HTMLDivElement | null = null
  private toasts: Map<string, HTMLDivElement> = new Map()

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.className = 'toast-container fixed top-4 right-4 z-50 space-y-2'
      document.body.appendChild(this.container)
    }
  }

  private createToast(message: string, type: ToastType): HTMLDivElement {
    const toast = document.createElement('div')
    const id = Date.now().toString()
    
    const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5'
    const typeClasses = {
      success: 'border-l-4 border-green-400',
      error: 'border-l-4 border-red-400',
      warning: 'border-l-4 border-yellow-400',
      info: 'border-l-4 border-blue-400'
    }
    
    const iconClasses = {
      success: 'text-green-400',
      error: 'text-red-400', 
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    }

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ⓘ'
    }

    toast.className = `${baseClasses} ${typeClasses[type]} transform transition-all duration-300 translate-x-full opacity-0`
    toast.innerHTML = `
      <div class="flex-1 w-0 p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="inline-flex items-center justify-center h-5 w-5 text-sm font-bold ${iconClasses[type]}">${icons[type]}</span>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">${message}</p>
          </div>
        </div>
      </div>
      <div class="flex border-l border-gray-200">
        <button onclick="this.parentElement.parentElement.remove()" class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-600 focus:outline-none">
          ✕
        </button>
      </div>
    `

    this.toasts.set(id, toast)
    return toast
  }

  show(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
    this.ensureContainer()
    
    const toast = this.createToast(message, type)
    this.container?.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0')
      toast.classList.add('translate-x-0', 'opacity-100')
    }, 10)

    // Auto remove
    const duration = options.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast)
      }, duration)
    }
  }

  private remove(toast: HTMLDivElement) {
    toast.classList.add('translate-x-full', 'opacity-0')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }
}

const toastManager = new ToastManager()

export const showToast = (message: string, type: ToastType = 'info', options?: ToastOptions) => {
  toastManager.show(message, type, options)
}

export const toast = {
  success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => showToast(message, 'info', options)
}