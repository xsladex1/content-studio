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

  // Only update fields that are explicitly present in the body
  const data: Record<string, unknown> = {}
  if (body.tituloInterno !== undefined) data.tituloInterno = body.tituloInterno
  if (body.status       !== undefined) data.status        = body.status
  if (body.hook         !== undefined) data.hook          = body.hook
  if (body.roteiro      !== undefined) data.roteiro       = body.roteiro
  if (body.legenda      !== undefined) data.legenda       = body.legenda
  if (body.hashtags     !== undefined) data.hashtags      = body.hashtags
  if (body.imagemUrl    !== undefined) data.imagemUrl     = body.imagemUrl
  if (body.audioUrl     !== undefined) data.audioUrl      = body.audioUrl
  if (body.videoUrl     !== undefined) data.videoUrl      = body.videoUrl
  if (body.thumbnailUrl !== undefined) data.thumbnailUrl  = body.thumbnailUrl
  if (body.observacoes  !== undefined) data.observacoes   = body.observacoes

  const conteudo = await prisma.conteudo.update({
    where: { id: params.id },
    data,
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
