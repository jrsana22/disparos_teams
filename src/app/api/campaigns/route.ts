import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  groups: z.array(z.string()).min(1),
  scheduledAt: z.string(),
  timezone: z.string().default('America/Sao_Paulo'),
  type: z.enum(['TEXT', 'IMAGE', 'PDF', 'AUDIO', 'MIXED']),
  content: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  mediaCaption: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'SCHEDULED']).default('DRAFT'),
  repeat: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'CUSTOM']).default('ONCE'),
  delaySeconds: z.number().default(0),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: any = { userId: session.user.id }
  if (status) where.status = status

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ])

  return NextResponse.json({ campaigns, total, page, limit })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const campaign = await prisma.campaign.create({
      data: {
        userId: session.user.id,
        name: data.name,
        groups: JSON.stringify(data.groups),
        scheduledAt: new Date(data.scheduledAt),
        timezone: data.timezone,
        type: data.type,
        content: data.content ?? null,
        mediaUrl: data.mediaUrl ?? null,
        mediaCaption: data.mediaCaption ?? null,
        status: data.status,
        repeat: data.repeat,
        delaySeconds: data.delaySeconds,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos.', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
