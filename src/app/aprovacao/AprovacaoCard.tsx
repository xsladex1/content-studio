'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MediaPreview from '@/components/MediaPreview'

const PLATAFORMA_ICON: Record<string, string> = {
  tiktok:       '🎵',
  instagram:    '📸',
  youtube:      '📺',
  shopee:       '🛍️',
  mercadolivre: '🛒',
}

type Publicacao = { plataforma: string; status: string }
type Projeto    = { id: string; nome: string; nicho: { nome: string; icone: string | null } }

type Conteudo = {
  id:            string
  tituloInterno: string
  hook:          string | null
  roteiro:       string | null
  legenda:       string | null
  hashtags:      string | null
  imagemUrl:     string | null
  audioUrl:      string | null
  updatedAt:     Date
  projeto:       Projeto
  publicacoes:   Publicacao[]
}

export default function AprovacaoCard({ conteudo: c }: { conteudo: Conteudo }) {
  const router = useRouter()

  // Ação de aprovação
  const [loading, setLoading]   = useState<'aprovar' | 'rejeitar' | null>(null)
  const [done, setDone]         = useState(false)

  // Expansão do editor inline
  const [expandido, setExpandido] = useState(false)

  // Campos editáveis
  const [roteiro,  setRoteiro]  = useState(c.roteiro  ?? '')
  const [legenda,  setLegenda]  = useState(c.legenda  ?? '')
  const [hashtags, setHashtags] = useState(c.hashtags ?? '')

  // Autosave
  const [salvando,  setSalvando]  = useState(false)
  const [salvoEm,   setSalvoEm]   = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const agendarSalvar = useCallback((rot: string, leg: string, hash: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSalvando(true)
      try {
        await fetch(`/api/conteudos/${c.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roteiro: rot || null, legenda: leg || null, hashtags: hash || null }),
        })
        setSalvoEm(new Date())
      } finally {
        setSalvando(false)
      }
    }, 3000)
  }, [c.id])

  function onChangeRoteiro(v: string)  { setRoteiro(v);  agendarSalvar(v, legenda, hashtags) }
  function onChangeLegenda(v: string)  { setLegenda(v);  agendarSalvar(roteiro, v, hashtags) }
  function onChangeHashtags(v: string) { setHashtags(v); agendarSalvar(roteiro, legenda, v) }

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
      <div className="card p-5 opacity-40 pointer-events-none">
        <p className="text-sm text-gray-400 text-center py-4">Processado ✓</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">

          {/* Thumbnail lateral */}
          {c.imagemUrl && (
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.imagemUrl}
                alt="Imagem do conteúdo"
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            {/* Cabeçalho */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">
                {c.projeto.nicho.icone} {c.projeto.nicho.nome}
              </span>
              <span className="text-gray-300">·</span>
              <Link href={`/projetos/${c.projeto.id}`} className="text-xs text-gray-500 hover:text-indigo-600">
                {c.projeto.nome}
              </Link>
            </div>

            <h2 className="font-semibold text-gray-900 mb-1.5">{c.tituloInterno}</h2>

            {/* Plataformas */}
            <div className="flex items-center gap-1.5 mb-3">
              {c.publicacoes.map((pub) => (
                <span key={pub.plataforma}
                  className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {PLATAFORMA_ICON[pub.plataforma] ?? '📢'} {pub.plataforma}
                </span>
              ))}
            </div>

            {/* Hook */}
            {c.hook && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                <p className="text-xs font-medium text-amber-600 mb-0.5">Hook</p>
                <p className="text-sm text-amber-900">{c.hook}</p>
              </div>
            )}

            {/* Roteiro preview (colapsado) */}
            {c.roteiro && !expandido && (
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Roteiro</p>
                <p className="text-sm text-gray-700 line-clamp-2 whitespace-pre-wrap">{c.roteiro}</p>
              </div>
            )}

            {/* Legenda preview (colapsado) */}
            {c.legenda && !expandido && (
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Legenda</p>
                <p className="text-sm text-gray-700 line-clamp-1">{c.legenda}</p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2 flex-shrink-0 w-32">
            <button
              onClick={() => acao('aprovado')}
              disabled={loading !== null}
              className="text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg transition-colors"
            >
              {loading === 'aprovar' ? '...' : '✓ Aprovar'}
            </button>
            <button
              onClick={() => acao('rascunho')}
              disabled={loading !== null}
              className="text-xs font-medium bg-white hover:bg-red-50 disabled:opacity-60 text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors"
            >
              {loading === 'rejeitar' ? '...' : '✕ Refazer'}
            </button>
            <Link href={`/conteudos/${c.id}`}
              className="text-xs text-center text-indigo-600 hover:underline pt-0.5">
              Ver completo
            </Link>
            <button
              onClick={() => setExpandido(v => !v)}
              className="text-xs text-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              {expandido ? '▲ Fechar editor' : '✏️ Editar aqui'}
            </button>
          </div>
        </div>

        {/* Áudio player */}
        {c.audioUrl && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className="text-xs text-gray-400 mb-1">Narração</p>
            <audio controls src={c.audioUrl} className="w-full h-8" />
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          Atualizado em{' '}
          {new Date(c.updatedAt).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* ── Editor inline + Preview (Fases 3.2 + 3.3) ───────────────── */}
      {expandido && (
        <div className="border-t border-indigo-100 bg-indigo-50/30 p-5">
          <InlineEditor
            conteudoId={c.id}
            plataforma={c.publicacoes[0]?.plataforma ?? 'tiktok'}
            imagemUrl={c.imagemUrl}
            hook={c.hook}
            roteiro={roteiro}
            legenda={legenda}
            hashtags={hashtags}
            salvando={salvando}
            salvoEm={salvoEm}
            onChangeRoteiro={onChangeRoteiro}
            onChangeLegenda={onChangeLegenda}
            onChangeHashtags={onChangeHashtags}
          />
        </div>
      )}
    </div>
  )
}

// ── Sub-componente: editor inline com preview de plataforma ─────────────────

function InlineEditor({
  plataforma,
  imagemUrl,
  hook,
  roteiro,
  legenda,
  hashtags,
  salvando,
  salvoEm,
  onChangeRoteiro,
  onChangeLegenda,
  onChangeHashtags,
}: {
  conteudoId:      string
  plataforma:      string
  imagemUrl:       string | null
  hook:            string | null
  roteiro:         string
  legenda:         string
  hashtags:        string
  salvando:        boolean
  salvoEm:         Date | null
  onChangeRoteiro: (v: string) => void
  onChangeLegenda: (v: string) => void
  onChangeHashtags:(v: string) => void
}) {
  const [aba, setAba] = useState<'editar' | 'preview'>('editar')

  return (
    <div className="space-y-4">
      {/* Abas */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
          {(['editar', 'preview'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                aba === a
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {a === 'editar' ? '✏️ Editar' : '👁 Preview'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          {salvando ? '💾 Salvando...' : salvoEm
            ? `✓ Salvo às ${salvoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Autosave em 3s após editar'}
        </p>
      </div>

      {aba === 'editar' ? (
        <div className="space-y-4">
          <div>
            <label className="label text-xs">Roteiro</label>
            <textarea
              className="textarea text-sm font-sans"
              rows={6}
              value={roteiro}
              onChange={e => onChangeRoteiro(e.target.value)}
              placeholder="Roteiro do vídeo..."
            />
          </div>
          <div>
            <label className="label text-xs">Legenda</label>
            <textarea
              className="textarea text-sm"
              rows={3}
              value={legenda}
              onChange={e => onChangeLegenda(e.target.value)}
              placeholder="Legenda para redes sociais..."
            />
          </div>
          <div>
            <label className="label text-xs">Hashtags</label>
            <textarea
              className="textarea text-sm"
              rows={2}
              value={hashtags}
              onChange={e => onChangeHashtags(e.target.value)}
              placeholder="#hashtag1 #hashtag2..."
            />
          </div>
        </div>
      ) : (
        <div className="py-2">
          <p className="text-xs text-gray-400 mb-4 text-center">
            Preview — {plataforma}
          </p>
          <MediaPreview
            plataforma={plataforma}
            imagemUrl={imagemUrl}
            hook={hook}
          />
          {(legenda || hashtags) && (
            <div className="mt-4 space-y-2">
              {legenda && (
                <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Legenda</p>
                  <p className="text-xs text-gray-700">{legenda}</p>
                </div>
              )}
              {hashtags && (
                <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                  <p className="text-xs text-indigo-600">{hashtags}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
