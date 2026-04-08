import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SendsChart } from '@/components/dashboard/SendsChart'
import { NextScheduled } from '@/components/dashboard/NextScheduled'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { subDays, format, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [scheduled, sent, failed, draft, nextCampaigns, logs] = await Promise.all([
    prisma.campaign.count({ where: { userId, status: 'SCHEDULED' } }),
    prisma.campaign.count({ where: { userId, status: 'SENT' } }),
    prisma.campaign.count({ where: { userId, status: 'FAILED' } }),
    prisma.campaign.count({ where: { userId, status: 'DRAFT' } }),
    prisma.campaign.findMany({
      where: { userId, status: { in: ['SCHEDULED'] } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    }),
    prisma.log.findMany({
      where: {
        campaign: { userId },
        sentAt: { gte: subDays(new Date(), 7) },
      },
      select: { status: true, sentAt: true },
    }),
  ])

  // Build chart data for last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i)
    const start = startOfDay(day)
    const end = endOfDay(day)
    const dayLogs = logs.filter((l) => l.sentAt >= start && l.sentAt <= end)
    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      enviados: dayLogs.filter((l) => l.status === 'sent').length,
      falhas: dayLogs.filter((l) => l.status === 'failed').length,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Visão geral dos seus disparos</p>
        </div>
        <Button asChild className="bg-[#4b53bc] hover:bg-[#4b53bc]/90">
          <Link href="/disparos/novo">
            <Plus className="h-4 w-4" />
            Novo Disparo
          </Link>
        </Button>
      </div>

      <StatsCards
        stats={{ totalScheduled: scheduled, totalSent: sent, totalFailed: failed, totalDraft: draft }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SendsChart data={chartData} />
        </div>
        <div>
          <NextScheduled campaigns={nextCampaigns.map(c => ({ ...c, scheduledAt: c.scheduledAt.toISOString() }))} />
        </div>
      </div>
    </div>
  )
}
