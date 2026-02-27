import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get('campaignId')

  const characters = await prisma.character.findMany({
    where: {
      ownerId: session.userId,
      ...(campaignId ? { campaignId } : {}),
    },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      campaign: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(characters)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { name, systemId, campaignId, isNPC, sheetData } = await req.json()
  if (!name || !systemId) {
    return NextResponse.json({ error: 'Nome e sistema são obrigatórios' }, { status: 400 })
  }

  const character = await prisma.character.create({
    data: {
      name,
      systemId,
      campaignId: campaignId || null,
      isNPC: isNPC || false,
      ownerId: session.userId,
      sheetData: sheetData || {},
    },
    include: {
      system: { select: { id: true, name: true, slug: true } },
    },
  })

  return NextResponse.json(character, { status: 201 })
}
