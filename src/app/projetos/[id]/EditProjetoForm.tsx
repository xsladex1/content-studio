'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Nicho, Projeto } from '@prisma/client'

const TIPOS = [
  { value: 'afiliado',       label: 'Afiliado' },
  { value: 'educacional',    label: 'Educacional' },
  { value: 'lifestyle',      label: 'Lifestyle' },
  { value: 'marca',          label: 'Marca' },
  { value: 'entretenimento', label: 'Entretenimento' },
]

const PLATAFORMAS_ORIGEM = ['Shopee', 'Mercado Livre', 'Amazon', 'Hotmart', 'Monetizze', 'Eduzz', 'Outro']

type Props = {
  projeto: Projeto
  nichos: Nicho[]
}

export default function EditProjetoForm({ projeto, nichos }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nichoId: projeto.nichoId,
    nome: projeto.nome,
    tipo: projeto.tipo,
    status: projeto.status,
    linkProduto: projeto.linkProduto ?? '',
    linkAfiliado: projeto.linkAfiliado ?? '',
    preco: projeto.preco?.toString() ?? '',
    comissaoEstimada: projeto.comissaoEstimada?.toString() ?? '',
    plataformaOrigem: projeto.plataformaOrigem ?? '',
    descricao: projeto.descricao ?? '',
    publicoAlvo: projeto.publicoAlvo ?? '',
    dorQueResolve: projeto.dorQueResolve ?? '',
    beneficioPrincipal: projeto.beneficioPrincipal ?? '',
    observacoes: projeto.observacoes ?? '',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const isAfiliado = form.tipo === 'afiliado'

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/projetos/${projeto.id}`, {
        method: 'PUT',
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
      if (!res.ok) throw new Error('Erro ao salvar')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Deletar este projeto e todos os conteúdos vinculados?')) return
    await fetch(`/api/projetos/${projeto.id}`, { method: 'DELETE' })
    router.push('/projetos')
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nicho</label>
          <select className="select" value={form.nichoId} onChange={(e) => set('nichoId', e.target.value)}>
            {nichos.map((n) => (
              <option key={n.id} value={n.id}>{n.icone} {n.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="select" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Nome</label>
        <input className="input" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
      </div>

      <div>
        <label className="label">Status</label>
        <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="ativo">Ativo</option>
          <option value="pausado">Pausado</option>
          <option value="arquivado">Arquivado</option>
        </select>
      </div>

      {isAfiliado && (
        <>
          <div>
            <label className="label">Plataforma</label>
            <select className="select" value={form.plataformaOrigem} onChange={(e) => set('plataformaOrigem', e.target.value)}>
              <option value="">—</option>
              {PLATAFORMAS_ORIGEM.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Preço (R$)</label>
              <input className="input" type="number" step="0.01" value={form.preco} onChange={(e) => set('preco', e.target.value)} />
            </div>
            <div>
              <label className="label">Comissão (%)</label>
              <input className="input" type="number" step="0.1" value={form.comissaoEstimada} onChange={(e) => set('comissaoEstimada', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Link produto</label>
            <input className="input" type="url" value={form.linkProduto} onChange={(e) => set('linkProduto', e.target.value)} />
          </div>
          <div>
            <label className="label">Link afiliado</label>
            <input className="input" type="url" value={form.linkAfiliado} onChange={(e) => set('linkAfiliado', e.target.value)} />
          </div>
        </>
      )}

      <div>
        <label className="label">Público-alvo</label>
        <input className="input" value={form.publicoAlvo} onChange={(e) => set('publicoAlvo', e.target.value)} />
      </div>
      <div>
        <label className="label">Dor / Problema</label>
        <textarea className="textarea" rows={2} value={form.dorQueResolve} onChange={(e) => set('dorQueResolve', e.target.value)} />
      </div>
      <div>
        <label className="label">Benefício principal</label>
        <textarea className="textarea" rows={2} value={form.beneficioPrincipal} onChange={(e) => set('beneficioPrincipal', e.target.value)} />
      </div>
      <div>
        <label className="label">Observações</label>
        <textarea className="textarea" rows={2} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <div className="pt-1 space-y-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full btn-primary justify-center ${saved ? '!bg-green-600' : ''}`}
        >
          {saved ? '✓ Salvo!' : loading ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button onClick={handleDelete} className="w-full btn-danger justify-center text-xs">
          🗑️ Deletar projeto
        </button>
      </div>
    </div>
  )
}
