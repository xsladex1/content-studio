export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function NichosPage() {
  const nichos = await prisma.nicho.findMany({
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { projetos: true, promptTemplates: true } },
    },
  })

  const ativos   = nichos.filter((n) => n.ativo).length
  const inativos = nichos.filter((n) => !n.ativo).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Nichos</h1>
          <p className="page-subtitle">
            {nichos.length} nicho{nichos.length !== 1 ? 's' : ''} · {ativos} ativo{ativos !== 1 ? 's' : ''}{inativos > 0 ? ` · ${inativos} inativo${inativos !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <Link href="/nichos/novo" className="btn-primary">+ Novo Nicho</Link>
      </div>

      {nichos.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-gray-600 font-medium">Nenhum nicho cadastrado</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Execute o seed para carregar os nichos padrão ou crie um novo</p>
          <Link href="/nichos/novo" className="btn-primary">Criar nicho</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nichos.map((n) => (
            <div key={n.id} className={`card p-5 flex flex-col gap-3 ${!n.ativo ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{n.icone ?? '🏷️'}</span>
                  <div>
                    <h2 className="font-semibold text-gray-900">{n.nome}</h2>
                    <span className={`badge mt-1 ${n.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {n.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/nichos/${n.id}`}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Editar
                </Link>
              </div>

              {n.descricao && (
                <p className="text-sm text-gray-500 leading-relaxed">{n.descricao}</p>
              )}

              <div className="flex items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-400">
                <span>
                  <strong className="text-gray-700">{n._count.projetos}</strong> projeto{n._count.projetos !== 1 ? 's' : ''}
                </span>
                <span>
                  <strong className="text-gray-700">{n._count.promptTemplates}</strong> template{n._count.promptTemplates !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
