# VIDEOS-AFILIADOS

Central local de controle para operação de vídeos de afiliados em TikTok, Shopee Vídeo e Mercado Livre Clips.

## Stack

- **Next.js 14** + App Router
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite** (banco local, sem servidor)
- **Sem autenticação** — sistema exclusivamente local

## Como rodar

### 1. Instalar dependências

```bash
cd VIDEOS-AFILIADOS
npm install
```

### 2. Criar o banco de dados

```bash
npm run db:push
```

### 3. Popular com prompts padrão

```bash
npm run db:seed
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## Funcionalidades da V1

### Dashboard
Visão geral com métricas totais: produtos, vídeos planejados, produzidos, publicados por canal e vencedores.

### Produtos (`/produtos`)
- Cadastro completo de produtos afiliados
- Campos: nome, nicho, plataforma, links, preço, comissão, dor, benefício
- Status: Pesquisando / Aprovado / Pausado / Vencedor
- **Gerador de Prompt** — gera prompt pronto para Claude/ChatGPT criar 10 roteiros

### Vídeos (`/videos`)
- Um produto pode ter múltiplos vídeos (um por canal)
- Campos: hook, roteiro, legenda, hashtags, status, métricas
- Canais: TikTok, Shopee Vídeo, Mercado Livre Clips
- Status: Ideia → Roteiro Pronto → Produzido → Publicado → Testando → Vencedor

### Prompts (`/prompts`)
- Biblioteca de prompts prontos para IA
- Categorias: Roteiro TikTok, Shopee, ML, Legenda, Análise, Recriar Estrutura
- Botão "Copiar" em cada prompt

### Checklist (`/checklist`)
- Tabela visual com todos os vídeos ativos
- 11 itens de checklist por vídeo
- Progresso em % por vídeo
- Atualização automática ao clicar

### Relatórios (`/relatorios`)
- Top produtos por views, cliques e vendas
- Performance por canal
- Vídeos vencedores

---

## Estrutura de pastas operacionais

| Pasta | Uso |
|---|---|
| `PRODUTOS/` | Fichas de produto em markdown |
| `ROTEIROS/` | Roteiros exportados |
| `VIDEOS/` | Arquivos de vídeo |
| `SHOPEE/` | Material específico Shopee |
| `TIKTOK/` | Material específico TikTok |
| `MERCADO-LIVRE/` | Material específico ML |
| `VENCEDORES/` | Cópias dos vídeos vencedores |
| `PERDEDORES/` | Vídeos pausados para análise |
| `PROMPTS/` | Prompts em markdown |
| `RELATORIOS/` | Relatórios exportados |
| `TEMPLATES/` | Templates reutilizáveis |
| `AUTOMACOES/` | Scripts de automação futura |
| `ANALYTICS/` | Dados exportados para análise |

---

## Scripts disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run db:push      # Cria/atualiza banco de dados
npm run db:seed      # Popula prompts padrão
npm run db:studio    # Interface visual do banco (Prisma Studio)
npm run db:reset     # Reseta e recria o banco (CUIDADO: apaga dados)
```

---

## Regras de operação

1. Produto novo → cadastrar em `/produtos` antes de criar roteiros
2. Roteiros → gerar via prompt na página do produto
3. Vídeo produzido → criar em `/videos` com roteiro e metadados
4. Após publicar → atualizar status e data de postagem
5. Após 24h e 72h → preencher métricas (views, cliques, vendas)
6. Produto com resultado superior → marcar como Vencedor
7. Relatório semanal → verificar `/relatorios` toda segunda-feira

---

## Segurança

- Sistema exclusivamente local, sem deploy
- Sem scraping, sem automação proibida
- Publicação na Shopee e ML é manual
- TikTok preparado para API oficial futura
- Ver `SECURITY_RULES.md` para regras detalhadas
