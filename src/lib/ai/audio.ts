import OpenAI from 'openai'
import { uploadBuffer } from '@/lib/storage'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type AudioResult = {
  audioUrl: string
}

type Voz = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

export async function generateAudio(params: {
  conteudoId: string
  roteiro: string
  voz?: Voz
}): Promise<AudioResult> {
  const { conteudoId, roteiro, voz = 'nova' } = params

  if (!roteiro.trim()) {
    throw new Error('Roteiro não pode estar vazio para gerar áudio')
  }

  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voz,
    input: roteiro,
    response_format: 'mp3',
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  const path = `audios/${conteudoId}_${Date.now()}.mp3`
  const audioUrl = await uploadBuffer(buffer, path, 'audio/mpeg')

  return { audioUrl }
}
