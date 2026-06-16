import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const nicho = await prisma.nicho.findUnique({
    where: { id: params.id },
    include: {
      projetos: { select: { id: true, nome: true, tipo: true, status: true } },
      promptTemplates: { select: { id: true, titulo: true, tipo: true } },
      _count: { select: { projetos: true, promptTemplates: true } },
    },
  })

  if (!nicho) {
    return NextResponse.json({ error: 'Nicho não encontrado' }, { status: 404 })
  }

  return NextResponse.json(nicho)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const nicho = await prisma.nicho.update({
    where: { id: params.id },
    data: {
      nome: body.nome?.trim(),
      descricao: body.descricao?.trim() ?? null,
      icone: body.icone?.trim() ?? null,
      ativo: body.ativo ?? undefined,
    },
  })

  return NextResponse.json(nicho)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const count = await prisma.projeto.count({ where: { nichoId: params.id } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Não é possível excluir: ${count} projeto(s) vinculado(s)` },
      { status: 409 }
    )
  }

  await prisma.nicho.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
