'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLATAFORMA_ICON: Record<string, string> = {
  tiktok:       '🎵',
  instagram:    '📸',
  youtube:      '📺',
  shopee:       '🛍️',
  mercadolivre: '🛒',
}

type Publicacao = { plataforma: string; status: string }
type Projeto = { id: string; nome: string; nicho: { nome: string; icone: string | null } }

type Props = {
  conteudo: {
    id: string
    tituloInterno: string
    hook: string | null
    roteiro: string | null
    legenda: string | null
    updatedAt: Date
    projeto: Projeto
    publicacoes: Publicacao[]
  }
}

export default function AprovacaoCard({ conteudo: c }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'aprovar' | 'rejeitar' | null>(null)
  const [done, setDone] = useState(false)

  async function acao(novoStatus: 'aprovado' | 'rascunho') {
    setLoading(novoStatus === 'aprovado' ? 'aprovar' : 'rejeitar')
    try {
      const res = await fetch(`/api/conteudos/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      setTimeout(() => router.refresh(), 600)
    } catch {
      alert('Erro ao atualizar status. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return (
      <div className="card p-5 opacity-50 pointer-events-none">
        <p className="text-sm text-gray-400 text-center py-4">Processado ✓</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Cabeçalho */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-400">
              {c.projeto.nicho.icone} {c.projeto.nicho.nome}
            </span>
            <span className="text-gray-300">·</span>
            <Link
              href={`/projetos/${c.projeto.id}`}
              className="text-sm text-gray-500 hover:text-indigo-600"
            >
              {c.projeto.nome}
            </Link>
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">{c.tituloInterno}</h2>

          {/* Plataformas */}
          <div className="flex items-center gap-2 mb-3">
            {c.publicacoes.map((pub) => (
              <span
                key={pub.plataforma}
                className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
              >
                {PLATAFORMA_ICON[pub.plataforma] ?? pub.plataforma} {pub.plataforma}
              </span>
            ))}
          </div>

          {/* Preview do hook */}
          {c.hook && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs font-medium text-amber-700 mb-0.5">Hook</p>
              <p className="text-sm text-amber-900">{c.hook}</p>
            </div>
          )}

          {/* Preview do roteiro */}
          {c.roteiro && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs font-medium text-gray-500 mb-0.5">Roteiro</p>
              <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">{c.roteiro}</p>
            </div>
          )}

          {/* Preview da legenda */}
          {c.legenda && (
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-gray-500 mb-0.5">Legenda</p>
              <p className="text-sm text-gray-700 line-clamp-2">{c.legenda}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2 flex-shrink-0 w-32">
          <button
            onClick={() => acao('aprovado')}
            disabled={loading !== null}
            className="text-xs font-medium bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg transition-colors"
          >
            {loading === 'aprovar' ? '...' : '✓ Aprovar'}
          </button>
          <button
            onClick={() => acao('rascunho')}
            disabled={loading !== null}
            className="text-xs font-medium bg-white hover:bg-red-50 disabled:opacity-60 text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors"
          >
            {loading === 'rejeitar' ? '...' : '✕ Pedir refazer'}
          </button>
          <Link
            href={`/conteudos/${c.id}`}
            className="text-xs text-center text-indigo-600 hover:underline pt-1"
          >
            Editar
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
        Atualizado em{' '}
        {new Date(c.updatedAt).toLocaleDateString('pt-BR', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </p>
    </div>
  )
}
