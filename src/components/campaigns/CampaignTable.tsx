'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { toast } from '@/hooks/use-toast'
import { formatDate, getTypeLabel } from '@/lib/utils'
import {
  Edit,
  Copy,
  Trash2,
  Send,
  Eye,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Campaign {
  id: string
  name: string
  groups: string
  scheduledAt: string
  type: string
  status: string
  repeat: string
}

interface CampaignTableProps {
  campaigns: Campaign[]
  onRefresh: () => void
}

export function CampaignTable({ campaigns, onRefresh }: CampaignTableProps) {
  const router = useRouter()
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)

  async function handleCancel() {
    if (!cancelId) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/campaigns/${cancelId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Disparo cancelado.' })
        onRefresh()
      } else {
        toast({ variant: 'destructive', title: 'Erro ao cancelar.' })
      }
    } finally {
      setCancelling(false)
      setCancelId(null)
    }
  }

  async function handleSendNow(id: string) {
    setSendingId(id)
    try {
      const res = await fetch('/api/campaigns/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id }),
      })
      const data = await res.json()
      toast({ title: `Enviado! ${data.success} ok, ${data.failed} falhas.` })
      onRefresh()
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao enviar.' })
    } finally {
      setSendingId(null)
    }
  }

  async function handleDuplicate(c: Campaign) {
    const payload = {
      name: `${c.name} (cópia)`,
      groups: JSON.parse(c.groups),
      scheduledAt: new Date(c.scheduledAt).toISOString(),
      type: c.type,
      status: 'DRAFT',
      repeat: c.repeat,
      content: null,
      mediaUrl: null,
      mediaCaption: null,
      delaySeconds: 0,
    }
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast({ title: 'Campanha duplicada como rascunho.' })
      onRefresh()
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Nenhum disparo encontrado.</p>
        <Button asChild className="mt-4 bg-[#4b53bc] hover:bg-[#4b53bc]/90">
          <Link href="/disparos/novo">Criar primeiro disparo</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Nome</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Grupos</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Data/Horário</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Tipo</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              let groupCount = 0
              try { groupCount = JSON.parse(c.groups).length } catch {}
              return (
                <tr
                  key={c.id}
                  className="border-b border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-xs">
                      {groupCount} grupo{groupCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {formatDate(c.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {getTypeLabel(c.type)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!['SENT', 'CANCELLED', 'FAILED'].includes(c.status) && (
                            <DropdownMenuItem asChild>
                              <Link href={`/disparos/${c.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicate(c)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicar
                          </DropdownMenuItem>
                          {['SCHEDULED', 'DRAFT'].includes(c.status) && (
                            <DropdownMenuItem
                              onClick={() => handleSendNow(c.id)}
                              disabled={sendingId === c.id}
                            >
                              <Send className="mr-2 h-4 w-4" /> Enviar Agora
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {!['SENT', 'CANCELLED'].includes(c.status) && (
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() => setCancelId(c.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!cancelId}
        onOpenChange={(v) => !v && setCancelId(null)}
        title="Cancelar disparo?"
        description="O disparo será marcado como cancelado e não poderá ser reagendado."
        confirmLabel="Sim, cancelar"
        onConfirm={handleCancel}
        loading={cancelling}
      />
    </>
  )
}
