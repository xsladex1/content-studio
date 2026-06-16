import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Chamado pelo Supabase após o usuário clicar no magic link
// Troca o code da URL por uma sessão válida e redireciona para o app
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Falha na troca do code → volta para login com erro
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
