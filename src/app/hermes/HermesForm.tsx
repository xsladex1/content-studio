'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLATAFORMAS_OPCOES = [
  { value: 'tiktok',       label: '🎵 TikTok' },
  { value: 'instagram',    label: '📸 Instagram' },
  { value: 'youtube',      label: '📺 YouTube' },
  { value: 'shopee',       label: '🛍️ Shopee' },
  { value: 'mercadolivre', label: '🛒 Mercado Livre' },
]

type Projeto = { id: string; nome: string; nicho: { nome: string; icone: string | null } }

type Criado = { id: string; titulo: string }

type Resultado = {
  objetivo: string
  projeto:  { nome: string }
  criados:  Criado[]
  total:    number
}

export default function HermesForm({ projetos }: { projetos: Projeto[] }) {
  const router = useRouter()
  const [objetivo,    setObjetivo]    = useState('')
  const [projetoId,   setProjetoId]   = useState(projetos[0]?.id ?? '')
  const [quantidade,  setQuantidade]  = useState(3)
  const [loading,     setLoading]     = useState(false)
  const [resultado,   setResultado]   = useState<Resultado | null>(null)
  const [erro,        setErro]        = useState('')

  const exemplos = [
    'Quero 3 posts sobre os benefícios do produto para iniciantes',
    'Gere 2 vídeos de comparação com concorrentes',
    'Criar 5 posts de depoimentos e prova social',
    'Fazer 3 conteúdos de bastidores e processo',
  ]

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!objetivo.trim() || !projetoId) return
    setLoading(true); setErro(''); setResultado(null)

    try {
      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivo, projetoId, quantidade }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro')
      setResultado(data)
      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (resultado) {
    return (
      <div className="card p-8 max-w-xl text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {resultado.total} conteúdo{resultado.total !== 1 ? 's' : ''} criado{resultado.total !== 1 ? 's' : ''}!
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Projeto: <strong>{resultado.projeto.nome}</strong> · Objetivo: {resultado.objetivo}
        </p>

        <div className="space-y-2 text-left mb-6">
          {resultado.criados.map((c, i) => (
            <Link key={c.id} href={`/conteudos/${c.id}`}
              className="flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <span className="text-indigo-400 font-bold text-sm">{i + 1}</span>
              <span className="text-sm font-medium text-indigo-900">{c.titulo}</span>
              <span className="ml-auto text-xs text-indigo-400">→ Gerar IA</span>
            </Link>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setResultado(null); setObjetivo('') }}
            className="btn-secondary"
          >
            Novo objetivo
          </button>
          <Link href="/conteudos" className="btn-primary">
            Ver todos os conteúdos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {/* Objetivo */}
      <div>
        <label className="label text-base font-semibold text-gray-900">
          O que você quer criar hoje?
        </label>
        <textarea
          className="textarea text-base mt-2"
          rows={3}
          value={objetivo}
          onChange={e => setObjetivo(e.target.value)}
          placeholder="Ex: Quero 3 posts mostrando benefícios do produto para jovens de 18-25 anos no TikTok"
          required
        />
        {/* Exemplos */}
        <div className="flex flex-wrap gap-2 mt-2">
          {exemplos.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => setObjetivo(ex)}
              className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Projeto */}
      <div>
        <label className="label">Projeto</label>
        <select className="select" value={projetoId} onChange={e => setProjetoId(e.target.value)} required>
          {projetos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nicho.icone} {p.nome} ({p.nicho.nome})
            </option>
          ))}
        </select>
      </div>

      {/* Quantidade */}
      <div>
        <label className="label">Quantos conteúdos gerar?</label>
        <div className="flex gap-2 mt-1">
          {[1, 2, 3, 5, 7].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setQuantidade(n)}
              className={`w-12 py-2 rounded-lg border text-sm font-semibold transition-all ${
                quantidade === n
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{erro}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !objetivo.trim() || !projetoId}
        className="btn-primary w-full text-base py-3 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            HERMES está planejando...
          </span>
        ) : (
          '🚀 Gerar plano de conteúdo'
        )}
      </button>
    </form>
  )
}
