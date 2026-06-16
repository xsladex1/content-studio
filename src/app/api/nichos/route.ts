import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const nichos = await prisma.nicho.findMany({
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { projetos: true, promptTemplates: true } },
    },
  })
  return NextResponse.json(nichos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.nome?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const nicho = await prisma.nicho.create({
    data: {
      nome: body.nome.trim(),
      descricao: body.descricao?.trim() || null,
      icone: body.icone?.trim() || null,
      ativo: body.ativo ?? true,
    },
  })

  return NextResponse.json(nicho, { status: 201 })
}
