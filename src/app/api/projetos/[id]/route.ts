import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projeto = await prisma.projeto.findUnique({
    where: { id: params.id },
    include: {
      nicho: true,
      conteudos: {
        orderBy: { createdAt: 'desc' },
        include: {
          publicacoes: {
            select: { plataforma: true, status: true, agendadoPara: true, publicadoEm: true },
          },
        },
      },
    },
  })

  if (!projeto) {
    return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
  }

  return NextResponse.json(projeto)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const projeto = await prisma.projeto.update({
    where: { id: params.id },
    data: {
      nichoId: body.nichoId,
      nome: body.nome,
      tipo: body.tipo,
      status: body.status,
      // Campos de afiliado (opcionais)
      linkProduto: body.linkProduto ?? null,
      linkAfiliado: body.linkAfiliado ?? null,
      preco: body.preco != null ? parseFloat(body.preco) : null,
      comissaoEstimada: body.comissaoEstimada != null ? parseFloat(body.comissaoEstimada) : null,
      plataformaOrigem: body.plataformaOrigem ?? null,
      // Campos gerais
      descricao: body.descricao ?? null,
      publicoAlvo: body.publicoAlvo ?? null,
      dorQueResolve: body.dorQueResolve ?? null,
      beneficioPrincipal: body.beneficioPrincipal ?? null,
      observacoes: body.observacoes ?? null,
    },
    include: {
      nicho: { select: { id: true, nome: true, icone: true } },
    },
  })

  return NextResponse.json(projeto)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.projeto.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
