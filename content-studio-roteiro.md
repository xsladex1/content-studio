# Content Studio — Roteiro de Desenvolvimento
_Última atualização: Junho 2026_

## Visão do produto
Plataforma completa de criação, revisão e publicação de conteúdo para múltiplos canais (TikTok, Instagram, YouTube e outros). Você gera com IA, revisa no celular, aprova e publica com 1 clique.

## Status atual
- [x] Schema Prisma v2 criado e migrado no Supabase
- [x] 7 tabelas criadas: User, Nicho, Projeto, Conteudo, PublicacaoPlataforma, JobIA, PromptTemplate
- [x] Seed completo rodado
- [x] 1 usuário criado: Ruann Aurelio (ruann.aurelio@gmail.com)
- [x] 5 nichos criados: Afiliados, Educacional, Lifestyle, Entretenimento, Tech
- [x] 7 PromptTemplates migrados com variáveis {{produto}}, {{preco}}, {{beneficio}} e filtros por plataforma e nicho
- [ ] Autenticação
- [ ] Refatoração das rotas e páginas existentes
- [ ] Geração de conteúdo com IA
- [ ] Dashboard de aprovação
- [ ] Agendamento e publicação

## FASE 1 — Fundação segura

### 1.1 Segurança imediata
- [x] Trocar senha do Supabase (Project Settings → Database → Reset password)
- [x] Atualizar .env com nova senha
- [x] Adicionar .env no .gitignore (verificar se já está)

### 1.2 Seed completo
- [x] Rodar seed com usuário padrão (ruann.aurelio@gmail.com)
- [x] Nichos base: Afiliados, Educacional, Lifestyle, Entretenimento, Tech
- [x] 7 PromptTemplates migrados do seed antigo
- [x] Verificar no Supabase que os dados estão lá

### 1.3 Autenticação com Supabase Auth
- [x] Instalar @supabase/supabase-js e @supabase/ssr
- [x] Criar utils/supabase/server.ts e utils/supabase/client.ts
- [x] Criar middleware de autenticação (middleware.ts)
- [x] Criar página de login (/login)
- [x] Proteger todas as rotas autenticadas
- [x] Testar login com ruann.aurelio@gmail.com

### 1.4 Refatoração das rotas existentes
- [x] Renomear /api/videos → /api/conteudos
- [x] Renomear /api/produtos → /api/projetos
- [x] Atualizar /api/dashboard para novo schema
- [x] Atualizar /api/prompts para PromptTemplate
- [x] Remover dados hardcoded

### 1.5 Refatoração das páginas existentes
- [x] Atualizar Sidebar (nome, logo, novos itens de nav)
- [x] Renomear /videos → /conteudos
- [x] Renomear /produtos → /projetos
- [x] Atualizar Dashboard com métricas do novo schema
- [x] Atualizar /relatorios para novo schema

### 1.6 Páginas novas da Fase 1
- [x] /nichos — CRUD de nichos
- [x] /projetos/novo — form generalizado
- [x] /conteudos/novo — form com seleção de nicho e plataforma

## FASE 2 — Geração de conteúdo com IA

### 2.1 Configuração das APIs de IA
- [x] Adicionar OPENAI_API_KEY no .env e no Vercel
- [x] Criar src/lib/ai/text.ts — geração de roteiro e legenda
- [x] Criar src/lib/ai/images.ts — geração de imagem
- [x] Criar src/lib/ai/audio.ts — narração TTS

### 2.2 Sistema de Jobs assíncronos
- [x] Criar /api/ai/generate — dispara job de geração
- [x] Criar /api/ai/jobs/[jobId] — polling de status
- [x] Implementar lógica de atualização do JobIA no banco
- [ ] Testar fluxo completo de job (aguardando créditos OpenAI)

### 2.3 Supabase Storage para mídia
- [x] Criar bucket conteudo-midia no Supabase Storage
- [ ] Configurar políticas de acesso (requer SUPABASE_SERVICE_ROLE_KEY no .env)
- [x] Criar src/lib/storage.ts — upload de imagem e áudio
- [x] Salvar URLs no model Conteudo após geração

