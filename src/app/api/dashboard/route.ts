import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [
    totalProjetos,
    totalConteudos,
    emRascunho,
    aguardandoRevisao,
    aprovados,
    // Conteúdos publicados por plataforma
    publicadosTikTok,
    publicadosInstagram,
    publicadosYoutube,
    publicadosShopee,
    publicadosML,
    // Agendados (têm data futura)
    agendados,
    // Projetos ativos por tipo
    projetosAfiliado,
  ] = await Promise.all([
    prisma.projeto.count({ where: { status: 'ativo' } }),
    prisma.conteudo.count(),
    prisma.conteudo.count({ where: { status: 'rascunho' } }),
    prisma.conteudo.count({ where: { status: 'revisao' } }),
    prisma.conteudo.count({ where: { status: 'aprovado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'tiktok', status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'instagram', status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'youtube', status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'shopee', status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'mercadolivre', status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({
      where: {
        status: 'agendado',
        agendadoPara: { gte: new Date() },
      },
    }),
    prisma.projeto.count({ where: { tipo: 'afiliado', status: 'ativo' } }),
  ])

  return NextResponse.json({
    totalProjetos,
    totalConteudos,
    pipeline: {
      rascunho: emRascunho,
      revisao: aguardandoRevisao,
      aprovado: aprovados,
    },
    publicados: {
      tiktok: publicadosTikTok,
      instagram: publicadosInstagram,
      youtube: publicadosYoutube,
      shopee: publicadosShopee,
      mercadolivre: publicadosML,
    },
    agendados,
    projetosAfiliado,
  })
}
