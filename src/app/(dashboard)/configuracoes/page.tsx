'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Loader2, Wifi, WifiOff, Save, TestTube } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [hasExisting, setHasExisting] = useState(false)
  const [form, setForm] = useState({
    apiUrl: '',
    apiKey: '',
    instanceName: '',
  })

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/instance')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setHasExisting(true)
          setForm({
            apiUrl: data.apiUrl || '',
            apiKey: '',
            instanceName: data.instanceName || '',
          })
          setConnected(data.connected)
        }
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast({ title: 'Configurações salvas!', variant: 'default' })
        setHasExisting(true)
        setConnected(false)
        window.dispatchEvent(new Event('focus'))
      } else {
        const data = await res.json()
        toast({ variant: 'destructive', title: data.error || 'Erro ao salvar.' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      const res = await fetch('/api/instance/test', { method: 'POST' })
      const data = await res.json()
      setConnected(data.connected)
      if (data.connected) {
        toast({ title: 'Conexão bem-sucedida!', variant: 'default' })
      } else {
        toast({
          variant: 'destructive',
          title: 'Falha na conexão',
          description: data.error || 'Verifique as credenciais.',
        })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao testar conexão.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 text-sm mt-1">Configure sua instância da Evolution API</p>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Instância Evolution API</CardTitle>
              <CardDescription>Dados de conexão com sua instância</CardDescription>
            </div>
            {connected === null ? null : connected ? (
              <Badge variant="success" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" /> Conectado
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" /> Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">URL da Evolution API</Label>
              <Input
                id="apiUrl"
                placeholder="https://evo.seudominio.com"
                value={form.apiUrl}
                onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key{hasExisting && <span className="text-slate-500 text-xs ml-2">(deixe em branco para manter a atual)</span>}</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={hasExisting ? '••••••••••••••••' : 'Cole sua API Key aqui'}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instanceName">Nome da Instância</Label>
              <Input
                id="instanceName"
                placeholder="minha-instancia"
                value={form.instanceName}
                onChange={(e) => setForm({ ...form, instanceName: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-[#4b53bc] hover:bg-[#4b53bc]/90"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                Testar Conexão
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
