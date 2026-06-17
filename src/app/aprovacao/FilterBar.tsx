'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const PLATAFORMAS = [
  { value: 'tiktok',       label: '🎵 TikTok' },
  { value: 'instagram',    label: '📸 Instagram' },
  { value: 'youtube',      label: '📺 YouTube' },
  { value: 'shopee',       label: '🛍️ Shopee' },
  { value: 'mercadolivre', label: '🛒 Mercado Livre' },
]

type Nicho = { id: string; nome: string; icone: string | null }

export default function FilterBar({ nichos }: { nichos: Nicho[] }) {
  const router = useRouter()
  const sp = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/aprovacao?${params.toString()}`)
  }, [router, sp])

  const temFiltro = sp.get('nicho') || sp.get('plataforma')

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        className="select text-sm py-1.5 w-auto"
        value={sp.get('nicho') ?? ''}
        onChange={e => update('nicho', e.target.value)}
      >
        <option value="">Todos os nichos</option>
        {nichos.map(n => (
          <option key={n.id} value={n.nome}>
            {n.icone} {n.nome}
          </option>
        ))}
      </select>

      <select
        className="select text-sm py-1.5 w-auto"
        value={sp.get('plataforma') ?? ''}
        onChange={e => update('plataforma', e.target.value)}
      >
        <option value="">Todas as plataformas</option>
        {PLATAFORMAS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {temFiltro && (
        <button
          onClick={() => router.push('/aprovacao')}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
        >
          × Limpar
        </button>
      )}
    </div>
  )
}
