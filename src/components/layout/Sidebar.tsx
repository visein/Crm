'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Target, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Settings,
  Bot
} from 'lucide-react'
import { TEXTS } from '@/constants/translations'
import { hasPermission } from '@/lib/auth'
import type { UserRole } from '@/types/app'

interface SidebarProps {
  userRole: UserRole
  className?: string
}

const navigationItems = [
  {
    href: '/dashboard',
    label: TEXTS.nav.dashboard,
    icon: BarChart3,
    key: 'dashboard'
  },
  {
    href: '/customers',
    label: TEXTS.nav.customers,
    icon: Users,
    key: 'customers'
  },
  {
    href: '/pipeline',
    label: TEXTS.nav.sales,
    icon: Target,
    key: 'pipeline'
  },
  {
    href: '/contracts',
    label: TEXTS.nav.contracts,
    icon: FileText,
    key: 'contracts'
  },
  {
    href: '/payments',
    label: TEXTS.nav.payments,
    icon: CreditCard,
    key: 'payments'
  },
  {
    href: '/interactions',
    label: TEXTS.nav.interactions,
    icon: MessageSquare,
    key: 'interactions'
  },
  {
    href: '/operations',
    label: TEXTS.nav.operations,
    icon: Settings,
    key: 'operations'
  },
  {
    href: '/automations',
    label: TEXTS.nav.automations,
    icon: Bot,
    key: 'automations'
  },
]

export function Sidebar({ userRole, className }: SidebarProps) {
  const pathname = usePathname()

  // Filter navigation items based on user role
  const allowedItems = navigationItems.filter(item => 
    hasPermission(userRole, item.key)
  )

  return (
    <div className={cn("flex flex-col w-64 bg-card border-r", className)}>
      {/* Logo/Brand */}
      <div className="flex items-center px-6 py-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CRM</span>
          </div>
          <span className="font-semibold text-lg">Turkish CRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {allowedItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer info */}
      <div className="px-4 py-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium">{TEXTS.roles[userRole]}</div>
          <div className="mt-1">v1.0.0</div>
        </div>
      </div>
    </div>
  )
}