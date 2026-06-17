'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Tipo = 'texto' | 'imagem' | 'audio'

type GeradoState = {
  hook:      string | null
  roteiro:   string | null
  legenda:   string | null
  hashtags:  string | null
  imagemUrl: string | null
  audioUrl:  string | null
}

type TemplateOpcao = { id: string; titulo: string; tipo: string; plataforma: string | null }

type Props = {
  conteudoId:  string
  plataforma?: string
  nichoId?:    string
  templates?:  TemplateOpcao[]
  hook?:       string | null
  roteiro?:    string | null
  legenda?:    string | null
  hashtags?:   string | null
  imagemUrl?:  string | null
  audioUrl?:   string | null
}

const LOADING_MSG: Record<Tipo, string> = {
  texto:  'Gerando roteiro com GPT-4o...',
  imagem: 'Criando imagem com DALL-E 3...',
  audio:  'Gerando narração com TTS...',
}

const BOTAO_ICON: Record<Tipo, string> = {
  texto:  '✍️',
  imagem: '🖼️',
  audio:  '🎙️',
}

export default function GerarIAButtons({
  conteudoId,
  plataforma,
  templates = [],
  hook:       hookInicial      = null,
  roteiro:    roteiroInicial   = null,
  legenda:    legendaInicial   = null,
  hashtags:   hashtagsInicial  = null,
  imagemUrl:  imagemUrlInicial = null,
  audioUrl:   audioUrlInicial  = null,
}: Props) {
  const router = useRouter()

  const [gerando, setGerando]         = useState<Tipo | null>(null)
  const [erro, setErro]               = useState<string | null>(null)
  const [copiado, setCopiado]         = useState<string | null>(null)
  const [templateId, setTemplateId]   = useState<string>('')

  const templatesRoteiro = templates.filter(t => t.tipo === 'roteiro')

  const [gerado, setGerado] = useState<GeradoState>({
    hook:      hookInicial,
    roteiro:   roteiroInicial,
    legenda:   legendaInicial,
    hashtags:  hashtagsInicial,
    imagemUrl: imagemUrlInicial,
    audioUrl:  audioUrlInicial,
  })

  const temTexto   = !!(gerado.hook || gerado.roteiro || gerado.legenda || gerado.hashtags)
  const temRoteiro = !!gerado.roteiro
  const bloqueado  = gerando !== null

  const gerar = useCallback(async (tipo: Tipo) => {
    if (tipo === 'audio' && !temRoteiro) {
      setErro('Gere o texto primeiro antes de gerar o áudio.')
      return
    }
    setGerando(tipo)
    setErro(null)

    try {
      const res = await fetch('/api/ai/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ conteudoId, tipo, plataforma, templateId: templateId || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro na geração')

      if (tipo === 'texto') {
        const r = data.resultado as GeradoState
        setGerado(prev => ({
          ...prev,
          hook:     r.hook     ?? prev.hook,
          roteiro:  r.roteiro  ?? prev.roteiro,
          legenda:  r.legenda  ?? prev.legenda,
          hashtags: r.hashtags ?? prev.hashtags,
        }))
      } else if (tipo === 'imagem') {
        setGerado(prev => ({ ...prev, imagemUrl: data.resultado.imagemUrl ?? prev.imagemUrl }))
      } else if (tipo === 'audio') {
        setGerado(prev => ({ ...prev, audioUrl: data.resultado.audioUrl ?? prev.audioUrl }))
      }

      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setGerando(null)
    }
  }, [conteudoId, plataforma, temRoteiro, router])

  async function copiar(texto: string, campo: string) {
    await navigator.clipboard.writeText(texto)
    setCopiado(campo)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="space-y-4">

      {/* Cabeçalho */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <span>🤖</span> Gerar com IA
      </p>

      {/* Seletor de template (só aparece se há templates de roteiro disponíveis) */}
      {templatesRoteiro.length > 0 && (
        <div>
          <label className="label text-xs text-gray-500">Template de roteiro</label>
          <select
            className="select text-xs"
            value={templateId}
            onChange={e => setTemplateId(e.target.value)}
          >
            <option value="">Automático (melhor match)</option>
            {templatesRoteiro.map(t => (
              <option key={t.id} value={t.id}>
                {t.titulo}{t.plataforma ? ` · ${t.plataforma}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Botões de geração */}
      <div className="space-y-2">
        <BotaoGerar
          tipo="texto"
          label={temTexto ? 'Regenerar texto' : 'Gerar texto'}
          ativo={gerando === 'texto'}
          bloqueado={bloqueado && gerando !== 'texto'}
          onClick={() => gerar('texto')}
        />
        <BotaoGerar
          tipo="imagem"
          label={gerado.imagemUrl ? 'Regenerar imagem' : 'Gerar imagem'}
          ativo={gerando === 'imagem'}
          bloqueado={bloqueado && gerando !== 'imagem'}
          onClick={() => gerar('imagem')}
        />
        <BotaoGerar
          tipo="audio"
          label={gerado.audioUrl ? 'Regenerar áudio' : 'Gerar áudio'}
          ativo={gerando === 'audio'}
          bloqueado={bloqueado && gerando !== 'audio'}
          desabilitado={!temRoteiro}
          title={!temRoteiro ? 'Gere o texto primeiro' : undefined}
          onClick={() => gerar('audio')}
        />
      </div>

      {/* Loading bar */}
      {gerando && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5">
          <p className="text-xs font-medium text-indigo-700 mb-1.5">{LOADING_MSG[gerando]}</p>
          <div className="h-1 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '70%' }} />
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && !gerando && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-xs text-red-600">{erro}</p>
        </div>
      )}

      {/* ── Preview de texto ── */}
      {temTexto && (
        <div className="border-t border-gray-100 pt-3 space-y-2.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resultado</p>

          {gerado.hook && (
            <CampoTexto
              label="Hook"
              valor={gerado.hook}
              campo="hook"
              copiado={copiado}
              onCopiar={copiar}
              cls="bg-amber-50 border-amber-100 text-amber-900 font-medium"
            />
          )}

          {gerado.roteiro && (
            <CampoTexto
              label="Roteiro"
              valor={gerado.roteiro}
              campo="roteiro"
              copiado={copiado}
              onCopiar={copiar}
              multiline
              cls="bg-gray-50 border-gray-100 text-gray-700"
            />
          )}

          {gerado.legenda && (
            <CampoTexto
              label="Legenda"
              valor={gerado.legenda}
              campo="legenda"
              copiado={copiado}
              onCopiar={copiar}
              cls="bg-gray-50 border-gray-100 text-gray-700"
            />
          )}

          {gerado.hashtags && (
            <CampoTexto
              label="Hashtags"
              valor={gerado.hashtags}
              campo="hashtags"
              copiado={copiado}
              onCopiar={copiar}
              cls="bg-indigo-50 border-indigo-100 text-indigo-700"
            />
          )}
        </div>
      )}

      {/* ── Preview de imagem ── */}
      {gerado.imagemUrl && (
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Imagem gerada</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gerado.imagemUrl}
            alt="Imagem gerada por IA"
            className="w-full rounded-lg border border-gray-200 object-cover max-h-44"
          />
          <button
            onClick={() => gerar('imagem')}
            disabled={bloqueado}
            className="text-xs text-indigo-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↻ Regenerar imagem
          </button>
        </div>
      )}

      {/* ── Preview de áudio ── */}
      {gerado.audioUrl && (
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Áudio gerado</p>
          <audio controls src={gerado.audioUrl} className="w-full h-9" />
          <button
            onClick={() => gerar('audio')}
            disabled={bloqueado}
            className="text-xs text-indigo-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↻ Regenerar áudio
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 pt-1">
        Após gerar texto o status vai para <strong>Revisão</strong> automaticamente.
      </p>
    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function BotaoGerar({
  tipo,
  label,
  ativo,
  bloqueado,
  desabilitado = false,
  title,
  onClick,
}: {
  tipo:         Tipo
  label:        string
  ativo:        boolean
  bloqueado:    boolean
  desabilitado?: boolean
  title?:       string
  onClick:      () => void
}) {
  const disabled = bloqueado || desabilitado

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2.5 ${
        ativo
          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 cursor-wait'
          : desabilitado
          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
          : bloqueado
          ? 'opacity-50 cursor-not-allowed bg-white border-gray-200 text-gray-500'
          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
      }`}
    >
      {/* Ícone */}
      <span className={`text-base flex-shrink-0 ${ativo ? 'animate-bounce' : ''}`}>
        {BOTAO_ICON[tipo]}
      </span>

      {/* Label */}
      <span className="flex-1 truncate">
        {ativo ? LOADING_MSG[tipo] : label}
      </span>

      {/* Dots de loading */}
      {ativo && (
        <span className="flex gap-0.5 flex-shrink-0">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      )}
    </button>
  )
}

function CampoTexto({
  label,
  valor,
  campo,
  copiado,
  onCopiar,
  multiline = false,
  cls,
}: {
  label:    string
  valor:    string
  campo:    string
  copiado:  string | null
  onCopiar: (texto: string, campo: string) => void
  multiline?: boolean
  cls:      string
}) {
  const foiCopiado = copiado === campo

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <button
          onClick={() => onCopiar(valor, campo)}
          className={`text-xs transition-colors ${
            foiCopiado ? 'text-green-600' : 'text-gray-400 hover:text-indigo-600'
          }`}
        >
          {foiCopiado ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      {multiline ? (
        <pre className={`text-xs whitespace-pre-wrap font-sans rounded-lg px-2.5 py-2 border max-h-28 overflow-y-auto leading-relaxed ${cls}`}>
          {valor}
        </pre>
      ) : (
        <p className={`text-xs rounded-lg px-2.5 py-2 border leading-relaxed ${cls}`}>
          {valor}
        </p>
      )}
    </div>
  )
}
