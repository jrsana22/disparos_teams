'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Clock, AlertCircle, FileText } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalScheduled: number
    totalSent: number
    totalFailed: number
    totalDraft: number
  } | null
  loading?: boolean
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Agendados',
      value: stats?.totalScheduled ?? 0,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Enviados',
      value: stats?.totalSent ?? 0,
      icon: Send,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      title: 'Falhas',
      value: stats?.totalFailed ?? 0,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
    {
      title: 'Rascunhos',
      value: stats?.totalDraft ?? 0,
      icon: FileText,
      color: 'text-slate-400',
      bg: 'bg-slate-400/10',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
