export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const STATUS_PROJETO: Record<string, { label: string; cls: string }> = {
  ativo:     { label: 'Ativo',     cls: 'bg-green-100 text-green-800' },
  pausado:   { label: 'Pausado',   cls: 'bg-yellow-100 text-yellow-800' },
  arquivado: { label: 'Arquivado', cls: 'bg-gray-100 text-gray-500' },
}

const TIPO_PROJETO: Record<string, { label: string; cls: string }> = {
  afiliado:      { label: 'Afiliado',      cls: 'bg-orange-100 text-orange-800' },
  educacional:   { label: 'Educacional',   cls: 'bg-blue-100 text-blue-800' },
  lifestyle:     { label: 'Lifestyle',     cls: 'bg-purple-100 text-purple-800' },
  marca:         { label: 'Marca',         cls: 'bg-indigo-100 text-indigo-800' },
  entretenimento:{ label: 'Entretenim.',   cls: 'bg-pink-100 text-pink-800' },
}

export default async function ProjetosPage() {
  const projetos = await prisma.projeto.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      nicho: { select: { nome: true, icone: true } },
      _count: { select: { conteudos: true } },
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projetos</h1>
          <p className="page-subtitle">{projetos.length} projeto{projetos.length !== 1 ? 's' : ''} cadastrado{projetos.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/projetos/novo" className="btn-primary">+ Novo Projeto</Link>
      </div>

      {projetos.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-600 font-medium">Nenhum projeto cadastrado</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Crie um projeto para começar a produzir conteúdo</p>
          <Link href="/projetos/novo" className="btn-primary">Criar projeto</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Nicho</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Conteúdos</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projetos.map((p) => {
                const st = STATUS_PROJETO[p.status] ?? STATUS_PROJETO.ativo
                const tp = TIPO_PROJETO[p.tipo] ?? TIPO_PROJETO.afiliado
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/projetos/${p.id}`} className="font-medium text-indigo-600 hover:underline">
                        {p.nome}
                      </Link>
                      {p.preco != null && (
                        <p className="text-xs text-gray-400 mt-0.5">R$ {p.preco.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {p.nicho.icone} {p.nicho.nome}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`badge ${tp.cls}`}>{tp.label}</span>
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-gray-700">
                      {p._count.conteudos}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`badge ${st.cls}`}>{st.label}</span>
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
