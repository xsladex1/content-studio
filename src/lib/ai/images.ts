import OpenAI from 'openai'
import { uploadBuffer } from '@/lib/storage'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type ImageResult = {
  imagemUrl: string
  promptUsado: string
}

export async function generateImage(params: {
  conteudoId: string
  hook?: string | null
  roteiro?: string | null
  nomeProjetoNicho: string
  plataforma?: string
}): Promise<ImageResult> {
  const { conteudoId, hook, roteiro, nomeProjetoNicho, plataforma = 'tiktok' } = params

  const contexto = hook ?? roteiro?.slice(0, 200) ?? nomeProjetoNicho

  const dallePrompt = [
    `Crie uma imagem de alta qualidade para thumbnail de vídeo curto sobre: "${contexto}".`,
    `Contexto: ${nomeProjetoNicho}.`,
    `Estilo: chamativo, vibrante, estética brasileira moderna, adequado para ${plataforma}.`,
    'Sem texto sobreposto na imagem. Fundo limpo. Composição centrada e impactante.',
    'Proporção quadrada, resolução alta.',
  ].join(' ')

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: dallePrompt,
    size: '1024x1024',
    quality: 'standard',
    n: 1,
  })

  const tempUrl = response.data?.[0]?.url
  if (!tempUrl) throw new Error('DALL-E não retornou URL de imagem')

  // Download da URL temporária (~1h de validade) e upload para o Storage permanente
  const resp = await fetch(tempUrl)
  if (!resp.ok) throw new Error('Falha ao baixar imagem do DALL-E')
  const buffer = Buffer.from(await resp.arrayBuffer())

  const path = `imagens/${conteudoId}_${Date.now()}.png`
  const imagemUrl = await uploadBuffer(buffer, path, 'image/png')

  return { imagemUrl, promptUsado: dallePrompt }
}
