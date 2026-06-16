'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Nicho } from '@prisma/client'

const TIPOS = [
  { value: 'afiliado',       label: 'Afiliado' },
  { value: 'educacional',    label: 'Educacional' },
  { value: 'lifestyle',      label: 'Lifestyle' },
  { value: 'marca',          label: 'Marca' },
  { value: 'entretenimento', label: 'Entretenimento' },
]

const PLATAFORMAS_ORIGEM = ['Shopee', 'Mercado Livre', 'Amazon', 'Hotmart', 'Monetizze', 'Eduzz', 'Outro']

export default function NovoProjetoForm({ nichos }: { nichos: Nicho[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nichoId: nichos[0]?.id ?? '',
    nome: '',
    tipo: 'afiliado',
    status: 'ativo',
    // afiliado
    linkProduto: '',
    linkAfiliado: '',
    preco: '',
    comissaoEstimada: '',
    plataformaOrigem: '',
    // geral
    descricao: '',
    publicoAlvo: '',
    dorQueResolve: '',
    beneficioPrincipal: '',
    observacoes: '',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const isAfiliado = form.tipo === 'afiliado'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preco: form.preco ? parseFloat(form.preco) : null,
          comissaoEstimada: form.comissaoEstimada ? parseFloat(form.comissaoEstimada) : null,
          linkProduto: form.linkProduto || null,
          linkAfiliado: form.linkAfiliado || null,
          plataformaOrigem: form.plataformaOrigem || null,
          descricao: form.descricao || null,
          publicoAlvo: form.publicoAlvo || null,
          dorQueResolve: form.dorQueResolve || null,
          beneficioPrincipal: form.beneficioPrincipal || null,
          observacoes: form.observacoes || null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao criar projeto')
      const data = await res.json()
      router.push(`/projetos/${data.id}`)
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
          <h1 className="page-title">Novo Projeto</h1>
          <p className="page-subtitle">Crie um projeto para organizar seu conteúdo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card p-6 space-y-5">

          {/* Identificação */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nicho *</label>
              <select className="select" value={form.nichoId} onChange={(e) => set('nichoId', e.target.value)} required>
                {nichos.map((n) => (
                  <option key={n.id} value={n.id}>{n.icone} {n.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select className="select" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Nome do projeto *</label>
            <input
              className="input"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder={isAfiliado ? 'Ex: Fone Bluetooth XYZ' : 'Ex: Canal de Produtividade'}
              required
            />
          </div>

          {/* Campos de afiliado */}
          {isAfiliado && (
            <div className="border-t pt-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dados do Produto Afiliado</p>

              <div>
                <label className="label">Plataforma de origem</label>
                <select className="select" value={form.plataformaOrigem} onChange={(e) => set('plataformaOrigem', e.target.value)}>
                  <option value="">Selecione...</option>
                  {PLATAFORMAS_ORIGEM.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Preço (R$)</label>
                  <input className="input" type="number" step="0.01" min="0" value={form.preco} onChange={(e) => set('preco', e.target.value)} placeholder="0,00" />
                </div>
                <div>
                  <label className="label">Comissão estimada (%)</label>
                  <input className="input" type="number" step="0.1" min="0" max="100" value={form.comissaoEstimada} onChange={(e) => set('comissaoEstimada', e.target.value)} placeholder="0" />
                </div>
              </div>

              <div>
                <label className="label">Link do produto</label>
                <input className="input" type="url" value={form.linkProduto} onChange={(e) => set('linkProduto', e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Link de afiliado</label>
                <input className="input" type="url" value={form.linkAfiliado} onChange={(e) => set('linkAfiliado', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          )}

          {/* Campos gerais */}
          <div className="border-t pt-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contexto para IA</p>

            <div>
              <label className="label">Público-alvo</label>
              <input className="input" value={form.publicoAlvo} onChange={(e) => set('publicoAlvo', e.target.value)} placeholder="Ex: mulheres 25-40 anos que querem emagrecer" />
            </div>
            <div>
              <label className="label">{isAfiliado ? 'Dor que o produto resolve' : 'Problema que o conteúdo resolve'}</label>
              <textarea className="textarea" rows={2} value={form.dorQueResolve} onChange={(e) => set('dorQueResolve', e.target.value)} placeholder="Descreva o problema principal..." />
            </div>
            <div>
              <label className="label">Benefício principal</label>
              <textarea className="textarea" rows={2} value={form.beneficioPrincipal} onChange={(e) => set('beneficioPrincipal', e.target.value)} placeholder="O que muda na vida do público..." />
            </div>
            <div>
              <label className="label">Observações</label>
              <textarea className="textarea" rows={2} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Criando...' : 'Criar Projeto'}
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
