'use client'

import { useState } from 'react'
import { Search, User, ChevronDown, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TEXTS } from '@/constants/translations'
import type { UserRole } from '@/types/app'

interface HeaderProps {
  userName: string
  userRole: UserRole
  onSignOut: () => void
  onRoleSwitch: (role: UserRole) => void
  onSearch?: (query: string) => void
  className?: string
}

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800',
  sales: 'bg-blue-100 text-blue-800',
  finance: 'bg-green-100 text-green-800',
  operations: 'bg-yellow-100 text-yellow-800',
}

export function Header({
  userName,
  userRole,
  onSignOut,
  onRoleSwitch,
  onSearch,
  className
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  return (
    <header className={cn("flex items-center justify-between px-6 py-3 bg-background border-b", className)}>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Müşteri, telefon, şirket ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </form>
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 h-10">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{userName}</span>
                <Badge className={cn("text-xs", roleColors[userRole])}>
                  {TEXTS.roles[userRole]}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {TEXTS.roles[userRole]}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Demo Role Switch */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <User className="mr-2 h-4 w-4" />
                <span>Demo: Rol Değiştir</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem 
                  onClick={() => onRoleSwitch('admin')}
                  disabled={userRole === 'admin'}
                >
                  <span className="mr-2">👑</span>
                  {TEXTS.roles.admin}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRoleSwitch('sales')}
                  disabled={userRole === 'sales'}
                >
                  <span className="mr-2">🎯</span>
                  {TEXTS.roles.sales}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRoleSwitch('finance')}
                  disabled={userRole === 'finance'}
                >
                  <span className="mr-2">💰</span>
                  {TEXTS.roles.finance}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRoleSwitch('operations')}
                  disabled={userRole === 'operations'}
                >
                  <span className="mr-2">🔧</span>
                  {TEXTS.roles.operations}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}