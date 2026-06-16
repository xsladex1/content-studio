# TEST_CHECKLIST.md — Como testar o sistema

## Setup inicial

- [ ] `npm install` executou sem erros
- [ ] `npm run db:push` criou o arquivo `prisma/dev.db`
- [ ] `npm run db:seed` populou os 6 prompts padrão
- [ ] `npm run dev` iniciou na porta 3000
- [ ] http://localhost:3000 abriu sem erros

## Dashboard

- [ ] Dashboard carrega com contadores zerados
- [ ] Links "Novo Produto" e "Novo Vídeo" funcionam
- [ ] Links "Ver todos" nas listas funcionam

## Produtos

- [ ] Página `/produtos` lista produtos (vazia inicialmente)
- [ ] `/produtos/novo` abre formulário
- [ ] Formulário valida campos obrigatórios
- [ ] Criação de produto redireciona para detalhe
- [ ] Página de detalhe exibe todos os campos
- [ ] Botão "Gerar Prompt de Roteiros" exibe o prompt
- [ ] Botão "Copiar" no prompt funciona (clipboard)
- [ ] Edição de produto salva corretamente
- [ ] Status do produto pode ser alterado
- [ ] Links "Ver produto" e "Link afiliado" abrem em nova aba
- [ ] Deletar produto remove vídeos vinculados

## Vídeos

- [ ] Página `/videos` lista vídeos
- [ ] `/videos/novo` carrega lista de produtos no dropdown
- [ ] Criação de vídeo redireciona para detalhe
- [ ] Métricas (views, cliques, vendas) aparecem no detalhe
- [ ] Edição de vídeo salva corretamente
- [ ] Atualização de métricas reflete no dashboard
- [ ] Checklist persiste entre recarregamentos da página
- [ ] Barra de progresso do checklist atualiza ao marcar itens

## Prompts

- [ ] Página `/prompts` exibe os 6 prompts do seed
- [ ] Botão "Copiar" de cada prompt funciona
- [ ] Prompts agrupados por categoria

## Checklist

- [ ] Tabela exibe todos os vídeos ativos
- [ ] Vídeos com status "pausado" não aparecem
- [ ] Progresso % calculado corretamente
- [ ] Clicar em vídeo leva para detalhe

## Relatórios

- [ ] Página carrega sem erro mesmo sem dados
- [ ] Top produtos por views mostra os corretos
- [ ] Performance por canal exibe os 3 canais
- [ ] Vídeos vencedores exibidos quando status = vencedor

## Fluxo completo de teste

1. Criar produto com status "pesquisando"
2. Gerar prompt e copiar
3. Criar 2 vídeos para o produto (tiktok + shopee)
4. Marcar vídeo 1 como "publicado"
5. Adicionar 1000 views e 50 cliques ao vídeo 1
6. Marcar vídeo 1 como "vencedor"
7. Verificar Dashboard atualizado
8. Verificar Relatórios mostrando o produto
9. Verificar Checklist com progresso
10. Alterar status do produto para "vencedor"
