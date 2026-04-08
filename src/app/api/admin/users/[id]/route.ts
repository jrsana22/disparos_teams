import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      active: body.active !== undefined ? body.active : undefined,
      role: body.role || undefined,
    },
  })

  const { password: _, ...safe } = user
  return NextResponse.json(safe)
}
