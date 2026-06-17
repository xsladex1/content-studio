'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ICONES_SUGERIDOS = ['🛍️', '📚', '💪', '🎬', '💻', '🍕', '✈️', '💰', '🎮', '🌿', '🎵', '📸']

export default function NovoNichoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    icone: '',
    ativo: true,
  })

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/nichos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao criar nicho')
      }
      router.push('/nichos')
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
          <h1 className="page-title">Novo Nicho</h1>
          <p className="page-subtitle">Crie uma categoria para organizar seus projetos e templates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="card p-6 space-y-5">

          <div>
            <label className="label">Nome *</label>
            <input
              className="input"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="Ex: Saúde & Bem-estar"
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
              placeholder="Descreva o foco deste nicho..."
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

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Criando...' : 'Criar Nicho'}
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
