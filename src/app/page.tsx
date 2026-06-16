import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getStats() {
  const [
    totalProjetos,
    totalConteudos,
    emRascunho,
    aguardandoRevisao,
    aprovados,
    publicadosTikTok,
    publicadosInstagram,
    publicadosYoutube,
    publicadosShopee,
    publicadosML,
    agendados,
    recentesProjetos,
    recentesConteudos,
  ] = await Promise.all([
    prisma.projeto.count({ where: { status: 'ativo' } }),
    prisma.conteudo.count(),
    prisma.conteudo.count({ where: { status: 'rascunho' } }),
    prisma.conteudo.count({ where: { status: 'revisao' } }),
    prisma.conteudo.count({ where: { status: 'aprovado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'tiktok',       status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'instagram',    status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'youtube',      status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'shopee',       status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({ where: { plataforma: 'mercadolivre', status: 'publicado' } }),
    prisma.publicacaoPlataforma.count({
      where: { status: 'agendado', agendadoPara: { gte: new Date() } },
    }),
    prisma.projeto.findMany({
      where: { status: 'ativo' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { nicho: { select: { nome: true, icone: true } } },
    }),
    prisma.conteudo.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        projeto: { select: { nome: true } },
        publicacoes: { select: { plataforma: true, status: true } },
      },
    }),
  ])

  return {
    totalProjetos, totalConteudos,
    pipeline: { rascunho: emRascunho, revisao: aguardandoRevisao, aprovado: aprovados },
    publicados: {
      tiktok: publicadosTikTok, instagram: publicadosInstagram,
      youtube: publicadosYoutube, shopee: publicadosShopee, mercadolivre: publicadosML,
    },
    agendados,
    recentesProjetos,
    recentesConteudos,
  }
}

const STATUS_CONTEUDO: Record<string, { label: string; cls: string }> = {
  rascunho: { label: 'Rascunho', cls: 'bg-gray-100 text-gray-600' },
  gerando:  { label: 'Gerando',  cls: 'bg-blue-100 text-blue-700' },
  revisao:  { label: 'Revisão',  cls: 'bg-yellow-100 text-yellow-800' },
  aprovado: { label: 'Aprovado', cls: 'bg-green-100 text-green-800' },
  pausado:  { label: 'Pausado',  cls: 'bg-red-100 text-red-700' },
}

const PLATAFORMA_ICON: Record<string, string> = {
  tiktok: '🎵', instagram: '📸', youtube: '📺', shopee: '🛍️', mercadolivre: '🛒',
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Content Studio — visão geral da operação</p>
        </div>
        <div className="flex gap-2">
          <Link href="/projetos/novo" className="btn-primary">+ Novo Projeto</Link>
          <Link href="/conteudos/novo" className="btn-secondary">+ Novo Conteúdo</Link>
        </div>
      </div>

      {/* Pipeline de aprovação */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pipeline de Conteúdo</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Projetos ativos', value: stats.totalProjetos,            icon: '📦', color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/projetos' },
            { label: 'Total conteúdos', value: stats.totalConteudos,           icon: '🎬', color: 'text-gray-600',   bg: 'bg-gray-50',   link: '/conteudos' },
            { label: 'Em rascunho',     value: stats.pipeline.rascunho,        icon: '✏️', color: 'text-gray-600',   bg: 'bg-gray-50',   link: '/conteudos' },
            { label: 'Aguard. revisão', value: stats.pipeline.revisao,         icon: '👁️', color: 'text-yellow-600', bg: 'bg-yellow-50', link: '/aprovacao' },
            { label: 'Aprovados',       value: stats.pipeline.aprovado,        icon: '✅', color: 'text-green-600',  bg: 'bg-green-50',  link: '/aprovacao' },
          ].map((card) => (
            <Link key={card.label} href={card.link} className="card p-4 hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${card.bg} mb-2`}>
                <span className="text-lg">{card.icon}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-tight">{card.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${card.color}`}>{card.value}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Publicações por plataforma */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Publicações por Plataforma</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Agendados',     value: stats.agendados,              icon: '📅', color: 'text-blue-600',   bg: 'bg-blue-50',   link: '/agenda' },
            { label: 'TikTok',        value: stats.publicados.tiktok,       icon: '🎵', color: 'text-pink-600',   bg: 'bg-pink-50',   link: '/conteudos' },
            { label: 'Instagram',     value: stats.publicados.instagram,    icon: '📸', color: 'text-purple-600', bg: 'bg-purple-50', link: '/conteudos' },
            { label: 'YouTube',       value: stats.publicados.youtube,      icon: '📺', color: 'text-red-600',    bg: 'bg-red-50',    link: '/conteudos' },
            { label: 'Shopee',        value: stats.publicados.shopee,       icon: '🛍️', color: 'text-orange-600', bg: 'bg-orange-50', link: '/conteudos' },
            { label: 'Mercado Livre', value: stats.publicados.mercadolivre, icon: '🛒', color: 'text-yellow-600', bg: 'bg-yellow-50', link: '/conteudos' },
          ].map((card) => (
            <Link key={card.label} href={card.link} className="card p-4 hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${card.bg} mb-2`}>
                <span className="text-lg">{card.icon}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-tight">{card.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${card.color}`}>{card.value}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projetos recentes */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Projetos Recentes</h2>
            <Link href="/projetos" className="text-indigo-600 text-sm hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentesProjetos.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                Nenhum projeto ainda.{' '}
                <Link href="/projetos/novo" className="text-indigo-600 hover:underline">Criar projeto</Link>
              </div>
            ) : (
              stats.recentesProjetos.map((p) => (
                <Link key={p.id} href={`/projetos/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                    <p className="text-xs text-gray-400">{p.nicho.icone} {p.nicho.nome}</p>
                  </div>
                  <span className="badge bg-green-100 text-green-700">Ativo</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Conteúdos recentes */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Conteúdos Recentes</h2>
            <Link href="/conteudos" className="text-indigo-600 text-sm hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentesConteudos.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                Nenhum conteúdo ainda.{' '}
                <Link href="/conteudos/novo" className="text-indigo-600 hover:underline">Criar conteúdo</Link>
              </div>
            ) : (
              stats.recentesConteudos.map((c) => {
                const st = STATUS_CONTEUDO[c.status] ?? STATUS_CONTEUDO.rascunho
                return (
                  <Link key={c.id} href={`/conteudos/${c.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.tituloInterno}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">{c.projeto.nome}</p>
                        <div className="flex gap-1">
                          {c.publicacoes.map((pub) => (
                            <span key={pub.plataforma} className="text-xs">
                              {PLATAFORMA_ICON[pub.plataforma] ?? pub.plataforma}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
