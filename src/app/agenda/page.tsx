export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const PLATAFORMA_ICON: Record<string, string> = {
  tiktok:       '🎵',
  instagram:    '📸',
  youtube:      '📺',
  shopee:       '🛍️',
  mercadolivre: '🛒',
}

const STATUS_PUB: Record<string, { label: string; cls: string }> = {
  pendente:   { label: 'Pendente',   cls: 'bg-gray-100 text-gray-600' },
  agendado:   { label: 'Agendado',   cls: 'bg-blue-100 text-blue-700' },
  publicando: { label: 'Publicando', cls: 'bg-indigo-100 text-indigo-700' },
  publicado:  { label: 'Publicado',  cls: 'bg-green-100 text-green-800' },
  falhou:     { label: 'Falhou',     cls: 'bg-red-100 text-red-700' },
  cancelado:  { label: 'Cancelado',  cls: 'bg-gray-100 text-gray-400' },
}

function formatData(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatHora(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function agruparPorDia(pubs: AgendadoRow[]) {
  const map = new Map<string, AgendadoRow[]>()
  for (const p of pubs) {
    const key = formatData(p.agendadoPara!)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return map
}

type AgendadoRow = Awaited<ReturnType<typeof buscarAgendados>>[number]

async function buscarAgendados() {
  return prisma.publicacaoPlataforma.findMany({
    where: {
      status: { in: ['agendado', 'pendente', 'publicando'] },
      conteudo: { status: 'aprovado' },
    },
    orderBy: [{ agendadoPara: 'asc' }, { plataforma: 'asc' }],
    include: {
      conteudo: {
        select: {
          id: true,
          tituloInterno: true,
          hook: true,
          projeto: {
            select: {
              nome: true,
              nicho: { select: { icone: true, nome: true } },
            },
          },
        },
      },
    },
  })
}

export default async function AgendaPage() {
  const [agendados, totalPublicados] = await Promise.all([
    buscarAgendados(),
    prisma.publicacaoPlataforma.count({ where: { status: 'publicado' } }),
  ])

  const grupos = agruparPorDia(agendados)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda de Publicação</h1>
          <p className="page-subtitle">
            {agendados.length} publicação{agendados.length !== 1 ? 'ões' : ''} pendente{agendados.length !== 1 ? 's' : ''} · {totalPublicados} publicado{totalPublicados !== 1 ? 's' : ''} no total
          </p>
        </div>
        <Link href="/conteudos" className="btn-secondary">Ver conteúdos</Link>
      </div>

      {agendados.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-600 font-medium">Nenhuma publicação agendada</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Aprove conteúdos e agende a publicação para cada plataforma
          </p>
          <Link href="/aprovacao" className="btn-primary">Ver fila de aprovação</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grupos.entries()).map(([dia, pubs]) => (
            <div key={dia}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-base">📅</span> {dia}
                <span className="badge bg-indigo-100 text-indigo-700 normal-case tracking-normal">
                  {pubs.length} publicação{pubs.length !== 1 ? 'ões' : ''}
                </span>
              </h2>
              <div className="space-y-3">
                {pubs.map((pub) => {
                  const st = STATUS_PUB[pub.status] ?? STATUS_PUB.pendente
                  return (
                    <div key={pub.id} className="card p-4 flex items-center gap-4">
                      {/* Hora */}
                      <div className="text-center w-14 flex-shrink-0">
                        {pub.agendadoPara ? (
                          <>
                            <p className="text-lg font-bold text-gray-900 leading-none">
                              {formatHora(pub.agendadoPara)}
                            </p>
                            <p className="text-xs text-gray-400">horário</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">Sem hora</p>
                        )}
                      </div>

                      {/* Plataforma */}
                      <div className="text-center w-10 flex-shrink-0">
                        <span className="text-2xl">{PLATAFORMA_ICON[pub.plataforma] ?? '📲'}</span>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{pub.plataforma}</p>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                          <span>{pub.conteudo.projeto.nicho.icone}</span>
                          <span>{pub.conteudo.projeto.nome}</span>
                        </div>
                        <Link
                          href={`/conteudos/${pub.conteudo.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600 hover:underline truncate block"
                        >
                          {pub.conteudo.tituloInterno}
                        </Link>
                        {pub.conteudo.hook && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{pub.conteudo.hook}</p>
                        )}
                      </div>

                      {/* Status */}
                      <span className={`badge flex-shrink-0 ${st.cls}`}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Histórico resumido */}
      {totalPublicados > 0 && (
        <div className="mt-8">
          <HistoricoPublicacoes />
        </div>
      )}
    </div>
  )
}

async function HistoricoPublicacoes() {
  const recentes = await prisma.publicacaoPlataforma.findMany({
    where: { status: 'publicado' },
    orderBy: { publicadoEm: 'desc' },
    take: 5,
    include: {
      conteudo: {
        select: {
          id: true,
          tituloInterno: true,
          projeto: { select: { nome: true, nicho: { select: { icone: true } } } },
        },
      },
    },
  })

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Publicações recentes
      </h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-50">
            {recentes.map((pub) => (
              <tr key={pub.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="text-base">{PLATAFORMA_ICON[pub.plataforma] ?? '📲'}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/conteudos/${pub.conteudo.id}`} className="font-medium text-gray-900 hover:text-indigo-600 hover:underline">
                    {pub.conteudo.tituloInterno}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {pub.conteudo.projeto.nicho.icone} {pub.conteudo.projeto.nome}
                  </p>
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-400">
                  {pub.publicadoEm
                    ? new Date(pub.publicadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="badge bg-green-100 text-green-800">Publicado</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
