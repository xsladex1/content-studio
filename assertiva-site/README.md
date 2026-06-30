# Assertiva Gestão & Facilities — Site institucional

Site institucional estático (HTML + CSS + JS, sem dependências e sem build) criado a partir da Landing Page da Assertiva, mantendo a identidade visual da marca (preto, vermelho `#E02418`, fontes Archivo + Inter).

## ✨ O que o site inclui
- **Cabeçalho fixo** com navegação e CTAs (WhatsApp / Orçamento) + menu mobile.
- **Hero** com proposta de valor da LP.
- **Estatísticas** (clientes atendidos, postos, anos, satisfação) com animação de contagem.
- **Soluções / Serviços** (6 serviços da LP).
- **Carrossel** de operações em campo (mesmo conceito da LP), com autoplay, setas, dots, swipe e teclado.
- **Comparativo** Contratação própria × Terceirização Assertiva.
- **Quem somos / Nossa história** (timeline).
- **Avaliações** (depoimentos + nota).
- **Principais clientes** (mural de logos).
- **Orçamento (CTA + formulário)** que envia os dados direto para o WhatsApp comercial.
- **Redes sociais** no rodapé (Instagram, Facebook, LinkedIn, YouTube).
- **LGPD:** banner de consentimento de cookies + modal de preferências + páginas de Política de Privacidade, Política de Cookies e Termos de Uso.
- **Segurança:** cabeçalhos (CSP, HSTS, X-Frame-Options etc.) via `vercel.json`.
- **Responsivo** (mobile, tablet e desktop) e acessível (skip link, foco, `prefers-reduced-motion`).
- **Favicon** com o ícone da marca (check vermelho).

## 🛠️ Configuração
Edite o bloco `CONFIG` em `assets/js/main.js` (WhatsApp, e-mail, telefone, cidade e redes sociais). Detalhes no `DEPLOY-VERCEL.md`.

## ▶️ Rodar localmente
```bash
cd assertiva-site
python3 -m http.server 8080   # http://localhost:8080
```

## 🚀 Hospedar
Veja o guia passo a passo em **`DEPLOY-VERCEL.md`**.

## 📁 Estrutura
```
assertiva-site/
├── index.html              # Página principal (todas as seções)
├── privacidade.html        # Política de Privacidade (LGPD)
├── cookies.html            # Política de Cookies
├── termos.html             # Termos de Uso
├── 404.html
├── vercel.json             # Cabeçalhos de segurança + cache
├── site.webmanifest
├── robots.txt / sitemap.xml
└── assets/
    ├── css/styles.css
    ├── js/main.js          # CONFIG + carrossel + LGPD + formulário
    └── img/                # logo, favicons e fotos do carrossel
```

## ⚠️ Antes de publicar
Substitua os conteúdos marcados como ilustrativos: estatísticas, depoimentos, clientes e o domínio em `sitemap.xml`/`robots.txt`.
