import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const data: Record<string, unknown> = {}
  if (body.nome !== undefined) data.nome = body.nome

  const user = await prisma.user.update({ where: { id: params.id }, data })
  return NextResponse.json(user)
}
