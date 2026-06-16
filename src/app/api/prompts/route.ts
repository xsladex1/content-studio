import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nichoId = searchParams.get('nichoId')
  const tipo = searchParams.get('tipo')
  const plataforma = searchParams.get('plataforma')

  const templates = await prisma.promptTemplate.findMany({
    where: {
      ativo: true,
      ...(nichoId ? { nichoId } : {}),
      ...(tipo ? { tipo } : {}),
      // plataforma=universal retorna só os sem plataforma definida
      // plataforma=tiktok retorna os do tiktok + os universais
      ...(plataforma
        ? { OR: [{ plataforma }, { plataforma: null }] }
        : {}),
    },
    orderBy: [{ tipo: 'asc' }, { plataforma: 'asc' }, { titulo: 'asc' }],
    include: {
      nicho: { select: { id: true, nome: true, icone: true } },
    },
  })

  return NextResponse.json(templates)
}
