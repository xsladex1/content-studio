import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nichoId = searchParams.get('nichoId')
  const tipo = searchParams.get('tipo')
  const status = searchParams.get('status')

  const projetos = await prisma.projeto.findMany({
    where: {
      ...(nichoId ? { nichoId } : {}),
      ...(tipo ? { tipo } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      nicho: { select: { id: true, nome: true, icone: true } },
      _count: { select: { conteudos: true } },
    },
  })

  return NextResponse.json(projetos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const projeto = await prisma.projeto.create({
    data: {
      nichoId: body.nichoId,
      userId: body.userId ?? null,
      nome: body.nome,
      tipo: body.tipo ?? 'afiliado',
      status: body.status ?? 'ativo',
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

  return NextResponse.json(projeto, { status: 201 })
}
