import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEvolutionAPIForUser } from '@/lib/evolution'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const api = await getEvolutionAPIForUser(session.user.id)
  if (!api) {
    return NextResponse.json({ error: 'Instância não configurada.' }, { status: 400 })
  }

  try {
    const groups = await api.fetchAllGroups()
    return NextResponse.json(groups)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar grupos' },
      { status: 500 }
    )
  }
}
