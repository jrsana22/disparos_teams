'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, X, Check, Users } from 'lucide-react'
import type { EvolutionGroup } from '@/types'
import { cn } from '@/lib/utils'

interface GroupSelectorProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function GroupSelector({ selected, onChange }: GroupSelectorProps) {
  const [groups, setGroups] = useState<EvolutionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/grupos')
      .then((r) => r.json())
      .then((data) => {
        setGroups(Array.isArray(data) ? data : [])
      })
      .catch(() => setError('Erro ao carregar grupos'))
      .finally(() => setLoading(false))
  }, [])

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const filtered = groups.filter((g) =>
    g.subject?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedGroups = groups.filter((g) => selected.includes(g.id))

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {selectedGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedGroups.map((g) => (
            <Badge
              key={g.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {g.subject}
              <button
                type="button"
                onClick={() => toggle(g.id)}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-slate-400"
        onClick={() => setOpen((v) => !v)}
      >
        <Users className="h-4 w-4 mr-2" />
        {selected.length > 0
          ? `${selected.length} grupo${selected.length > 1 ? 's' : ''} selecionado${selected.length > 1 ? 's' : ''}`
          : 'Selecionar grupos...'}
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar grupo..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : error ? (
              <p className="p-3 text-sm text-red-400">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="p-3 text-sm text-slate-400">Nenhum grupo encontrado</p>
            ) : (
              filtered.map((group) => {
                const isSelected = selected.includes(group.id)
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-800 transition-colors',
                      isSelected && 'bg-slate-800'
                    )}
                    onClick={() => toggle(group.id)}
                  >
                    <div className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border shrink-0',
                      isSelected ? 'bg-[#4b53bc] border-[#4b53bc]' : 'border-slate-600'
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="flex-1 truncate text-white">{group.subject}</span>
                    <span className="text-xs text-slate-500">{group.size}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
