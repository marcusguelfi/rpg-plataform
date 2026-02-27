import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const systems = await prisma.rpgSystem.findMany({
    where: { isPublished: true },
    select: {
      id: true, name: true, slug: true, description: true,
      version: true, coverImage: true, createdAt: true,
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(systems)
}
