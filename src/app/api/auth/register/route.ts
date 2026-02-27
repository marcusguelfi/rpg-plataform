import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password, email } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username e senha são obrigatórios' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: 'Nome de usuário já existe' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { username, email: email || null, passwordHash },
      select: { id: true, username: true, role: true },
    })

    const token = signToken({ userId: user.id, username: user.username, role: user.role })
    const cookie = setSessionCookie(token)

    const res = NextResponse.json({ user }, { status: 201 })
    res.cookies.set(cookie)
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
