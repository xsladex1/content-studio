import { createClient } from '@supabase/supabase-js'

// Usamos a service_role key (sem NEXT_PUBLIC_) para escrita no Storage a partir do servidor.
// Nunca expor esta chave ao cliente — só é usada em rotas de API / Server Components.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'conteudo-midia'

export async function uploadBuffer(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })

  if (error) throw new Error(`Upload falhou: ${error.message}`)

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
