'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Star, Users, RefreshCw, AlertCircle } from 'lucide-react'
import type { EvolutionGroup } from '@/types'

export default function GruposPage() {
  const [groups, setGroups] = useState<EvolutionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fav-groups')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })

  async function fetchGroups() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/grupos')
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao buscar grupos')
        return
      }
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [])

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('fav-groups', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const filtered = groups
    .filter((g) => g.subject?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aFav = favorites.has(a.id) ? 0 : 1
      const bFav = favorites.has(b.id) ? 0 : 1
      return aFav - bFav
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Grupos</h1>
          <p className="text-slate-400 text-sm mt-1">Grupos disponíveis na sua instância</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGroups} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar grupo..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-red-300 font-medium">Erro ao carregar grupos</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-700">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <p className="text-slate-400 text-sm">{filtered.length} grupo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.length === 0 && !error && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">
                {search ? `Nenhum grupo encontrado para "${search}"` : 'Nenhum grupo encontrado na instância.'}
              </p>
              {!search && (
                <p className="text-slate-500 text-sm mt-1">Verifique se sua instância está conectada em Configurações.</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((group) => (
              <Card
                key={group.id}
                className="bg-slate-900 border-slate-700 hover:border-slate-500 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{group.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Users className="h-3 w-3" />
                          {group.size} membros
                        </span>
                        {favorites.has(group.id) && (
                          <Badge variant="warning" className="text-xs">Favorito</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono truncate">{group.id}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => toggleFavorite(group.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          favorites.has(group.id)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-400'
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
