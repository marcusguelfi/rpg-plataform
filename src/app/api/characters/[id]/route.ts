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

  const character = await prisma.character.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.userId },
        { isPublic: true },
        { campaign: { members: { some: { userId: session.userId, role: 'GM' } } } },
      ],
    },
    include: {
      system: true,
      conditions: true,
      owner: { select: { id: true, username: true } },
    },
  })

  if (!character) return NextResponse.json({ error: 'Personagem não encontrado' }, { status: 404 })
  return NextResponse.json(character)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params

  const character = await prisma.character.findFirst({
    where: { id, ownerId: session.userId },
  })
  if (!character) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const data = await req.json()
  const updated = await prisma.character.update({
    where: { id },
    data: {
      name: data.name,
      portrait: data.portrait,
      sheetData: data.sheetData,
      notes: data.notes,
      isPublic: data.isPublic,
    },
  })

  return NextResponse.json(updated)
}
