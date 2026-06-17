import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateText } from '@/lib/ai/text'
import { generateImage } from '@/lib/ai/images'
import { generateAudio } from '@/lib/ai/audio'

// Interpola variáveis {{chave}} do PromptTemplate com dados do projeto
function interpolar(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

// Busca o melhor PromptTemplate para o tipo/plataforma/nicho informados
// Ordem de preferência: específico → fallback por plataforma → fallback por nicho → universal
async function buscarTemplate(tipo: string, plataforma: string | null, nichoId: string | null) {
  const candidatos = await prisma.promptTemplate.findMany({
    where: {
      tipo,
      ativo: true,
      OR: [
        { plataforma, nichoId },
        { plataforma, nichoId: null },
        { plataforma: null, nichoId },
        { plataforma: null, nichoId: null },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  // Prioriza match mais específico
  return (
    candidatos.find((t) => t.plataforma === plataforma && t.nichoId === nichoId) ??
    candidatos.find((t) => t.plataforma === plataforma && t.nichoId === null) ??
    candidatos.find((t) => t.plataforma === null && t.nichoId === nichoId) ??
    candidatos.find((t) => t.plataforma === null && t.nichoId === null) ??
    null
  )
}

export async function POST(request: NextRequest) {
  let jobId: string | null = null
  let conteudoId: string | null = null

  try {
    const body = await request.json()
    const { tipo, plataforma, templateId } = body as {
      conteudoId: string
      tipo: 'texto' | 'imagem' | 'audio'
      plataforma?: string
      templateId?: string
    }
    conteudoId = body.conteudoId as string

    if (!conteudoId || !tipo) {
      return NextResponse.json({ error: 'conteudoId e tipo são obrigatórios' }, { status: 400 })
    }

    // Busca o conteudo com projeto + nicho
    const conteudo = await prisma.conteudo.findUnique({
      where: { id: conteudoId! },
      include: {
        projeto: { include: { nicho: true } },
        publicacoes: { select: { plataforma: true } },
      },
    })

    if (!conteudo) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const { projeto } = conteudo
    const plataformaAlvo = plataforma ?? conteudo.publicacoes[0]?.plataforma ?? null

    // Cria o JobIA com status processando
    const job = await prisma.jobIA.create({
      data: {
        conteudoId,
        tipo,
        status: 'processando',
        iniciadoEm: new Date(),
      },
    })
    jobId = job.id

    // Atualiza status do conteudo para "gerando"
    await prisma.conteudo.update({
      where: { id: conteudoId },
      data: { status: 'gerando' },
    })

    // ── GERAÇÃO DE TEXTO ────────────────────────────────────────────
    if (tipo === 'texto') {
      const template = templateId
        ? await prisma.promptTemplate.findUnique({ where: { id: templateId } })
        : await buscarTemplate('roteiro', plataformaAlvo, projeto.nichoId)

      const vars: Record<string, string> = {
        produto:    projeto.nome,
        nicho:      projeto.nicho.nome,
        preco:      projeto.preco != null ? `R$ ${projeto.preco.toFixed(2)}` : 'não informado',
        beneficio:  projeto.beneficioPrincipal ?? '',
        dor:        projeto.dorQueResolve ?? '',
        publico:    projeto.publicoAlvo ?? '',
        descricao:  projeto.descricao ?? '',
        plataforma: plataformaAlvo ?? 'redes sociais',
        link:       projeto.linkAfiliado ?? projeto.linkProduto ?? '',
      }

      const userPrompt = template
        ? interpolar(template.conteudo, vars)
        : `Crie um roteiro para vídeo curto sobre "${projeto.nome}" no nicho ${projeto.nicho.nome}.
           Plataforma: ${plataformaAlvo ?? 'TikTok/Reels'}.
           ${projeto.beneficioPrincipal ? `Benefício principal: ${projeto.beneficioPrincipal}` : ''}
           ${projeto.publicoAlvo ? `Público-alvo: ${projeto.publicoAlvo}` : ''}`

      const resultado = await generateText(userPrompt)

      await prisma.conteudo.update({
        where: { id: conteudoId },
        data: {
          hook:        resultado.hook,
          roteiro:     resultado.roteiro,
          legenda:     resultado.legenda,
          hashtags:    resultado.hashtags,
          promptUsado: userPrompt.slice(0, 2000),
          modeloIA:    'gpt-4o',
          geradoEm:    new Date(),
          status:      'revisao',
        },
      })

      await prisma.jobIA.update({
        where: { id: jobId },
        data: {
          status:       'concluido',
          modelo:       'gpt-4o',
          promptEnviado: userPrompt.slice(0, 2000),
          resultado:    JSON.stringify(resultado),
          concluidoEm: new Date(),
        },
      })

      return NextResponse.json({ jobId, tipo, resultado })
    }

    // ── GERAÇÃO DE IMAGEM ───────────────────────────────────────────
    if (tipo === 'imagem') {
      const resultado = await generateImage({
        conteudoId,
        hook:             conteudo.hook,
        roteiro:          conteudo.roteiro,
        nomeProjetoNicho: `${projeto.nome} — ${projeto.nicho.nome}`,
        plataforma:       plataformaAlvo ?? 'tiktok',
      })

      await prisma.conteudo.update({
        where: { id: conteudoId },
        data: {
          imagemUrl: resultado.imagemUrl,
          modeloIA:  'dall-e-3',
          geradoEm:  new Date(),
          status:    conteudo.status === 'gerando' ? 'revisao' : conteudo.status,
        },
      })

      await prisma.jobIA.update({
        where: { id: jobId },
        data: {
          status:        'concluido',
          modelo:        'dall-e-3',
          promptEnviado: resultado.promptUsado.slice(0, 2000),
          resultado:     resultado.imagemUrl,
          concluidoEm:   new Date(),
        },
      })

      return NextResponse.json({ jobId, tipo, resultado })
    }

    // ── GERAÇÃO DE ÁUDIO ────────────────────────────────────────────
    if (tipo === 'audio') {
      if (!conteudo.roteiro) {
        await prisma.jobIA.update({
          where: { id: jobId },
          data: { status: 'falhou', erro: 'Roteiro não encontrado. Gere o texto primeiro.', concluidoEm: new Date() },
        })
        await prisma.conteudo.update({ where: { id: conteudoId }, data: { status: conteudo.status === 'gerando' ? 'rascunho' : conteudo.status } })
        return NextResponse.json({ error: 'Gere o texto antes de gerar o áudio.' }, { status: 422 })
      }

      const resultado = await generateAudio({
        conteudoId,
        roteiro: conteudo.roteiro,
      })

      await prisma.conteudo.update({
        where: { id: conteudoId },
        data: {
          audioUrl: resultado.audioUrl,
          modeloIA: 'tts-1',
          geradoEm: new Date(),
          status:   conteudo.status === 'gerando' ? 'revisao' : conteudo.status,
        },
      })

      await prisma.jobIA.update({
        where: { id: jobId },
        data: {
          status:      'concluido',
          modelo:      'tts-1',
          resultado:   resultado.audioUrl,
          concluidoEm: new Date(),
        },
      })

      return NextResponse.json({ jobId, tipo, resultado })
    }

    return NextResponse.json({ error: 'tipo inválido' }, { status: 400 })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'

    await Promise.allSettled([
      // Marca job como falhou
      jobId
        ? prisma.jobIA.update({
            where: { id: jobId },
            data: { status: 'falhou', erro: msg, concluidoEm: new Date() },
          })
        : Promise.resolve(),
      // Restaura status do conteudo para rascunho se ainda estiver em "gerando"
      conteudoId
        ? prisma.conteudo.updateMany({
            where: { id: conteudoId, status: 'gerando' },
            data: { status: 'rascunho' },
          })
        : Promise.resolve(),
    ])

    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
