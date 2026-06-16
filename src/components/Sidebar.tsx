'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const groups = [
  {
    label: null,
    items: [{ href: '/', label: 'Dashboard', icon: '📊' }],
  },
  {
    label: 'Criação',
    items: [
      { href: '/projetos', label: 'Projetos', icon: '📦' },
      { href: '/conteudos', label: 'Conteúdos', icon: '🎬' },
      { href: '/nichos', label: 'Nichos', icon: '🏷️' },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { href: '/aprovacao', label: 'Aprovação', icon: '✅' },
      { href: '/agenda', label: 'Agenda', icon: '📅' },
    ],
  },
  {
    label: 'Análise',
    items: [
      { href: '/prompts', label: 'Prompts', icon: '💡' },
      { href: '/relatorios', label: 'Relatórios', icon: '📈' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col h-full">
      <div className="px-5 py-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Content</p>
            <p className="text-indigo-400 text-xs font-medium">Studio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-700 space-y-3">
        <p className="text-slate-500 text-xs">v2.0.0 — Content Studio</p>
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
          }}
          className="w-full text-left text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2"
        >
          <span>↩</span> Sair
        </button>
      </div>
    </aside>
  )
}
