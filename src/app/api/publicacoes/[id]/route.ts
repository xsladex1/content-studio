import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const data: Record<string, unknown> = {}
  if (body.status       !== undefined) data.status       = body.status
  if (body.agendadoPara !== undefined) data.agendadoPara = body.agendadoPara ? new Date(body.agendadoPara) : null
  if (body.urlPublicacao!== undefined) data.urlPublicacao= body.urlPublicacao
  if (body.externalId   !== undefined) data.externalId   = body.externalId
  if (body.publicadoEm  !== undefined) data.publicadoEm  = body.publicadoEm ? new Date(body.publicadoEm) : null

  const pub = await prisma.publicacaoPlataforma.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(pub)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.publicacaoPlataforma.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
