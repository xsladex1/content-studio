import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const t = await prisma.promptTemplate.findUnique({
    where: { id: params.id },
    include: { nicho: { select: { id: true, nome: true, icone: true } } },
  })
  if (!t) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
  return NextResponse.json(t)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const t = await prisma.promptTemplate.update({
    where: { id: params.id },
    data: {
      titulo:     body.titulo?.trim()    ?? undefined,
      tipo:       body.tipo?.trim()      ?? undefined,
      plataforma: body.plataforma?.trim() || null,
      nichoId:    body.nichoId           || null,
      conteudo:   body.conteudo?.trim()  ?? undefined,
      ativo:      body.ativo             ?? undefined,
    },
  })
  return NextResponse.json(t)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.promptTemplate.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
