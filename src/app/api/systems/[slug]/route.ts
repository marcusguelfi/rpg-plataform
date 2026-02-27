import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const system = await prisma.rpgSystem.findUnique({ where: { slug } })
  if (!system) return NextResponse.json({ error: 'Sistema não encontrado' }, { status: 404 })
  return NextResponse.json(system)
}
