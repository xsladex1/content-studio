'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Conteudo } from '@prisma/client'

export default function EditConteudoForm({ conteudo }: { conteudo: Conteudo }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    tituloInterno: conteudo.tituloInterno,
    status: conteudo.status,
    hook: conteudo.hook ?? '',
    roteiro: conteudo.roteiro ?? '',
    legenda: conteudo.legenda ?? '',
    hashtags: conteudo.hashtags ?? '',
    imagemUrl: conteudo.imagemUrl ?? '',
    audioUrl: conteudo.audioUrl ?? '',
    videoUrl: conteudo.videoUrl ?? '',
    thumbnailUrl: conteudo.thumbnailUrl ?? '',
    observacoes: conteudo.observacoes ?? '',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/conteudos/${conteudo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hook: form.hook || null,
          roteiro: form.roteiro || null,
          legenda: form.legenda || null,
          hashtags: form.hashtags || null,
          imagemUrl: form.imagemUrl || null,
          audioUrl: form.audioUrl || null,
          videoUrl: form.videoUrl || null,
          thumbnailUrl: form.thumbnailUrl || null,
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
    if (!confirm('Deletar este conteúdo e todas as publicações vinculadas?')) return
    await fetch(`/api/conteudos/${conteudo.id}`, { method: 'DELETE' })
    router.push('/conteudos')
  }

  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="label">Título</label>
        <input className="input" value={form.tituloInterno} onChange={(e) => set('tituloInterno', e.target.value)} />
      </div>

      <div>
        <label className="label">Status</label>
        <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="rascunho">Rascunho</option>
          <option value="gerando">Gerando</option>
          <option value="revisao">Revisão</option>
          <option value="aprovado">Aprovado</option>
          <option value="pausado">Pausado</option>
        </select>
      </div>

      <div>
        <label className="label">Hook</label>
        <input className="input" value={form.hook} onChange={(e) => set('hook', e.target.value)} placeholder="Abertura do vídeo..." />
      </div>

      <div>
        <label className="label">Legenda</label>
        <textarea className="textarea" rows={2} value={form.legenda} onChange={(e) => set('legenda', e.target.value)} />
      </div>

      <div>
        <label className="label">Hashtags</label>
        <input className="input" value={form.hashtags} onChange={(e) => set('hashtags', e.target.value)} />
      </div>

      <div>
        <label className="label">Roteiro</label>
        <textarea className="textarea" rows={5} value={form.roteiro} onChange={(e) => set('roteiro', e.target.value)} />
      </div>

      {/* Mídia */}
      <div className="border-t pt-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mídia</p>
        <div>
          <label className="label">URL do vídeo</label>
          <input className="input" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">URL da imagem / thumbnail</label>
          <input className="input" value={form.imagemUrl} onChange={(e) => set('imagemUrl', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">URL do áudio / narração</label>
          <input className="input" value={form.audioUrl} onChange={(e) => set('audioUrl', e.target.value)} placeholder="https://..." />
        </div>
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
          🗑️ Deletar conteúdo
        </button>
      </div>
    </div>
  )
}
