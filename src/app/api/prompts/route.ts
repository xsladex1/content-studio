import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nichoId   = searchParams.get('nichoId')
  const tipo      = searchParams.get('tipo')
  const plataforma = searchParams.get('plataforma')
  const todos     = searchParams.get('todos') === 'true'

  const templates = await prisma.promptTemplate.findMany({
    where: {
      ...(todos ? {} : { ativo: true }),
      ...(nichoId    ? { nichoId }    : {}),
      ...(tipo       ? { tipo }       : {}),
      ...(plataforma ? { OR: [{ plataforma }, { plataforma: null }] } : {}),
    },
    orderBy: [{ tipo: 'asc' }, { plataforma: 'asc' }, { titulo: 'asc' }],
    include: { nicho: { select: { id: true, nome: true, icone: true } } },
  })

  return NextResponse.json(templates)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.titulo?.trim() || !body.tipo?.trim() || !body.conteudo?.trim()) {
    return NextResponse.json({ error: 'titulo, tipo e conteudo são obrigatórios' }, { status: 400 })
  }

  const template = await prisma.promptTemplate.create({
    data: {
      titulo:     body.titulo.trim(),
      tipo:       body.tipo.trim(),
      plataforma: body.plataforma?.trim() || null,
      nichoId:    body.nichoId || null,
      conteudo:   body.conteudo.trim(),
      ativo:      body.ativo ?? true,
    },
    include: { nicho: { select: { nome: true } } },
  })

  return NextResponse.json(template, { status: 201 })
}
