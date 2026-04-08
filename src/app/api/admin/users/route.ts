export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await prisma.user.findMany({
    include: {
      instance: { select: { apiUrl: true, instanceName: true, connected: true } },
      _count: { select: { campaigns: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  const safe = users.map(({ password: _, ...u }) => u)
  return NextResponse.json(safe)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
  })
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 400 })
    const hashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: { ...data, password: hashed },
    })
    const { password: _, ...safe } = user
    return NextResponse.json(safe, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 422 })
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
