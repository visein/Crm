'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role, fullName, signOut } = useAuth()

  if (!user) {
    return null // Let individual pages handle auth redirects
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to customers page with search query
      window.location.href = `/customers?search=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole={role} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          userName={fullName}
          userRole={role}
          onSignOut={signOut}
          onSearch={handleSearch}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}