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
- [ ] Adicionar OPENAI_API_KEY no .env e no Vercel
- [ ] Criar src/lib/ai/text.ts — geração de roteiro e legenda
- [ ] Criar src/lib/ai/images.ts — geração de imagem
- [ ] Criar src/lib/ai/audio.ts — narração TTS

### 2.2 Sistema de Jobs assíncronos
- [ ] Criar /api/ai/generate — dispara job de geração
- [ ] Criar /api/ai/jobs/[jobId] — polling de status
- [ ] Implementar lógica de atualização do JobIA no banco
- [ ] Testar fluxo completo de job

### 2.3 Supabase Storage para mídia
- [ ] Criar bucket conteudo-midia no Supabase Storage
- [ ] Configurar políticas de acesso
- [ ] Criar src/lib/storage.ts — upload de imagem e áudio
- [ ] Salvar URLs no model Conteudo após geração

### 2.4 Interface de geração
- [ ] Botão "Gerar com IA" na página /conteudos/novo
- [ ] Loading state com progresso
- [ ] Preview inline do resultado
- [ ] Botão "Regenerar" por campo

### 2.5 Templates por nicho
- [ ] Interface para criar/editar PromptTemplates em /prompts
- [ ] Seletor de template na geração de conteúdo
- [ ] Templates padrão por plataforma

## FASE 3 — Dashboard de aprovação

### 3.1 Fila de aprovação
- [x] Criar /aprovacao — lista de conteúdos aguardando revisão
- [ ] Card com preview de imagem, roteiro e legenda
- [ ] Ações: Aprovar / Pedir refazer / Editar manualmente
- [ ] Filtros por nicho, plataforma e data

### 3.2 Preview por plataforma
- [ ] Componente MediaPreview — moldura de celular para TikTok/Reels
- [ ] Preview de feed para Instagram
- [ ] Preview de thumbnail para YouTube

### 3.3 Editor inline
- [ ] Editar roteiro diretamente no card
- [ ] Editar legenda e hashtags por plataforma
- [ ] Autosave a cada 3 segundos

### 3.4 Geração de vídeo pós-aprovação
- [ ] Botão "Gerar vídeo" apenas após aprovação
- [ ] Exportar assets para edição manual no CapCut
- [ ] Player de vídeo inline

## FASE 4 — Agendamento e publicação

### 4.1 Calendário de agendamento
- [x] Criar /agenda com calendário visual
- [ ] Arrastar conteúdo para horário no calendário
- [ ] Visualizar por plataforma

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
- [ ] Botão "Publicar agora" no card aprovado
- [ ] Seletor de plataformas
- [ ] Confirmação antes de publicar

## FASE 5 — Equipe, métricas e escala

### 5.1 Suporte a equipe
- [ ] Sistema de convite por email
- [ ] Perfis: Admin / Editor / Visualizador
- [ ] Log de ações por usuário

### 5.2 Métricas reais
- [ ] Buscar métricas via API 24h após publicação
- [ ] Dashboard de performance por nicho e plataforma
- [ ] Ranking de conteúdos mais performáticos

### 5.3 Inteligência do sistema
- [ ] Anti-repetição de temas (últimos 30 dias por nicho)
- [ ] Sugestão automática de tema baseada em performance
- [ ] Alerta de conteúdo acima da média

### 5.4 HERMES como orquestrador
- [ ] HERMES recebe objetivo do dia e gera conteúdo
- [ ] Coloca na fila de aprovação automaticamente
- [ ] Loop de aprendizado com base em performance

### 5.5 Novos canais
- [ ] Pinterest
- [ ] LinkedIn
- [ ] Kwai
- [ ] Twitter/X
