import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarCampanhaPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })

  if (!campaign) notFound()

  const canEdit = !['SENT', 'CANCELLED'].includes(campaign.status)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/disparos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Disparo</h1>
          <p className="text-slate-400 text-sm">{campaign.name}</p>
        </div>
      </div>
      {canEdit ? (
        <CampaignForm
          defaultValues={{
            ...campaign,
            scheduledAt: campaign.scheduledAt.toISOString(),
          }}
          campaignId={campaign.id}
        />
      ) : (
        <p className="text-slate-400">Este disparo não pode ser editado (status: {campaign.status}).</p>
      )}
    </div>
  )
}
