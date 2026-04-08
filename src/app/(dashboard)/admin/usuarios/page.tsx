'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus, Wifi, WifiOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newUserOpen, setNewUserOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setCreating(false)
    if (res.ok) {
      toast({ title: 'Usuário criado!' })
      setNewUserOpen(false)
      setForm({ name: '', email: '', password: '', role: 'USER' })
      load()
    } else {
      const data = await res.json()
      toast({ variant: 'destructive', title: data.error || 'Erro ao criar.' })
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active } : u))
      toast({ title: `Usuário ${active ? 'ativado' : 'desativado'}.` })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} usuário{users.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          className="bg-[#4b53bc] hover:bg-[#4b53bc]/90"
          onClick={() => setNewUserOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Usuário</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Perfil</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Instância</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Campanhas</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Ativo</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.instance ? (
                      <div className="flex items-center gap-2">
                        {user.instance.connected ? (
                          <Wifi className="h-3 w-3 text-green-400" />
                        ) : (
                          <WifiOff className="h-3 w-3 text-slate-400" />
                        )}
                        <span className="text-xs text-slate-400">{user.instance.instanceName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Não configurado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {user._count?.campaigns ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={user.active}
                      onCheckedChange={(checked) => toggleActive(user.id, checked)}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewUserOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#4b53bc] hover:bg-[#4b53bc]/90" disabled={creating}>
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
