import type { Projeto, Nicho } from '@prisma/client'

type ProjetoComNicho = Projeto & { nicho: Nicho }

export function generateRoteirosPrompt(projeto: ProjetoComNicho): string {
  return `# Gerador de Roteiros — ${projeto.nome}

## Dados do Projeto
- **Nome:** ${projeto.nome}
- **Nicho:** ${projeto.nicho.nome}
- **Tipo:** ${projeto.tipo}${projeto.preco ? `\n- **Preço:** R$ ${projeto.preco.toFixed(2)}` : ''}${projeto.comissaoEstimada ? `\n- **Comissão estimada:** ${projeto.comissaoEstimada}%` : ''}${projeto.plataformaOrigem ? `\n- **Plataforma de origem:** ${projeto.plataformaOrigem}` : ''}${projeto.dorQueResolve ? `\n- **Dor que resolve:** ${projeto.dorQueResolve}` : ''}${projeto.beneficioPrincipal ? `\n- **Benefício principal:** ${projeto.beneficioPrincipal}` : ''}${projeto.publicoAlvo ? `\n- **Público-alvo:** ${projeto.publicoAlvo}` : ''}${projeto.observacoes ? `\n- **Observações:** ${projeto.observacoes}` : ''}

---

## Sua tarefa

Crie **10 roteiros curtos** para vídeos de conteúdo deste projeto.

Cada roteiro deve conter:
1. **Hook** — primeiros 3 segundos, frase que para o scroll imediatamente
2. **Narração** — corpo do vídeo (máximo 30 segundos de fala)
3. **Texto na tela** — legendas sobrepostas em cada cena
4. **CTA** — chamada para ação final clara e direta
5. **Legenda** — texto completo para publicação no post
6. **Hashtags** — 5 a 10 hashtags relevantes ao nicho

---

## Adapte cada roteiro para os canais selecionados

### TikTok
- Tom informal, divertido, curioso, como um amigo indicando
- Foco em viralidade e descoberta
- Use gatilhos de curiosidade, surpresa ou transformação

### Instagram Reels
- Tom aspiracional e visual
- Foco em estética e engajamento
- CTA para salvar e compartilhar

### YouTube Shorts
- Tom educativo ou de review
- Foco em valor e credibilidade
- CTA para inscrição

---

## Regras obrigatórias
- Linguagem brasileira simples e natural — sem erros gramaticais
- Estilo UGC — parece usuário real recomendando, não anúncio
- Sem promessas falsas, exageradas ou garantias de resultado
- Sem copiar estrutura ou texto de criativos de terceiros
- Foco em benefícios reais e verificáveis

---

## Formato de entrega

Para cada roteiro use exatamente este formato:

---
### Roteiro [N] — [tema/ângulo do hook]

**Hook:** [frase de abertura — máx 10 palavras]

**Roteiro:**
| Cena | Narração | Texto na tela |
|------|----------|---------------|
| Hook (0–3s) | ... | ... |
| Problema (3–8s) | ... | ... |
| Solução (8–20s) | ... | ... |
| Prova (20–35s) | ... | ... |
| CTA (35–45s) | ... | ... |

**Legenda:** ...
**Hashtags:** ...

---

Entregue os 10 roteiros completos.`
}
