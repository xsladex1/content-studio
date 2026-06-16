import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projetoId = searchParams.get('projetoId')
  const status = searchParams.get('status')
  const plataforma = searchParams.get('plataforma')

  const conteudos = await prisma.conteudo.findMany({
    where: {
      ...(projetoId ? { projetoId } : {}),
      ...(status ? { status } : {}),
      // Filtrar por plataforma: só retorna conteúdos que têm publicação nessa plataforma
      ...(plataforma
        ? { publicacoes: { some: { plataforma } } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      projeto: { select: { id: true, nome: true, nicho: { select: { nome: true, icone: true } } } },
      publicacoes: {
        select: { plataforma: true, status: true, agendadoPara: true, publicadoEm: true, metricas: true },
      },
    },
  })

  return NextResponse.json(conteudos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // plataformas: array de strings, ex: ['tiktok', 'instagram']
  const plataformas: string[] = Array.isArray(body.plataformas) ? body.plataformas : []

  const conteudo = await prisma.conteudo.create({
    data: {
      projetoId: body.projetoId,
      userId: body.userId ?? null,
      tituloInterno: body.tituloInterno,
      status: body.status ?? 'rascunho',
      hook: body.hook ?? null,
      roteiro: body.roteiro ?? null,
      legenda: body.legenda ?? null,
      hashtags: body.hashtags ?? null,
      observacoes: body.observacoes ?? null,
      // Cria as publicações por plataforma já na criação do conteúdo
      publicacoes: plataformas.length > 0
        ? {
            create: plataformas.map((p) => ({
              plataforma: p,
              status: 'pendente',
            })),
          }
        : undefined,
    },
    include: {
      projeto: { select: { id: true, nome: true } },
      publicacoes: { select: { plataforma: true, status: true } },
    },
  })

  return NextResponse.json(conteudo, { status: 201 })
}
