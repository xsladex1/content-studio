'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TIPOS = [
  { value: 'roteiro',  label: 'Roteiro' },
  { value: 'legenda',  label: 'Legenda' },
  { value: 'hashtags', label: 'Hashtags' },
  { value: 'hook',     label: 'Hook' },
  { value: 'analise',  label: 'Análise' },
  { value: 'thumbnail',label: 'Thumbnail' },
]

const PLATAFORMAS = [
  { value: '',             label: 'Universal (todas)' },
  { value: 'tiktok',      label: 'TikTok' },
  { value: 'instagram',   label: 'Instagram' },
  { value: 'youtube',     label: 'YouTube' },
  { value: 'shopee',      label: 'Shopee' },
  { value: 'mercadolivre',label: 'Mercado Livre' },
]

const VARIAVEIS = [
  '{{produto}}', '{{nicho}}', '{{preco}}', '{{beneficio}}',
  '{{dor}}', '{{publico}}', '{{plataforma}}', '{{link}}', '{{descricao}}',
]

type Nicho = { id: string; nome: string; icone: string | null }
type Template = {
  id: string
  titulo: string
  tipo: string
  plataforma: string | null
  nichoId: string | null
  conteudo: string
  ativo: boolean
}

export default function PromptForm({
  nichos,
  template,
}: {
  nichos: Nicho[]
  template?: Template
}) {
  const router = useRouter()
  const isEdit = !!template
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const [form, setForm] = useState({
    titulo:     template?.titulo      ?? '',
    tipo:       template?.tipo        ?? 'roteiro',
    plataforma: template?.plataforma  ?? '',
    nichoId:    template?.nichoId     ?? '',
    conteudo:   template?.conteudo    ?? '',
    ativo:      template?.ativo       ?? true,
  })

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  function inserirVariavel(v: string) {
    const ta = document.getElementById('conteudo') as HTMLTextAreaElement | null
    if (!ta) { set('conteudo', form.conteudo + v); return }
    const s = ta.selectionStart, e = ta.selectionEnd
    const novo = form.conteudo.slice(0, s) + v + form.conteudo.slice(e)
    set('conteudo', novo)
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + v.length; ta.focus() })
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setLoading(true); setError('')
    try {
      const url    = isEdit ? `/api/prompts/${template!.id}` : '/api/prompts'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nichoId: form.nichoId || null, plataforma: form.plataforma || null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Erro') }
      router.push('/prompts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Excluir este template?')) return
    await fetch(`/api/prompts/${template!.id}`, { method: 'DELETE' })
    router.push('/prompts')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="card p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo *</label>
            <select className="select" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Plataforma</label>
            <select className="select" value={form.plataforma} onChange={e => set('plataforma', e.target.value)}>
              {PLATAFORMAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Nicho (opcional)</label>
          <select className="select" value={form.nichoId} onChange={e => set('nichoId', e.target.value)}>
            <option value="">Universal (todos os nichos)</option>
            {nichos.map(n => <option key={n.id} value={n.id}>{n.icone} {n.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Título *</label>
          <input className="input" value={form.titulo} onChange={e => set('titulo', e.target.value)}
            placeholder="Ex: Roteiro TikTok Afiliado 60s" required />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Conteúdo do prompt *</label>
            <span className="text-xs text-gray-400">{form.conteudo.length} caracteres</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {VARIAVEIS.map(v => (
              <button key={v} type="button" onClick={() => inserirVariavel(v)}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono transition-colors">
                {v}
              </button>
            ))}
          </div>
          <textarea
            id="conteudo"
            className="textarea font-mono text-sm"
            rows={12}
            value={form.conteudo}
            onChange={e => set('conteudo', e.target.value)}
            placeholder="Escreva o prompt aqui. Use {{variavel}} para dados dinâmicos do projeto..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Clique nas variáveis acima para inserir no cursor. O sistema substituirá pelos dados reais do projeto na geração.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="ativo" checked={form.ativo}
            onChange={e => set('ativo', e.target.checked)} className="w-4 h-4 text-indigo-600" />
          <label htmlFor="ativo" className="text-sm text-gray-700">Template ativo</label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar Template'}
            </button>
            <Link href="/prompts" className="btn-secondary">Cancelar</Link>
          </div>
          {isEdit && (
            <button type="button" onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 hover:underline">
              Excluir template
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
