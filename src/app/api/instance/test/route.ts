import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EvolutionAPI } from '@/lib/evolution'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  if (!instance) {
    return NextResponse.json({ error: 'Nenhuma instância configurada.' }, { status: 400 })
  }

  try {
    const api = new EvolutionAPI(instance.apiUrl, instance.apiKey, instance.instanceName)
    const connected = await api.isConnected()

    await prisma.instance.update({
      where: { id: instance.id },
      data: { connected },
    })

    return NextResponse.json({ connected, state: connected ? 'open' : 'close' })
  } catch (err) {
    await prisma.instance.update({
      where: { id: instance.id },
      data: { connected: false },
    })
    return NextResponse.json({
      connected: false,
      error: err instanceof Error ? err.message : 'Erro de conexão',
    })
  }
}
