import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Você é um especialista em criação de conteúdo para redes sociais brasileiras.
Gere conteúdo autêntico, persuasivo e adequado para a plataforma indicada.
Responda APENAS com JSON válido neste formato exato (sem texto antes ou depois):
{
  "hook": "frase de abertura impactante, máximo 15 palavras, para parar o scroll",
  "roteiro": "roteiro completo do vídeo (30 a 45 segundos falados), narrativa natural em pt-BR",
  "legenda": "legenda para o post na plataforma, com emoji relevantes",
  "hashtags": "5 a 10 hashtags separadas por espaço, relevantes ao nicho"
}
Idioma: português brasileiro, tom casual e autêntico. Proibido: promessas falsas, garantias de resultado, linguagem de anúncio óbvio.`

export type TextResult = {
  hook: string
  roteiro: string
  legenda: string
  hashtags: string
}

export async function generateText(userPrompt: string): Promise<TextResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.85,
    max_tokens: 1500,
  })

  const raw = response.choices[0].message.content ?? '{}'
  const parsed = JSON.parse(raw) as Partial<TextResult>

  return {
    hook:     parsed.hook     ?? '',
    roteiro:  parsed.roteiro  ?? '',
    legenda:  parsed.legenda  ?? '',
    hashtags: parsed.hashtags ?? '',
  }
}
