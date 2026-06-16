import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const conteudo = await prisma.conteudo.findUnique({
    where: { id: params.id },
    include: {
      projeto: {
        include: { nicho: { select: { id: true, nome: true, icone: true } } },
      },
      publicacoes: { orderBy: { plataforma: 'asc' } },
      jobsIA: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!conteudo) {
    return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
  }

  return NextResponse.json(conteudo)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const conteudo = await prisma.conteudo.update({
    where: { id: params.id },
    data: {
      tituloInterno: body.tituloInterno,
      status: body.status,
      hook: body.hook ?? null,
      roteiro: body.roteiro ?? null,
      legenda: body.legenda ?? null,
      hashtags: body.hashtags ?? null,
      imagemUrl: body.imagemUrl ?? null,
      audioUrl: body.audioUrl ?? null,
      videoUrl: body.videoUrl ?? null,
      thumbnailUrl: body.thumbnailUrl ?? null,
      observacoes: body.observacoes ?? null,
    },
    include: {
      publicacoes: { orderBy: { plataforma: 'asc' } },
    },
  })

  return NextResponse.json(conteudo)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.conteudo.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
