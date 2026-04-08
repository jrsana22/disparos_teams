'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, getTypeLabel } from '@/lib/utils'
import { Calendar, Users } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  groups: string
  scheduledAt: string
  type: string
  status: string
}

interface NextScheduledProps {
  campaigns: Campaign[]
}

export function NextScheduled({ campaigns }: NextScheduledProps) {
  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white">Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">Nenhum disparo agendado</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              let groupCount = 0
              try { groupCount = JSON.parse(c.groups).length } catch {}
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(c.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="h-3 w-3" />
                        {groupCount} grupo{groupCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{getTypeLabel(c.type)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
