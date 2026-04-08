'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { GroupSelector } from './GroupSelector'
import { toast } from '@/hooks/use-toast'
import { Loader2, Upload, Save, Send, Clock } from 'lucide-react'

interface CampaignFormProps {
  defaultValues?: any
  campaignId?: string
}

export function CampaignForm({ defaultValues, campaignId }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: defaultValues?.name || '',
    groups: defaultValues?.groups ? JSON.parse(defaultValues.groups) : [],
    scheduledAt: defaultValues?.scheduledAt
      ? new Date(defaultValues.scheduledAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    timezone: defaultValues?.timezone || 'America/Sao_Paulo',
    type: defaultValues?.type || 'TEXT',
    content: defaultValues?.content || '',
    mediaUrl: defaultValues?.mediaUrl || '',
    mediaCaption: defaultValues?.mediaCaption || '',
    repeat: defaultValues?.repeat || 'ONCE',
    delaySeconds: defaultValues?.delaySeconds || 0,
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm((f) => ({ ...f, mediaUrl: data.url }))
        toast({ title: 'Arquivo enviado!' })
      } else {
        toast({ variant: 'destructive', title: data.error || 'Erro no upload' })
      }
    } finally {
      setUploading(false)
    }
  }

  async function submit(status: 'DRAFT' | 'SCHEDULED') {
    if (!form.name) { toast({ variant: 'destructive', title: 'Informe o nome do disparo.' }); return }
    if (form.groups.length === 0) { toast({ variant: 'destructive', title: 'Selecione ao menos um grupo.' }); return }
    if (form.type !== 'TEXT' && !form.mediaUrl) { toast({ variant: 'destructive', title: 'Envie o arquivo de mídia.' }); return }
    if ((form.type === 'TEXT' || form.type === 'MIXED') && !form.content) { toast({ variant: 'destructive', title: 'Digite o texto da mensagem.' }); return }

    setLoading(true)
    try {
      const payload = { ...form, status }
      const url = campaignId ? `/api/campaigns/${campaignId}` : '/api/campaigns'
      const method = campaignId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast({ title: status === 'DRAFT' ? 'Rascunho salvo!' : 'Disparo agendado!' })
        router.push('/disparos')
      } else {
        const data = await res.json()
        toast({ variant: 'destructive', title: data.error || 'Erro ao salvar.' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function sendNow() {
    if (!campaignId) {
      // Save first then send
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'SCHEDULED' }),
      })
      if (!res.ok) { toast({ variant: 'destructive', title: 'Erro ao criar campanha.' }); return }
      const data = await res.json()
      const sendRes = await fetch('/api/campaigns/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: data.id }),
      })
      const sendData = await sendRes.json()
      toast({ title: `Enviado! ${sendData.success} ok, ${sendData.failed} falhas.` })
      router.push('/disparos')
    } else {
      const sendRes = await fetch('/api/campaigns/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      const sendData = await sendRes.json()
      toast({ title: `Enviado! ${sendData.success} ok, ${sendData.failed} falhas.` })
      router.push('/disparos')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Disparo *</Label>
          <Input
            placeholder="Ex: Newsletter semanal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Fuso Horário</Label>
          <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">America/São_Paulo (BRT)</SelectItem>
              <SelectItem value="America/Fortaleza">America/Fortaleza (BRT)</SelectItem>
              <SelectItem value="America/Manaus">America/Manaus (AMT)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Grupos *</Label>
        <GroupSelector
          selected={form.groups}
          onChange={(groups) => setForm({ ...form, groups })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data e Horário *</Label>
          <Input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Repetição</Label>
          <Select value={form.repeat} onValueChange={(v) => setForm({ ...form, repeat: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONCE">Único</SelectItem>
              <SelectItem value="DAILY">Diário</SelectItem>
              <SelectItem value="WEEKLY">Semanal</SelectItem>
              <SelectItem value="CUSTOM">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Delay entre grupos (segundos)</Label>
        <Input
          type="number"
          min={0}
          max={300}
          value={form.delaySeconds}
          onChange={(e) => setForm({ ...form, delaySeconds: parseInt(e.target.value) || 0 })}
          className="w-40"
        />
        <p className="text-xs text-slate-400">Tempo de espera entre envios para múltiplos grupos</p>
      </div>

      {/* Message type tabs */}
      <div className="space-y-2">
        <Label>Tipo de Conteúdo *</Label>
        <Tabs value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="TEXT">📝 Texto</TabsTrigger>
            <TabsTrigger value="IMAGE">🖼️ Imagem</TabsTrigger>
            <TabsTrigger value="PDF">📄 PDF</TabsTrigger>
            <TabsTrigger value="AUDIO">🎵 Áudio</TabsTrigger>
            <TabsTrigger value="MIXED">📎 Misto</TabsTrigger>
          </TabsList>

          <TabsContent value="TEXT" className="mt-4">
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite sua mensagem... Use *negrito*, _itálico_"
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <p className="text-xs text-slate-400">
                Formatação: *negrito* | _itálico_ | ~tachado~ | ```código```
              </p>
            </div>
          </TabsContent>

          <TabsContent value="IMAGE" className="mt-4 space-y-4">
            <FileUpload
              accept="image/jpeg,image/png,image/webp"
              value={form.mediaUrl}
              uploading={uploading}
              onChange={handleUpload}
              label="Imagem (JPG, PNG, WebP)"
            />
            <div className="space-y-2">
              <Label>Legenda (opcional)</Label>
              <Textarea
                placeholder="Legenda da imagem..."
                rows={2}
                value={form.mediaCaption}
                onChange={(e) => setForm({ ...form, mediaCaption: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="PDF" className="mt-4 space-y-4">
            <FileUpload
              accept="application/pdf"
              value={form.mediaUrl}
              uploading={uploading}
              onChange={handleUpload}
              label="Arquivo PDF"
            />
            <div className="space-y-2">
              <Label>Legenda (opcional)</Label>
              <Textarea
                placeholder="Legenda do PDF..."
                rows={2}
                value={form.mediaCaption}
                onChange={(e) => setForm({ ...form, mediaCaption: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="AUDIO" className="mt-4">
            <FileUpload
              accept="audio/mpeg,audio/ogg,audio/mp4,audio/aac"
              value={form.mediaUrl}
              uploading={uploading}
              onChange={handleUpload}
              label="Áudio (MP3, OGG, AAC) — enviado como nota de voz"
            />
          </TabsContent>

          <TabsContent value="MIXED" className="mt-4 space-y-4">
            <FileUpload
              accept="image/jpeg,image/png,image/webp"
              value={form.mediaUrl}
              uploading={uploading}
              onChange={handleUpload}
              label="Imagem"
            />
            <div className="space-y-2">
              <Label>Texto / Legenda</Label>
              <Textarea
                placeholder="Texto que acompanha a imagem..."
                rows={3}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => submit('DRAFT')}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Rascunho
        </Button>
        <Button
          className="bg-[#4b53bc] hover:bg-[#4b53bc]/90"
          onClick={() => submit('SCHEDULED')}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          Agendar
        </Button>
        <Button
          variant="secondary"
          onClick={sendNow}
          disabled={loading}
        >
          <Send className="h-4 w-4" />
          Enviar Agora
        </Button>
      </div>
    </div>
  )
}

function FileUpload({
  accept,
  value,
  uploading,
  onChange,
  label,
}: {
  accept: string
  value: string
  uploading: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Card className="bg-slate-800 border-slate-600 border-dashed">
        <CardContent className="p-4">
          {value ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm text-green-400 truncate">✓ Arquivo: {value.split('/').pop()}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ target: { files: null } } as any)}
              >
                Trocar
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer py-2">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              ) : (
                <Upload className="h-8 w-8 text-slate-400" />
              )}
              <span className="text-sm text-slate-400">
                {uploading ? 'Enviando...' : 'Clique para selecionar arquivo'}
              </span>
              <input type="file" accept={accept} className="sr-only" onChange={onChange} disabled={uploading} />
            </label>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
