import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EvolutionAPI } from '@/lib/evolution'
import { sleep } from '@/lib/utils'

// This route is called by the cron job
export async function POST(req: Request) {
  // Auth via x-cron-secret header (local) or Authorization: Bearer (Vercel Cron)
  const secret = process.env.CRON_SECRET
  if (secret) {
    const xCron = req.headers.get('x-cron-secret')
    const bearer = req.headers.get('authorization')
    const valid = xCron === secret || bearer === `Bearer ${secret}`
    if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find all due campaigns
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: now },
    },
    include: {
      user: {
        include: { instance: true },
      },
    },
    take: 20, // Process up to 20 per run
  })

  let processed = 0
  let errors = 0

  for (const campaign of campaigns) {
    const instance = campaign.user.instance
    if (!instance) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'FAILED' },
      })
      errors++
      continue
    }

    const api = new EvolutionAPI(instance.apiUrl, instance.apiKey, instance.instanceName)
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

    // Handle repeat
    let nextStatus: 'SENT' | 'FAILED' | 'SCHEDULED' = failed === groups.length ? 'FAILED' : 'SENT'
    let nextScheduledAt: Date | undefined

    if (campaign.repeat === 'DAILY' && nextStatus !== 'FAILED') {
      nextStatus = 'SCHEDULED'
      nextScheduledAt = new Date(campaign.scheduledAt.getTime() + 24 * 60 * 60 * 1000)
    } else if (campaign.repeat === 'WEEKLY' && nextStatus !== 'FAILED') {
      nextStatus = 'SCHEDULED'
      nextScheduledAt = new Date(campaign.scheduledAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    }

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: nextStatus,
        scheduledAt: nextScheduledAt || campaign.scheduledAt,
      },
    })

    processed++
  }

  return NextResponse.json({ processed, errors, timestamp: now.toISOString() })
}
