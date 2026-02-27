import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { rollDice } from '@/lib/dice'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { expression, label, characterId, campaignId, isSecret } = await req.json()

  try {
    const result = rollDice(expression)
    
    const roll = await prisma.diceRoll.create({
      data: {
        expression,
        results: result as object,
        label: label || null,
        isSecret: isSecret || false,
        userId: session.userId,
        characterId: characterId || null,
        campaignId: campaignId || null,
      },
    })

    return NextResponse.json({ roll, result })
  } catch (err) {
    return NextResponse.json({ error: 'Expressão de dado inválida' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get('campaignId')
  const limit = parseInt(searchParams.get('limit') || '50')

  const rolls = await prisma.diceRoll.findMany({
    where: {
      ...(campaignId ? { campaignId } : { userId: session.userId }),
      OR: [
        { isSecret: false },
        { userId: session.userId },
      ],
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      character: { select: { id: true, name: true } },
    },
    orderBy: { rolledAt: 'desc' },
    take: limit,
  })

  return NextResponse.json(rolls)
}
