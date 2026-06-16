import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const STATUS_CONTEUDO: Record<string, { label: string; cls: string }> = {
  rascunho: { label: 'Rascunho', cls: 'bg-gray-100 text-gray-600' },
  gerando:  { label: 'Gerando',  cls: 'bg-blue-100 text-blue-700' },
  revisao:  { label: 'Revisão',  cls: 'bg-yellow-100 text-yellow-800' },
  aprovado: { label: 'Aprovado', cls: 'bg-green-100 text-green-800' },
  pausado:  { label: 'Pausado',  cls: 'bg-red-100 text-red-700' },
}

const STATUS_PUB: Record<string, string> = {
  pendente:    'bg-gray-200',
  agendado:    'bg-blue-400',
  publicando:  'bg-indigo-400',
  publicado:   'bg-green-500',
  falhou:      'bg-red-500',
  cancelado:   'bg-gray-300',
}

const PLATAFORMA_ICON: Record<string, string> = {
  tiktok:       '🎵',
  instagram:    '📸',
  youtube:      '📺',
  shopee:       '🛍️',
  mercadolivre: '🛒',
}

export default async function ConteudosPage() {
  const conteudos = await prisma.conteudo.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      projeto: {
        select: { id: true, nome: true, nicho: { select: { icone: true } } },
      },
      publicacoes: { select: { plataforma: true, status: true } },
    },
  })

  const totais = {
    total:    conteudos.length,
    revisao:  conteudos.filter((c) => c.status === 'revisao').length,
    aprovado: conteudos.filter((c) => c.status === 'aprovado').length,
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Conteúdos</h1>
          <p className="page-subtitle">
            {totais.total} total · {totais.revisao} em revisão · {totais.aprovado} aprovados
          </p>
        </div>
        <Link href="/conteudos/novo" className="btn-primary">+ Novo Conteúdo</Link>
      </div>

      {conteudos.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🎬</p>
          <p className="text-gray-600 font-medium">Nenhum conteúdo criado ainda</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Crie um projeto primeiro, depois adicione conteúdos</p>
          <Link href="/conteudos/novo" className="btn-primary">Criar conteúdo</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Projeto</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Plataformas</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {conteudos.map((c) => {
                const st = STATUS_CONTEUDO[c.status] ?? STATUS_CONTEUDO.rascunho
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/conteudos/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                        {c.tituloInterno}
                      </Link>
                      {c.hook && (
                        <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{c.hook}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <Link href={`/projetos/${c.projeto.id}`} className="hover:text-indigo-600 hover:underline">
                        {c.projeto.nicho.icone} {c.projeto.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {c.publicacoes.length === 0 ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : (
                          c.publicacoes.map((pub) => (
                            <span
                              key={pub.plataforma}
                              title={`${pub.plataforma}: ${pub.status}`}
                              className="relative"
                            >
                              <span className="text-base">{PLATAFORMA_ICON[pub.plataforma] ?? pub.plataforma}</span>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${STATUS_PUB[pub.status] ?? 'bg-gray-200'}`}
                              />
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400 text-xs">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
