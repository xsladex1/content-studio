export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const PLATAFORMA: Record<string, { label: string; icon: string; cls: string }> = {
  tiktok:       { label: 'TikTok',        icon: '🎵', cls: 'bg-pink-50 text-pink-700' },
  instagram:    { label: 'Instagram',     icon: '📸', cls: 'bg-purple-50 text-purple-700' },
  youtube:      { label: 'YouTube',       icon: '📺', cls: 'bg-red-50 text-red-700' },
  shopee:       { label: 'Shopee',        icon: '🛍️', cls: 'bg-orange-50 text-orange-700' },
  mercadolivre: { label: 'Mercado Livre', icon: '🛒', cls: 'bg-yellow-50 text-yellow-700' },
}

export default async function RelatoriosPage() {
  const [publicacoes, projetos] = await Promise.all([
    prisma.publicacaoPlataforma.findMany({
      include: {
        conteudo: {
          select: {
            id: true,
            tituloInterno: true,
            projeto: { select: { id: true, nome: true, nicho: { select: { nome: true } } } },
          },
        },
      },
    }),
    prisma.projeto.findMany({
      include: {
        conteudos: {
          include: {
            publicacoes: { select: { plataforma: true, status: true, metricas: true } },
          },
        },
        nicho: { select: { nome: true, icone: true } },
      },
    }),
  ])

  // Métricas por plataforma
  const plataformasLista = ['tiktok', 'instagram', 'youtube', 'shopee', 'mercadolivre']
  const metricasPorPlataforma = plataformasLista.map((plat) => {
    const pubs = publicacoes.filter((p) => p.plataforma === plat)
    const publicadas = pubs.filter((p) => p.status === 'publicado')

    let totalViews = 0, totalCliques = 0, totalVendas = 0
    for (const pub of publicadas) {
      if (pub.metricas) {
        try {
          const m = JSON.parse(pub.metricas)
          totalViews   += m.views   ?? 0
          totalCliques += m.cliques ?? 0
          totalVendas  += m.vendas  ?? 0
        } catch {}
      }
    }

    return {
      plataforma: plat,
      total: pubs.length,
      publicadas: publicadas.length,
      agendadas: pubs.filter((p) => p.status === 'agendado').length,
      views: totalViews,
      cliques: totalCliques,
      vendas: totalVendas,
    }
  })

  // Top projetos por views
  const projetosMetricas = projetos.map((proj) => {
    let totalViews = 0, totalCliques = 0, totalVendas = 0
    for (const c of proj.conteudos) {
      for (const pub of c.publicacoes) {
        if (pub.metricas) {
          try {
            const m = JSON.parse(pub.metricas)
            totalViews   += m.views   ?? 0
            totalCliques += m.cliques ?? 0
            totalVendas  += m.vendas  ?? 0
          } catch {}
        }
      }
    }
    return {
      id: proj.id, nome: proj.nome,
      nicho: proj.nicho,
      qtdConteudos: proj.conteudos.length,
      totalViews, totalCliques, totalVendas,
    }
  })

  const topViews   = [...projetosMetricas].sort((a, b) => b.totalViews   - a.totalViews).slice(0, 5)
  const topCliques = [...projetosMetricas].sort((a, b) => b.totalCliques - a.totalCliques).slice(0, 5)
  const topVendas  = [...projetosMetricas].sort((a, b) => b.totalVendas  - a.totalVendas)
                       .filter((p) => p.totalVendas > 0).slice(0, 5)

  // Conteúdos publicados mais recentes
  const publicacoesRecentes = publicacoes
    .filter((p) => p.status === 'publicado' && p.publicadoEm)
    .sort((a, b) => new Date(b.publicadoEm!).getTime() - new Date(a.publicadoEm!).getTime())
    .slice(0, 8)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Performance do Content Studio por plataforma</p>
        </div>
      </div>

      {/* Performance por plataforma */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Por Plataforma</p>
        <div className="grid grid-cols-5 gap-3">
          {metricasPorPlataforma.map((m) => {
            const plat = PLATAFORMA[m.plataforma]
            return (
              <div key={m.plataforma} className="card p-4">
                <p className={`text-sm font-semibold mb-3 ${plat.cls} rounded px-2 py-0.5 inline-block`}>
                  {plat.icon} {plat.label}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Publicados</span>
                    <span className="font-medium">{m.publicadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Agendados</span>
                    <span className="font-medium text-blue-600">{m.agendadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Views</span>
                    <span className="font-medium">{m.views.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cliques</span>
                    <span className="font-medium">{m.cliques.toLocaleString('pt-BR')}</span>
                  </div>
                  {m.vendas > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vendas</span>
                      <span className="font-medium text-green-600">{m.vendas}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Top Views */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Projetos — Views</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topViews.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-gray-400">Sem dados ainda</p>
            ) : topViews.map((p, i) => (
              <Link key={p.id} href={`/projetos/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-4">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                    <p className="text-xs text-gray-400">{p.nicho.icone} {p.nicho.nome}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">{p.totalViews.toLocaleString('pt-BR')}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Cliques */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Projetos — Cliques</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topCliques.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-gray-400">Sem dados ainda</p>
            ) : topCliques.map((p, i) => (
              <Link key={p.id} href={`/projetos/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-4">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                    <p className="text-xs text-gray-400">{p.qtdConteudos} conteúdos</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-600">{p.totalCliques.toLocaleString('pt-BR')}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Vendas */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Projetos — Vendas</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topVendas.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-gray-400">Sem vendas registradas</p>
            ) : topVendas.map((p, i) => (
              <Link key={p.id} href={`/projetos/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-4">#{i + 1}</span>
                  <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                </div>
                <span className="text-sm font-bold text-green-600">{p.totalVendas} vendas</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Publicações recentes */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Publicações Recentes</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {publicacoesRecentes.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-gray-400">Nenhuma publicação ainda</p>
          ) : publicacoesRecentes.map((pub) => {
            const plat = PLATAFORMA[pub.plataforma] ?? { label: pub.plataforma, icon: '📢', cls: '' }
            return (
              <Link key={pub.id} href={`/conteudos/${pub.conteudo.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{pub.conteudo.tituloInterno}</p>
                  <p className="text-xs text-gray-400">{pub.conteudo.projeto.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{plat.icon} {plat.label}</p>
                  <p className="text-xs text-gray-400">
                    {pub.publicadoEm ? new Date(pub.publicadoEm).toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
