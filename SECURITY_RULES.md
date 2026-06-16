# SECURITY_RULES.md — Regras de Segurança

## Regras absolutas desta operação

### O que NUNCA fazer

- **NUNCA** usar automação para clicar em elementos de tela (não é permitido)
- **NUNCA** fazer scraping agressivo ou em loop em nenhuma plataforma
- **NUNCA** tentar burlar regras de uso das plataformas TikTok, Shopee ou Mercado Livre
- **NUNCA** usar contas de terceiros ou comprar contas
- **NUNCA** fazer spam de publicações automatizadas
- **NUNCA** copiar criativos de outros criadores
- **NUNCA** fazer claims médicos, financeiros ou de resultado garantido nos roteiros
- **NUNCA** expor links de afiliado em código-fonte público

### Publicação

- Shopee Vídeo: **publicação manual** pelo painel da Shopee
- Mercado Livre Clips: **publicação manual** pelo painel do ML
- TikTok: **publicação manual** pelo app, até integração via API oficial ser implementada

### API TikTok (futuro)

Quando a integração via API oficial do TikTok for implementada:
- Usar apenas a **TikTok Content Posting API** oficial
- Respeitar limites de rate da API
- Não usar APIs não oficiais ou reverse engineered
- Autenticar via OAuth 2.0 oficial

### Dados

- O banco SQLite (`prisma/dev.db`) é local e não deve ser commitado
- Links de afiliado ficam apenas no banco local
- Sem envio de dados para servidores externos

### Conteúdo dos vídeos

- Conteúdo autoral, baseado em uso real ou informações públicas do produto
- Linguagem honesta, sem promessas falsas
- Respeitar as diretrizes de cada plataforma sobre publicidade e afiliados
- Sempre declarar ser conteúdo afiliado quando exigido pela plataforma
