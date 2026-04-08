import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEvolutionAPIForUser } from '@/lib/evolution'
import { sleep } from '@/lib/utils'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { campaignId } = await req.json()

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId: session.user.id },
  })
  if (!campaign) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })

  const api = await getEvolutionAPIForUser(session.user.id)
  if (!api) return NextResponse.json({ error: 'Instância não configurada.' }, { status: 400 })

  const groups: string[] = JSON.parse(campaign.groups)
  let success = 0
  let failed = 0

  for (let i = 0; i < groups.length; i++) {
    const groupId = groups[i]
    try {
      await api.sendToGroup(
        groupId,
        campaign.type,
        campaign.content,
        campaign.mediaUrl,
        campaign.mediaCaption
      )
      await prisma.log.create({
        data: { campaignId: campaign.id, groupId, status: 'sent' },
      })
      success++
    } catch (err) {
      await prisma.log.create({
        data: {
          campaignId: campaign.id,
          groupId,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Erro desconhecido',
        },
      })
      failed++
    }

    if (i < groups.length - 1 && campaign.delaySeconds > 0) {
      await sleep(campaign.delaySeconds * 1000)
    }
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: failed === groups.length ? 'FAILED' : 'SENT' },
  })

  return NextResponse.json({ ok: true, success, failed })
}
