import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NovaCampanhaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/disparos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Disparo</h1>
          <p className="text-slate-400 text-sm">Configure e agende seu disparo</p>
        </div>
      </div>
      <CampaignForm />
    </div>
  )
}
