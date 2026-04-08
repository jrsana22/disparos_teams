import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { logs: { orderBy: { sentAt: 'desc' }, take: 20 } },
  })

  if (!campaign) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  return NextResponse.json(campaign)
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!campaign) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  if (['SENT', 'CANCELLED'].includes(campaign.status)) {
    return NextResponse.json({ error: 'Não é possível editar este disparo.' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        name: body.name,
        groups: JSON.stringify(body.groups),
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        timezone: body.timezone,
        type: body.type,
        content: body.content ?? null,
        mediaUrl: body.mediaUrl ?? null,
        mediaCaption: body.mediaCaption ?? null,
        status: body.status,
        repeat: body.repeat,
        delaySeconds: body.delaySeconds ?? 0,
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!campaign) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })

  await prisma.campaign.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  })

  return NextResponse.json({ ok: true })
}
