'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Send,
  Users,
  History,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/disparos', label: 'Disparos', icon: Send },
  { href: '/grupos', label: 'Grupos', icon: Users },
  { href: '/historico', label: 'Histórico', icon: History },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-shrink-0">
      <div className="flex h-full flex-col" style={{ background: '#1e3a5f' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4b53bc]">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Disparos</p>
            <p className="text-blue-300 text-xs">Teams</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#4b53bc] text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}

          {/* Admin link */}
          {session?.user?.role === 'ADMIN' && (
            <>
              <div className="pt-2 pb-1">
                <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider">Admin</p>
              </div>
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  pathname.startsWith('/admin')
                    ? 'bg-[#4b53bc] text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                )}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Painel Admin
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-xs text-blue-400">v0.1.0</p>
        </div>
      </div>
    </aside>
  )
}
