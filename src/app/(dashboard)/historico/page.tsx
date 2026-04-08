'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { Download, RefreshCw } from 'lucide-react'

interface Log {
  id: string
  groupId: string
  groupName: string | null
  status: string
  error: string | null
  sentAt: string
  campaign: { name: string; type: string }
}

export default function HistoricoPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 50

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/logs?page=${page}&limit=${limit}`)
    const data = await res.json()
    setLogs(data.logs || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Histórico</h1>
          <p className="text-slate-400 text-sm mt-1">{total} registro{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/api/logs?csv=true', '_blank')}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Campanha</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Grupo</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Erro</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Enviado em</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{log.campaign.name}</p>
                      <p className="text-xs text-slate-500">{log.campaign.type}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                      {log.groupName || log.groupId}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={log.status === 'sent' ? 'success' : 'destructive'}>
                        {log.status === 'sent' ? 'Enviado' : 'Falha'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-red-400 max-w-xs truncate">
                      {log.error || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {formatDate(log.sentAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="text-sm text-slate-400">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
        </div>
      )}
    </div>
  )
}
