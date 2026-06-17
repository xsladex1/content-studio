'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLATAFORMA: Record<string, { label: string; icon: string }> = {
  tiktok:       { label: 'TikTok',        icon: '🎵' },
  instagram:    { label: 'Instagram',     icon: '📸' },
  youtube:      { label: 'YouTube',       icon: '📺' },
  shopee:       { label: 'Shopee',        icon: '🛍️' },
  mercadolivre: { label: 'Mercado Livre', icon: '🛒' },
}

const STATUS_CLS: Record<string, string> = {
  pendente:   'bg-gray-100 text-gray-600',
  agendado:   'bg-blue-100 text-blue-700',
  publicando: 'bg-indigo-100 text-indigo-700',
  publicado:  'bg-green-100 text-green-800',
  falhou:     'bg-red-100 text-red-700',
  cancelado:  'bg-gray-100 text-gray-500',
}

type Pub = {
  id:           string
  plataforma:   string
  status:       string
  agendadoPara: Date | null
  urlPublicacao:string | null
}

export default function AgendarPublicacao({ publicacoes, conteudoAprovado }: {
  publicacoes:      Pub[]
  conteudoAprovado: boolean
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publicação por plataforma</p>
      {publicacoes.map(pub => (
        <PubCard key={pub.id} pub={pub} habilitado={conteudoAprovado} />
      ))}
      {!conteudoAprovado && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠️ Aprove o conteúdo antes de agendar publicação
        </p>
      )}
    </div>
  )
}

function PubCard({ pub, habilitado }: { pub: Pub; habilitado: boolean }) {
  const router = useRouter()
  const plat   = PLATAFORMA[pub.plataforma] ?? { label: pub.plataforma, icon: '📢' }

  const jaPublicado = pub.status === 'publicado' || pub.status === 'publicando'
  const jaCancelado = pub.status === 'cancelado'

  // Formata a data atual para o input datetime-local (YYYY-MM-DDTHH:MM)
  const dataAtual = pub.agendadoPara
    ? new Date(pub.agendadoPara.getTime() - pub.agendadoPara.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : ''

  const [dataHora, setDataHora]  = useState(dataAtual)
  const [loading,  setLoading]   = useState<'agendar' | 'agora' | 'cancelar' | null>(null)
  const [erro,     setErro]      = useState('')

  async function agendar() {
    if (!dataHora) { setErro('Selecione data e hora'); return }
    setLoading('agendar'); setErro('')
    try {
      const res = await fetch(`/api/publicacoes/${pub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendadoPara: dataHora, status: 'agendado' }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setErro('Erro ao agendar. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  async function publicarAgora() {
    setLoading('agora'); setErro('')
    try {
      const res = await fetch(`/api/publicacoes/${pub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'publicando', agendadoPara: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setErro('Erro ao publicar. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  async function cancelar() {
    setLoading('cancelar'); setErro('')
    try {
      await fetch(`/api/publicacoes/${pub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado', agendadoPara: null }),
      })
      router.refresh()
    } catch {
      setErro('Erro ao cancelar.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      {/* Header da plataforma */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">
          {plat.icon} {plat.label}
        </span>
        <span className={`badge text-xs ${STATUS_CLS[pub.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {pub.status}
        </span>
      </div>

      {/* Link da publicação */}
      {pub.urlPublicacao && (
        <a href={pub.urlPublicacao} target="_blank" rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline block mb-2 truncate">
          Ver publicação →
        </a>
      )}

      {/* Controles (só se não publicado/cancelado e conteudo aprovado) */}
      {!jaPublicado && !jaCancelado && habilitado && (
        <div className="space-y-2">
          {/* Date/time picker */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="label text-xs mb-0.5">Data e hora</label>
              <input
                type="datetime-local"
                className="input text-xs py-1.5"
                value={dataHora}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setDataHora(e.target.value)}
              />
            </div>
            <button
              onClick={agendar}
              disabled={loading !== null || !dataHora}
              className="text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            >
              {loading === 'agendar' ? '...' : '📅 Agendar'}
            </button>
          </div>

          {/* Publicar agora */}
          <div className="flex gap-2">
            <button
              onClick={publicarAgora}
              disabled={loading !== null}
              className="flex-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {loading === 'agora' ? '...' : '🚀 Publicar agora'}
            </button>
            {pub.status === 'agendado' && (
              <button
                onClick={cancelar}
                disabled={loading !== null}
                className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {loading === 'cancelar' ? '...' : 'Cancelar'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Data agendada (readonly) */}
      {pub.agendadoPara && (pub.status === 'agendado' || pub.status === 'publicando') && (
        <p className="text-xs text-blue-600 mt-1">
          📅 {new Date(pub.agendadoPara).toLocaleString('pt-BR', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}

      {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
    </div>
  )
}
