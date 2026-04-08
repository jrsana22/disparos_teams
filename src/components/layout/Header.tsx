'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

export function Header() {
  const { data: session } = useSession()
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch('/api/instance')
        if (res.ok) {
          const data = await res.json()
          setConnected(data?.connected ?? false)
        } else {
          setConnected(false)
        }
      } catch {
        setConnected(false)
      }
    }
    checkConnection()
    window.addEventListener('focus', checkConnection)
    return () => window.removeEventListener('focus', checkConnection)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f172a]/95 backdrop-blur px-6">
      <div className="flex items-center gap-3">
        {connected === null ? (
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
            Verificando...
          </Badge>
        ) : connected ? (
          <Badge variant="success" className="text-xs flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            Conexão ativa
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            Sem conexão
          </Badge>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4b53bc]">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{session?.user?.name}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-400 focus:text-red-400 cursor-pointer"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
