import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do Content Studio...\n')

  // ─── 1. USUÁRIO PADRÃO ───────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: 'ruann.aurelio@gmail.com' },
    update: {},
    create: {
      email: 'ruann.aurelio@gmail.com',
      nome: 'Ruann Aurelio',
    },
  })
  console.log(`✓ Usuário: ${user.nome} (${user.email})`)

  // ─── 2. NICHOS ───────────────────────────────────────────────────────────
  const nichos = [
    { nome: 'Afiliados',      icone: '🛍️', descricao: 'Produtos de afiliado (Shopee, Mercado Livre, Amazon, Hotmart)' },
    { nome: 'Educacional',    icone: '📚', descricao: 'Cursos, tutoriais, dicas e conteúdo didático' },
    { nome: 'Lifestyle',      icone: '✨', descricao: 'Bem-estar, rotina, moda, beleza e comportamento' },
    { nome: 'Entretenimento', icone: '🎭', descricao: 'Humor, reações, trends e conteúdo viral' },
    { nome: 'Tech',           icone: '💻', descricao: 'Tecnologia, gadgets, apps e produtividade' },
  ]

  const nichoAfiliados = await prisma.nicho.upsert({
    where: { nome: 'Afiliados' },
    update: {},
    create: nichos[0],
  })

  for (const nicho of nichos) {
    const n = await prisma.nicho.upsert({
      where: { nome: nicho.nome },
      update: {},
      create: nicho,
    })
    console.log(`✓ Nicho: ${n.icone} ${n.nome}`)
  }

  // ─── 3. PROMPT TEMPLATES (migrados dos 7 prompts originais) ──────────────
  const templates = [
    // ── Roteiros por plataforma ──────────────────────────────────────────
    {
      titulo: 'Roteiro para TikTok',
      tipo: 'roteiro',
      plataforma: 'tiktok',
      nichoId: nichoAfiliados.id,
      conteudo: `Crie um roteiro para vídeo TikTok de afiliado.

PRODUTO: {{produto}}
PREÇO: R$ {{preco}}
BENEFÍCIO PRINCIPAL: {{beneficio}}
PÚBLICO-ALVO: {{publico}}
DOR QUE RESOLVE: {{dor}}

ESTRUTURA (máx 45 segundos):

1. HOOK (0–3s): Frase que para o scroll. Use surpresa, curiosidade ou dor.
2. PROBLEMA (3–8s): Mostre a dor de forma específica e real.
3. SOLUÇÃO (8–20s): Apresente o produto como solução. Mostre em uso.
4. PROVA (20–35s): Resultado, número ou prova social rápida.
5. CTA (35–45s): Chamada clara. Ex: "Link na bio", "Comenta QUERO".

REGRAS:
- Linguagem brasileira, informal, como amigo indicando
- Máx 150 palavras no roteiro falado
- Estilo UGC — sem cara de anúncio
- Sem promessas falsas

ENTREGUE em tabela:
| CENA | TEMPO | NARRAÇÃO | TEXTO NA TELA |

Mais: legenda do post + 8 hashtags relevantes.`,
    },
    {
      titulo: 'Roteiro para Shopee Vídeo',
      tipo: 'roteiro',
      plataforma: 'shopee',
      nichoId: nichoAfiliados.id,
      conteudo: `Crie um roteiro para Shopee Vídeo (usuário já está comprando).

PRODUTO: {{produto}}
PREÇO: R$ {{preco}}
DESCONTO/FRETE: {{desconto}}
AVALIAÇÃO: {{avaliacao}}
OBJEÇÃO PRINCIPAL: {{objecao}}

ESTRUTURA (máx 60 segundos):

1. ABERTURA (0–5s): Mostre produto + preço imediatamente.
2. DEMONSTRAÇÃO (5–25s): Produto em uso. Foco no benefício.
3. OBJEÇÃO (25–35s): Responda a principal dúvida do comprador.
4. PROVA SOCIAL (35–45s): Avaliações, vendas, resultado pessoal.
5. CTA (45–55s): "Clica no produto aqui embaixo" + frete grátis/cupom.

GATILHOS para usar:
- Frete grátis (sempre que possível)
- Parcelamento sem juros
- "X mil compradores"
- Proteção ao comprador Shopee

ENTREGUE em tabela:
| CENA | TEMPO | NARRAÇÃO | LEGENDA ON-SCREEN |

Mais: legenda do post + hashtags.`,
    },
    {
      titulo: 'Roteiro para Mercado Livre Clips',
      tipo: 'roteiro',
      plataforma: 'mercadolivre',
      nichoId: nichoAfiliados.id,
      conteudo: `Crie um roteiro para Mercado Livre Clips (tom profissional e confiável).

PRODUTO: {{produto}}
PREÇO: R$ {{preco}}
AVALIAÇÃO: {{avaliacao}}
DIFERENCIAIS: {{diferenciais}}
FAQ: {{faq}}

ESTRUTURA (máx 60 segundos):

1. APRESENTAÇÃO (0–5s): Produto + preço. Direto ao ponto.
2. PARA QUEM É (5–12s): Perfil ideal do comprador.
3. DIFERENCIAIS (12–35s): Mostre os 3 diferenciais em uso real.
4. FAQ (35–45s): Responda a pergunta mais feita.
5. AVALIAÇÃO (45–52s): Sua nota e por que recomenda.
6. CTA (52–60s): "Compra pelo botão aqui no clip".

GATILHOS para usar:
- Entrega Full (chegou rápido)
- Mercado Pontos
- Mercado Pago parcelado
- Compra garantida / devolução fácil
- "Mais de X mil vendidos"

ENTREGUE em tabela:
| CENA | TEMPO | NARRAÇÃO | TEXTO SOBREPOSTO |

Mais: legenda do post + hashtags.`,
    },
    // ── Legenda universal ────────────────────────────────────────────────
    {
      titulo: 'Legenda + Hashtags',
      tipo: 'legenda',
      plataforma: null,
      nichoId: nichoAfiliados.id,
      conteudo: `Crie uma legenda de post e hashtags para vídeo de afiliado.

PRODUTO: {{produto}}
CANAL: {{canal}}
BENEFÍCIO PRINCIPAL: {{beneficio}}
GANCHO DO VÍDEO: {{hook}}
LINK: {{link}}

ENTREGUE:

1. LEGENDA CURTA (máx 150 caracteres): Para TikTok/Shopee. Curiosidade + CTA.

2. LEGENDA LONGA (máx 500 caracteres): Para ML. Mais descritiva, com keywords.

3. HASHTAGS (10 ao total):
   - 3 hashtags de nicho amplo (ex: #fitness)
   - 3 hashtags de nicho específico (ex: #suplementos)
   - 2 hashtags de descoberta (ex: #indicação)
   - 2 hashtags de produto (ex: #fonebluetooth)

REGRAS:
- Sem hashtags genéricas que não convertem (#love, #viral)
- Hashtags em português quando possível
- CTA na legenda que combine com o canal`,
    },
    // ── Análise e replicação ─────────────────────────────────────────────
    {
      titulo: 'Análise de Vídeo Vencedor',
      tipo: 'analise',
      plataforma: null,
      nichoId: nichoAfiliados.id,
      conteudo: `Analise este vídeo vencedor e identifique o que funcionou.

MÉTRICAS DO VÍDEO:
- Views: {{views}}
- Cliques no link: {{cliques}}
- Taxa de clique: {{taxa_clique}}%
- Vendas geradas: {{vendas}}
- Canal: {{canal}}

ROTEIRO ORIGINAL:
{{roteiro}}

ANALISE E RESPONDA:

1. HOOK ANALYSIS: Por que o hook funcionou? Qual gatilho usou?

2. ESTRUTURA VENCEDORA: Qual parte do roteiro gerou mais engajamento provável?

3. AUDIÊNCIA: Qual perfil de pessoa mais provavelmente compraria?

4. ÂNGULO PRINCIPAL: Qual foi o ângulo criativo central?

5. O QUE REPLICAR: Liste 5 elementos específicos para replicar em novos vídeos.

6. VARIAÇÕES SUGERIDAS: Proponha 3 variações deste vídeo para testar.

7. OUTROS PRODUTOS: Quais outros produtos do mesmo nicho este ângulo funcionaria?`,
    },
    {
      titulo: 'Recriar Estrutura Sem Copiar',
      tipo: 'analise',
      plataforma: null,
      nichoId: nichoAfiliados.id,
      conteudo: `Recrie a estrutura de um vídeo vencedor para um produto diferente, sem copiar.

VÍDEO DE REFERÊNCIA:
- Estrutura/ângulo: {{estrutura_ref}}
- Canal: {{canal_ref}}
- Por que funcionou: {{analise_ref}}

NOVO PRODUTO:
- Nome: {{produto}}
- Nicho: {{nicho}}
- Preço: R$ {{preco}}
- Benefício: {{beneficio}}
- Dor: {{dor}}

INSTRUÇÃO:
Crie um roteiro novo que usa a MESMA ESTRUTURA EMOCIONAL e o MESMO ÂNGULO CRIATIVO do vídeo de referência, mas aplicado ao novo produto.

IMPORTANTE:
- Não copie frases, apenas a estrutura
- Adapte o hook para o novo produto
- Mantenha o mesmo ritmo narrativo
- Adapte o CTA para o canal correto

ENTREGUE 3 variações deste roteiro adaptado.`,
    },
    // ── Geração de vídeo com IA ──────────────────────────────────────────
    {
      titulo: 'Prompt de Vídeo para Higgsfield',
      tipo: 'video_ia',
      plataforma: null,
      nichoId: nichoAfiliados.id,
      conteudo: `Com base no produto e roteiro abaixo, escreva um prompt em inglês para gerar um vídeo no Higgsfield.

PRODUTO: {{produto}} — R$ {{preco}} — {{beneficio}} — {{dor}}

ROTEIRO: {{roteiro}}

---

REGRAS DO VÍDEO A GERAR:
- Estilo UGC — parece gravado por usuário real com celular, não por produtora
- Duração alvo: 15 a 25 segundos
- Formato: vertical 9:16
- Câmera: handheld, movimento natural leve, sem gimbal ou estabilização exagerada
- Abertura (0–3s): mostrar o PROBLEMA de forma visual e direta, sem produto ainda
- Meio (3–18s): produto sendo usado, resolvendo o problema visivelmente
- Final (18–25s): expressão de satisfação, produto em destaque próximo à câmera
- Iluminação: luz natural, ambiente doméstico ou cotidiano real (cozinha, quarto, rua)
- Personagem: homem ou mulher comum, 25–40 anos, aparência natural
- Sem texto sobreposto excessivo na cena
- Sem efeitos visuais artificiais ou transições exageradas

---

FORMATO DE SAÍDA:
Escreva APENAS o prompt em inglês, pronto para colar no Higgsfield.
Máximo 150 palavras. Estrutura em 3 blocos:

1. Scene setup — ambiente, personagem, problema visual nos primeiros segundos
2. Core action — produto em uso, resolução visual do problema
3. Closing shot — reação genuína + produto em destaque final

Seja específico e visual. Use linguagem cinematográfica simples.
Não inclua explicações, só o prompt final.`,
    },
  ]

  // Limpa templates existentes e recria
  await prisma.promptTemplate.deleteMany()
  for (const t of templates) {
    await prisma.promptTemplate.create({ data: t })
    console.log(`✓ PromptTemplate: [${t.tipo}${t.plataforma ? '/' + t.plataforma : '/universal'}] ${t.titulo}`)
  }

  console.log(`\n✅ Seed concluído:`)
  console.log(`   1 usuário · ${nichos.length} nichos · ${templates.length} prompt templates`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
