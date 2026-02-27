import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const campaigns = await prisma.campaign.findMany({
    where: {
      OR: [
        { ownerId: session.userId },
        { members: { some: { userId: session.userId } } },
      ],
    },
    include: {
      system: { select: { id: true, name: true, slug: true, coverImage: true } },
      owner: { select: { id: true, username: true, avatar: true } },
      _count: { select: { members: true, characters: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(campaigns)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { name, description, systemId, coverImage } = await req.json()
  if (!name || !systemId) {
    return NextResponse.json({ error: 'Nome e sistema são obrigatórios' }, { status: 400 })
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
      systemId,
      coverImage,
      ownerId: session.userId,
      members: {
        create: { userId: session.userId, role: 'GM' },
      },
    },
    include: {
      system: { select: { id: true, name: true, slug: true } },
    },
  })

  return NextResponse.json(campaign, { status: 201 })
}
