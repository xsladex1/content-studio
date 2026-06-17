'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InviteForm() {
  const router = useRouter()
  const [form, setForm]     = useState({ email: '', nome: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok && res.status !== 207) throw new Error(data.error ?? 'Erro')
      setMsg({ type: 'ok', text: res.status === 207 ? data.error : `Convite enviado para ${form.email}!` })
      setForm({ email: '', nome: '' })
      router.refresh()
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro ao convidar' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 max-w-lg">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Convidar novo membro</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input className="input" required placeholder="Nome do membro"
            value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" required placeholder="email@exemplo.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>

        {msg && (
          <div className={`text-sm px-3 py-2 rounded-lg ${
            msg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Enviando convite...' : 'Enviar convite por email'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">
          <strong>Em breve:</strong> Perfis de acesso (Admin / Editor / Viewer) serão adicionados na próxima versão do banco de dados.
        </p>
      </div>
    </div>
  )
}
