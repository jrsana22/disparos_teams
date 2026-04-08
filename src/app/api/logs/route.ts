import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const csv = searchParams.get('csv') === 'true'

  const logs = await prisma.log.findMany({
    where: { campaign: { userId: session.user.id } },
    include: { campaign: { select: { name: true, type: true } } },
    orderBy: { sentAt: 'desc' },
    skip: csv ? 0 : (page - 1) * limit,
    take: csv ? 1000 : limit,
  })

  if (csv) {
    const lines = [
      'ID,Campanha,Tipo,Grupo,Status,Erro,Enviado em',
      ...logs.map((l) =>
        [
          l.id,
          `"${l.campaign.name}"`,
          l.campaign.type,
          l.groupId,
          l.status,
          `"${l.error || ''}"`,
          l.sentAt.toISOString(),
        ].join(',')
      ),
    ]
    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=historico.csv',
      },
    })
  }

  const total = await prisma.log.count({
    where: { campaign: { userId: session.user.id } },
  })

  return NextResponse.json({ logs, total, page, limit })
}
