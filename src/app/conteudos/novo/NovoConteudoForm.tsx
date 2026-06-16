'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Projeto, Nicho } from '@prisma/client'

type ProjetoComNicho = Projeto & { nicho: Pick<Nicho, 'nome' | 'icone'> }

const PLATAFORMAS = [
  { value: 'tiktok',       label: 'TikTok',        icon: '🎵' },
  { value: 'instagram',    label: 'Instagram',     icon: '📸' },
  { value: 'youtube',      label: 'YouTube',       icon: '📺' },
  { value: 'shopee',       label: 'Shopee',        icon: '🛍️' },
  { value: 'mercadolivre', label: 'Mercado Livre', icon: '🛒' },
]

export default function NovoConteudoForm({
  projetos,
  projetoIdInicial,
}: {
  projetos: ProjetoComNicho[]
  projetoIdInicial?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    projetoId: projetoIdInicial ?? projetos[0]?.id ?? '',
    tituloInterno: '',
    status: 'rascunho',
    hook: '',
    roteiro: '',
    legenda: '',
    hashtags: '',
    observacoes: '',
  })
  const [plataformas, setPlataformas] = useState<string[]>([])

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  function togglePlataforma(value: string) {
    setPlataformas((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (plataformas.length === 0) {
      setError('Selecione ao menos uma plataforma.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/conteudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          plataformas,
          hook: form.hook || null,
          roteiro: form.roteiro || null,
          legenda: form.legenda || null,
          hashtags: form.hashtags || null,
          observacoes: form.observacoes || null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao criar conteúdo')
      const data = await res.json()
      router.push(`/conteudos/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Novo Conteúdo</h1>
          <p className="page-subtitle">Crie uma peça de conteúdo para um ou mais canais</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card p-6 space-y-5">

          <div>
            <label className="label">Projeto *</label>
            <select
              className="select"
              value={form.projetoId}
              onChange={(e) => set('projetoId', e.target.value)}
              required
            >
              <option value="">Selecione um projeto...</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nicho.icone} {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Título interno *</label>
            <input
              className="input"
              value={form.tituloInterno}
              onChange={(e) => set('tituloInterno', e.target.value)}
              placeholder="Ex: Hook dor de cabeça — versão 1"
              required
            />
          </div>

          {/* Seleção de plataformas */}
          <div>
            <label className="label">Plataformas * <span className="text-gray-400 font-normal">(selecione onde vai publicar)</span></label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PLATAFORMAS.map((p) => {
                const ativo = plataformas.includes(p.value)
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => togglePlataforma(p.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      ativo
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="label">Status inicial</label>
            <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="rascunho">Rascunho</option>
              <option value="revisao">Revisão</option>
              <option value="aprovado">Aprovado</option>
            </select>
          </div>

          {/* Conteúdo textual (opcional na criação) */}
          <div className="border-t pt-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conteúdo <span className="font-normal normal-case text-gray-400">(opcional — pode preencher depois)</span></p>

            <div>
              <label className="label">Hook (abertura)</label>
              <input
                className="input"
                value={form.hook}
                onChange={(e) => set('hook', e.target.value)}
                placeholder="Frase de impacto dos primeiros 3 segundos..."
              />
            </div>
            <div>
              <label className="label">Roteiro</label>
              <textarea className="textarea" rows={4} value={form.roteiro} onChange={(e) => set('roteiro', e.target.value)} placeholder="Roteiro completo do vídeo..." />
            </div>
            <div>
              <label className="label">Legenda</label>
              <textarea className="textarea" rows={2} value={form.legenda} onChange={(e) => set('legenda', e.target.value)} />
            </div>
            <div>
              <label className="label">Hashtags</label>
              <input className="input" value={form.hashtags} onChange={(e) => set('hashtags', e.target.value)} placeholder="#conteudo #nicho #produto" />
            </div>
            <div>
              <label className="label">Observações</label>
              <textarea className="textarea" rows={2} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Criando...' : 'Criar Conteúdo'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
