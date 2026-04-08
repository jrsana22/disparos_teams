import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  apiUrl: z.string().url(),
  apiKey: z.string().optional(),
  instanceName: z.string().min(1),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  if (!instance) return NextResponse.json(null)

  // Never expose full API key
  return NextResponse.json({
    ...instance,
    apiKey: instance.apiKey.slice(0, 4) + '...' + instance.apiKey.slice(-4),
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.instance.findUnique({ where: { userId: session.user.id } })

    // Require apiKey when creating new instance
    if (!existing && !data.apiKey) {
      return NextResponse.json({ error: 'API Key é obrigatória.' }, { status: 422 })
    }

    const updateData: Record<string, unknown> = {
      apiUrl: data.apiUrl,
      instanceName: data.instanceName,
      connected: false,
    }
    if (data.apiKey) updateData.apiKey = data.apiKey

    const instance = await prisma.instance.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: { userId: session.user.id, apiUrl: data.apiUrl, apiKey: data.apiKey!, instanceName: data.instanceName },
    })

    return NextResponse.json({ ok: true, id: instance.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
