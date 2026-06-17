import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST() {
  const trintaDiasAtras = new Date()
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

  // Busca todos os conteúdos gerados nos últimos 30 dias
  const recentes = await prisma.conteudo.findMany({
    where: {
      createdAt: { gte: trintaDiasAtras },
      status: { not: 'pausado' },
    },
    include: {
      projeto: { include: { nicho: { select: { nome: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Busca projetos ativos para contexto
  const projetos = await prisma.projeto.findMany({
    where: { status: 'ativo' },
    include: { nicho: { select: { nome: true } } },
    take: 10,
  })

  if (projetos.length === 0) {
    return NextResponse.json({ sugestoes: [] })
  }

  const temasRecentes = recentes
    .map(c => `${c.tituloInterno} (${c.projeto.nicho.nome})`)
    .join(', ')

  const projetosStr = projetos
    .map(p => `${p.nome} [${p.nicho.nome}]`)
    .join(', ')

  const prompt = `Você é um estrategista de conteúdo para redes sociais brasileiras.

Projetos ativos: ${projetosStr}

Temas criados nos últimos 30 dias: ${temasRecentes || 'nenhum ainda'}

Gere 5 sugestões de temas para conteúdo que:
1. NÃO repitam os temas recentes
2. Sejam relevantes para os projetos listados
3. Tenham alto potencial viral no Brasil
4. Sejam específicos (não genéricos)

Responda APENAS com JSON válido neste formato:
[
  { "titulo": "...", "nicho": "...", "justificativa": "...", "plataforma": "tiktok|instagram|youtube" }
]`

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 800,
    temperature: 0.9,
  })

  let sugestoes: unknown[] = []
  try {
    const raw = resp.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)
    sugestoes = Array.isArray(parsed) ? parsed : (parsed.sugestoes ?? [])
  } catch {
    sugestoes = []
  }

  return NextResponse.json({ sugestoes })
}