### 2.4 Interface de geração
- [x] Botão "Gerar com IA" na página /conteudos/[id]
- [x] Loading state com progresso por tipo (texto/imagem/áudio)
- [x] Preview inline do resultado (hook, roteiro, legenda, hashtags, imagem, áudio)
- [x] Botão "Regenerar" por campo de texto e por mídia

### 2.5 Templates por nicho
- [x] Interface para criar/editar PromptTemplates em /prompts
- [x] Seletor de template na geração de conteúdo
- [x] Templates padrão por plataforma

## FASE 3 — Dashboard de aprovação

### 3.1 Fila de aprovação
- [x] Criar /aprovacao — lista de conteúdos aguardando revisão
- [x] Card com preview de imagem, roteiro e legenda
- [x] Ações: Aprovar / Pedir refazer / Editar manualmente
- [x] Filtros por nicho, plataforma e data

### 3.2 Preview por plataforma
- [x] Componente MediaPreview — moldura de celular para TikTok/Reels
- [x] Preview de feed para Instagram
- [x] Preview de thumbnail para YouTube

### 3.3 Editor inline
- [x] Editar roteiro diretamente no card
- [x] Editar legenda e hashtags por plataforma
- [x] Autosave a cada 3 segundos

### 3.4 Geração de vídeo pós-aprovação
- [ ] Botão "Gerar vídeo" apenas após aprovação (aguarda integração de vídeo)
- [x] Exportar assets para edição manual no CapCut
- [x] Player de vídeo inline

## FASE 4 — Agendamento e publicação

### 4.1 Calendário de agendamento
- [x] Criar /agenda com calendário visual
- [x] Date/time picker por plataforma em /conteudos/[id]
- [x] Visualizar por plataforma na agenda

### 4.2 Integração TikTok
- [ ] Configurar TikTok Content Posting API
- [ ] Criar /api/publicar/tiktok
- [ ] Salvar externalId e urlPublicacao no banco

### 4.3 Integração Instagram
- [ ] Configurar Instagram Graph API
- [ ] Criar /api/publicar/instagram
- [ ] Suporte a Stories e Feed

### 4.4 Integração YouTube
- [ ] Configurar YouTube Data API v3
- [ ] Criar /api/publicar/youtube
- [ ] Upload de thumbnail customizada

### 4.5 Publicação com 1 clique
- [x] Botão "Publicar agora" no card aprovado (marca status publicando)
- [x] Seletor de plataformas (por publicacao individual)
- [ ] Integração real com APIs de cada plataforma (Fases 4.2–4.4)

## FASE 5 — Equipe, métricas e escala

### 5.1 Suporte a equipe
- [x] Sistema de convite por email (/configuracoes/equipe)
- [ ] Perfis: Admin / Editor / Visualizador (aguarda migration add_user_role_ativo)
- [ ] Log de ações por usuário

### 5.2 Métricas reais
- [ ] Buscar métricas via API 24h após publicação (aguarda OAuth por plataforma)
- [ ] Dashboard de performance por nicho e plataforma
- [ ] Ranking de conteúdos mais performáticos

### 5.3 Inteligência do sistema
- [x] Anti-repetição de temas: /api/sugestoes analisa últimos 30 dias
- [x] Sugestão automática de tema com GPT-4o
- [ ] Alerta de conteúdo acima da média (aguarda métricas reais)

### 5.4 HERMES como orquestrador
- [x] /hermes — recebe objetivo do dia e planeja N conteúdos com GPT-4o
- [x] Cria rascunhos automaticamente na fila de aprovação
- [ ] Loop de aprendizado com base em performance (aguarda métricas)

### 5.5 Novos canais
- [ ] Pinterest
- [ ] LinkedIn
- [ ] Kwai
- [ ] Twitter/X
