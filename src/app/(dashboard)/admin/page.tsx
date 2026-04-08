import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Users, Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'ADMIN') redirect('/dashboard')

  const [userCount, campaignCount, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.user.count({ where: { active: true } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão da plataforma</p>
        </div>
        <Button asChild className="bg-[#4b53bc] hover:bg-[#4b53bc]/90">
          <Link href="/admin/usuarios">Gerenciar Usuários</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-400/10 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{userCount}</p>
              <p className="text-slate-400 text-sm">Usuários totais</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-400/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{activeUsers}</p>
              <p className="text-slate-400 text-sm">Usuários ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-400/10 rounded-lg">
              <Send className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{campaignCount}</p>
              <p className="text-slate-400 text-sm">Campanhas totais</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
