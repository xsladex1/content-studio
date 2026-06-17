import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type PlanoConteudo = {
  tituloInterno: string
  plataformas:   string[]
  observacoes?:  string
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { objetivo, projetoId, quantidade = 3 } = body as {
    objetivo:   string
    projetoId:  string
    quantidade: number
  }

  if (!objetivo || !projetoId) {
    return NextResponse.json({ error: 'objetivo e projetoId são obrigatórios' }, { status: 400 })
  }

  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: { nicho: true },
  })

  if (!projeto) {
    return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
  }

  // Pede ao GPT-4o para planejar N conteúdos baseados no objetivo
  const planPrompt = `Você é HERMES, orquestrador de conteúdo para o projeto "${projeto.nome}" (nicho: ${projeto.nicho.nome}).

Objetivo do dia: "${objetivo}"

Crie um plano de ${quantidade} conteúdo(s) para atingir este objetivo.
Para cada conteúdo, defina um título interno descritivo e as plataformas adequadas.

Responda APENAS com JSON no formato:
{
  "plano": [
    { "tituloInterno": "...", "plataformas": ["tiktok", "instagram"], "observacoes": "..." }
  ]
}`

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: planPrompt }],
    response_format: { type: 'json_object' },
    max_tokens: 600,
  })

  let plano: PlanoConteudo[] = []
  try {
    const parsed = JSON.parse(resp.choices[0]?.message?.content ?? '{}')
    plano = parsed.plano ?? []
  } catch {
    return NextResponse.json({ error: 'Falha ao planejar conteúdos' }, { status: 500 })
  }

  // Cria os Conteudo + PublicacaoPlataforma no banco
  const criados = await Promise.all(
    plano.slice(0, quantidade).map(async (item) => {
      const conteudo = await prisma.conteudo.create({
        data: {
          projetoId,
          tituloInterno: item.tituloInterno,
          observacoes:   item.observacoes,
          status:        'rascunho',
          publicacoes: {
            create: (item.plataformas ?? ['tiktok']).map((plataforma: string) => ({
              plataforma,
              status: 'pendente',
            })),
          },
        },
        include: { publicacoes: true },
      })
      return conteudo
    })
  )

  return NextResponse.json({
    objetivo,
    projeto:  { id: projeto.id, nome: projeto.nome },
    criados:  criados.map(c => ({ id: c.id, titulo: c.tituloInterno })),
    total:    criados.length,
  })
}
