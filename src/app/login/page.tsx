'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('ruann.aurelio@gmail.com')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }

    setEnviado(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Content Studio</h1>
          <p className="text-slate-400 text-sm mt-1">Plataforma de criação de conteúdo com IA</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {enviado ? (
            /* Estado: link enviado */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifique seu e-mail</h2>
              <p className="text-sm text-gray-500 mb-1">
                Enviamos um link de acesso para:
              </p>
              <p className="text-sm font-medium text-indigo-600 mb-6">{email}</p>
              <p className="text-xs text-gray-400 mb-6">
                Clique no link do e-mail para entrar. O link expira em 1 hora.
              </p>
              <button
                onClick={() => { setEnviado(false); setErro('') }}
                className="text-sm text-indigo-600 hover:underline"
              >
                Tentar com outro e-mail
              </button>
            </div>
          ) : (
            /* Estado: formulário */
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Entrar</h2>
              <p className="text-sm text-gray-500 mb-6">
                Vamos enviar um link de acesso para o seu e-mail.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>

                {erro && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    <p className="text-sm text-red-600">{erro}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar link de acesso'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Acesso restrito · Content Studio v2.0
        </p>
      </div>
    </div>
  )
}
