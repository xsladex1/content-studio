'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const ICONES_SUGERIDOS = ['🛍️', '📚', '💪', '🎬', '💻', '🍕', '✈️', '💰', '🎮', '🌿', '🎵', '📸']

export default function EditNichoPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [nicho, setNicho] = useState<{
    id: string
    nome: string
    descricao: string | null
    icone: string | null
    ativo: boolean
    _count: { projetos: number; promptTemplates: number }
  } | null>(null)

  const [form, setForm] = useState({ nome: '', descricao: '', icone: '', ativo: true })

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  useEffect(() => {
    setLoading(true)
    fetch(`/api/nichos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setNicho(data)
        setForm({
          nome: data.nome ?? '',
          descricao: data.descricao ?? '',
          icone: data.icone ?? '',
          ativo: data.ativo ?? true,
        })
      })
      .catch(() => setError('Erro ao carregar nicho'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/nichos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      router.push('/nichos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este nicho?')) return
    try {
      const res = await fetch(`/api/nichos/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao excluir')
      router.push('/nichos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Carregando...</div>
  if (!nicho && !loading) return <div className="p-8 text-red-500">Nicho não encontrado.</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {form.icone || '🏷️'} {form.nome || 'Editar Nicho'}
          </h1>
          <p className="page-subtitle">
            {nicho?._count.projetos ?? 0} projeto{(nicho?._count.projetos ?? 0) !== 1 ? 's' : ''} · {nicho?._count.promptTemplates ?? 0} template{(nicho?._count.promptTemplates ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/nichos" className="btn-secondary">← Voltar</Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="card p-6 space-y-5">

          <div>
            <label className="label">Nome *</label>
            <input
              className="input"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Ícone</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ICONES_SUGERIDOS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => set('icone', ic)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center border-2 transition-colors ${
                    form.icone === ic
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
            <input
              className="input"
              value={form.icone}
              onChange={(e) => set('icone', e.target.value)}
              placeholder="Ou cole um emoji aqui"
              maxLength={4}
            />
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea
              className="textarea"
              rows={3}
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ativo"
              checked={form.ativo}
              onChange={(e) => set('ativo', e.target.checked)}
              className="w-4 h-4 text-indigo-600"
            />
            <label htmlFor="ativo" className="text-sm text-gray-700">Nicho ativo</label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary">
                Cancelar
              </button>
            </div>
            {(nicho?._count.projetos ?? 0) === 0 && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-500 hover:text-red-700 hover:underline"
              >
                Excluir nicho
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
