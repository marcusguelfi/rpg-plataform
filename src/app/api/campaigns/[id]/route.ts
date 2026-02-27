import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.userId },
        { members: { some: { userId: session.userId } } },
      ],
    },
    include: {
      system: true,
      owner: { select: { id: true, username: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, username: true, avatar: true, role: true } } },
      },
      characters: {
        include: { owner: { select: { id: true, username: true } } },
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  return NextResponse.json(campaign)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params

  const campaign = await prisma.campaign.findFirst({
    where: { id, ownerId: session.userId },
  })
  if (!campaign) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const data = await req.json()
  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      coverImage: data.coverImage,
      status: data.status,
    },
  })

  return NextResponse.json(updated)
}
