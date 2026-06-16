# CHANGELOG — VIDEOS-AFILIADOS

## [0.1.1] — 2026-05-31

### Adicionado
- Prompt "Gerar Prompt de Vídeo para Higgsfield" na biblioteca (categoria: higgsfield)
- Arquivo `PROMPTS/prompt_higgsfield.md` com meta-prompt, exemplo e dicas
- Categoria `higgsfield` no frontend da página de Prompts (ícone 🎞️, cor violeta)

---

## [0.1.0] — 2026-05-31

### Adicionado
- Projeto base Next.js 14 + TypeScript + Tailwind CSS + Prisma + SQLite
- Schema do banco: Produto, Video, Prompt
- Dashboard com 8 métricas (produtos, vídeos por status/canal, vencedores)
- CRUD completo de Produtos (criar, listar, detalhe, editar, deletar)
- Gerador de Prompt de Roteiros por produto (copia para Claude/ChatGPT)
- CRUD completo de Vídeos (criar, listar, detalhe, editar, deletar)
- Checklist de produção por vídeo (11 itens, persistido automaticamente)
- Biblioteca de Prompts com 6 prompts padrão seedados
- Relatórios: top por views/cliques/vendas, performance por canal, vencedores
- Checklist overview de todos os vídeos ativos com barra de progresso
- Sidebar de navegação com estado ativo
- Estrutura de pastas operacionais (PRODUTOS, ROTEIROS, VIDEOS, etc.)
- Documentação: README, ROADMAP, SECURITY_RULES, TEST_CHECKLIST, CHANGELOG

### Arquitetura
- Server Components para listagens e dashboard (Prisma direto)
- Client Components para formulários e interatividade
- API Routes para todas as mutações (POST, PUT, DELETE)
- SQLite local via Prisma (sem servidor externo)
