import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EditProjetoForm from './EditProjetoForm'

const STATUS_CONTEUDO: Record<string, { label: string; cls: string }> = {
  rascunho: { label: 'Rascunho', cls: 'bg-gray-100 text-gray-600' },
  gerando:  { label: 'Gerando',  cls: 'bg-blue-100 text-blue-700' },
  revisao:  { label: 'Revisão',  cls: 'bg-yellow-100 text-yellow-800' },
  aprovado: { label: 'Aprovado', cls: 'bg-green-100 text-green-800' },
  pausado:  { label: 'Pausado',  cls: 'bg-red-100 text-red-700' },
}

const PLATAFORMA_ICON: Record<string, string> = {
  tiktok:        '🎵',
  instagram:     '📸',
  youtube:       '📺',
  shopee:        '🛍️',
  mercadolivre:  '🛒',
}

export default async function ProjetoDetailPage({ params }: { params: { id: string } }) {
  const [projeto, nichos] = await Promise.all([
    prisma.projeto.findUnique({
      where: { id: params.id },
      include: {
        nicho: true,
        conteudos: {
          orderBy: { createdAt: 'desc' },
          include: {
            publicacoes: { select: { plataforma: true, status: true } },
          },
        },
      },
    }),
    prisma.nicho.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
  ])

  if (!projeto) notFound()

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            <Link href="/projetos" className="hover:text-indigo-600">Projetos</Link> / {projeto.nome}
          </p>
          <h1 className="page-title">{projeto.nome}</h1>
          <p className="page-subtitle">{projeto.nicho.icone} {projeto.nicho.nome} · {projeto.tipo}</p>
        </div>
        <Link href={`/conteudos/novo?projetoId=${projeto.id}`} className="btn-primary">
          + Novo Conteúdo
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="col-span-2 space-y-6">

          {/* Dados rápidos */}
          {projeto.tipo === 'afiliado' && (projeto.preco != null || projeto.linkAfiliado) && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Produto Afiliado</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {projeto.preco != null && (
                  <div>
                    <p className="text-gray-500">Preço</p>
                    <p className="font-semibold text-gray-900">R$ {projeto.preco.toFixed(2)}</p>
                  </div>
                )}
                {projeto.comissaoEstimada != null && (
                  <div>
                    <p className="text-gray-500">Comissão</p>
                    <p className="font-semibold text-gray-900">{projeto.comissaoEstimada}%</p>
                  </div>
                )}
                {projeto.plataformaOrigem && (
                  <div>
                    <p className="text-gray-500">Plataforma</p>
                    <p className="font-medium text-gray-900">{projeto.plataformaOrigem}</p>
                  </div>
                )}
                {projeto.linkAfiliado && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Link afiliado</p>
                    <a href={projeto.linkAfiliado} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-xs truncate block">
                      {projeto.linkAfiliado}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contexto para IA */}
          {(projeto.dorQueResolve || projeto.beneficioPrincipal || projeto.publicoAlvo) && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contexto para IA</p>
              <div className="space-y-3 text-sm">
                {projeto.publicoAlvo && (
                  <div>
                    <p className="text-gray-500 text-xs">Público-alvo</p>
                    <p className="text-gray-800">{projeto.publicoAlvo}</p>
                  </div>
                )}
                {projeto.dorQueResolve && (
                  <div>
                    <p className="text-gray-500 text-xs">Dor que resolve</p>
                    <p className="text-gray-800">{projeto.dorQueResolve}</p>
                  </div>
                )}
                {projeto.beneficioPrincipal && (
                  <div>
                    <p className="text-gray-500 text-xs">Benefício principal</p>
                    <p className="text-gray-800">{projeto.beneficioPrincipal}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de conteúdos */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Conteúdos ({projeto.conteudos.length})
              </h2>
              <Link href={`/conteudos/novo?projetoId=${projeto.id}`} className="text-indigo-600 text-sm hover:underline">
                + Novo
              </Link>
            </div>

            {projeto.conteudos.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-gray-400 text-sm">Nenhum conteúdo criado ainda.</p>
                <Link href={`/conteudos/novo?projetoId=${projeto.id}`} className="btn-primary mt-3 inline-flex">
                  Criar primeiro conteúdo
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {projeto.conteudos.map((c) => {
                  const st = STATUS_CONTEUDO[c.status] ?? STATUS_CONTEUDO.rascunho
                  return (
                    <Link
                      key={c.id}
                      href={`/conteudos/${c.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.tituloInterno}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {c.publicacoes.map((pub) => (
                            <span key={pub.plataforma} className="text-xs" title={pub.plataforma}>
                              {PLATAFORMA_ICON[pub.plataforma] ?? pub.plataforma}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Painel lateral de edição */}
        <div className="card p-5">
          <p className="font-semibold text-gray-900 text-sm mb-4">Editar Projeto</p>
          <EditProjetoForm projeto={projeto} nichos={nichos} />
        </div>
      </div>
    </div>
  )
}
