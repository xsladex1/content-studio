import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, nome } = body as { email: string; nome: string }

  if (!email || !nome) {
    return NextResponse.json({ error: 'email e nome são obrigatórios' }, { status: 400 })
  }

  // Cria ou atualiza o User no banco
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, nome },
    update: { nome },
  })

  // Envia magic link de convite via Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

  if (error) {
    return NextResponse.json({ error: `Usuário criado mas convite falhou: ${error.message}` }, { status: 207 })
  }

  return NextResponse.json({ ok: true, user })
}
