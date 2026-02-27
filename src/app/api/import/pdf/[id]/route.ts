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

  const job = await prisma.pdfImportJob.findUnique({ where: { id } })
  if (!job) return NextResponse.json({ error: 'Job não encontrado' }, { status: 404 })

  return NextResponse.json(job)
}
