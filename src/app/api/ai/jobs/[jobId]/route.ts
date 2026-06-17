import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const job = await prisma.jobIA.findUnique({
    where: { id: params.jobId },
    select: {
      id:           true,
      tipo:         true,
      status:       true,
      modelo:       true,
      resultado:    true,
      erro:         true,
      iniciadoEm:   true,
      concluidoEm:  true,
      conteudoId:   true,
    },
  })

  if (!job) {
    return NextResponse.json({ error: 'Job não encontrado' }, { status: 404 })
  }

  return NextResponse.json(job)
}
