# 🚀 Como hospedar o site da Assertiva na Vercel (passo a passo)

Este site é **estático** (HTML, CSS e JavaScript puros) — não precisa de servidor, banco de dados nem build. Isso o torna rápido, barato (plano gratuito da Vercel atende bem) e seguro.

> 📁 **Importante:** o site fica na pasta **`assertiva-site/`** dentro do repositório. Na Vercel você vai apontar o **"Root Directory"** para essa pasta (passo 4).

---

## ✅ Antes de começar (5 minutos)

Abra o arquivo **`assertiva-site/assets/js/main.js`** e edite o bloco `CONFIG` no topo com os dados reais da empresa:

```js
const CONFIG = {
  whatsapp: "5511999999999",          // WhatsApp comercial (55 + DDD + número, só dígitos)
  email: "comercial@assertiva.com.br", // e-mail real
  telefoneExibicao: "(11) 99999-9999", // telefone (apenas exibição)
  cidade: "São Paulo / SP",            // cidade-sede
  social: {
    instagram: "https://instagram.com/suaempresa",
    facebook:  "https://facebook.com/suaempresa",
    linkedin:  "https://linkedin.com/company/suaempresa",
    youtube:   ""                       // deixe "" para esconder o ícone
  }
};
```

Também recomendamos revisar/atualizar (opcional, mas importante):
- **Números da seção de estatísticas** (`index.html` → bloco `class="stats"`): postos, clientes, anos, satisfação.
- **Depoimentos** (seção "Avaliações") — troque pelos reais.
- **Clientes** (seção "Principais clientes") — coloque os logotipos/nomes reais.
- Nos arquivos `sitemap.xml`, `robots.txt` e `index.html`, troque `https://www.assertiva.com.br/` pelo seu domínio final.

---

## Caminho A — Pela interface da Vercel (recomendado, sem terminal)

### Passo 1 — Suba o código para o GitHub
O código já está no repositório/branch deste projeto. Garanta que a pasta `assertiva-site/` esteja com as últimas alterações commitadas e enviadas (push).

### Passo 2 — Crie uma conta na Vercel
1. Acesse **https://vercel.com**
2. Clique em **"Sign Up"** e escolha **"Continue with GitHub"** (mais fácil para conectar o repositório).
3. Autorize a Vercel a acessar seus repositórios.

### Passo 3 — Importe o projeto
1. No painel da Vercel, clique em **"Add New…" → "Project"**.
2. Encontre o repositório do site na lista e clique em **"Import"**.

### Passo 4 — Configure o projeto ⚠️ (passo mais importante)
Na tela de configuração:
1. **Framework Preset:** selecione **"Other"** (é um site estático).
2. **Root Directory:** clique em **"Edit"** e selecione a pasta **`assertiva-site`**.
   - Isso faz a Vercel publicar apenas o site, ignorando o resto do repositório.
3. **Build and Output Settings:** deixe **tudo em branco** (não há build).
   - Build Command: vazio
   - Output Directory: vazio
   - Install Command: vazio
4. Clique em **"Deploy"**.

### Passo 5 — Aguarde o deploy
Em poucos segundos a Vercel publica o site e mostra uma URL como:
`https://seu-projeto.vercel.app` — clique para abrir e testar. ✅

### Passo 6 — Conecte seu domínio próprio (opcional)
1. No projeto, vá em **"Settings" → "Domains"**.
2. Clique em **"Add"** e digite seu domínio (ex.: `assertiva.com.br`).
3. A Vercel mostra os registros DNS a configurar no seu provedor de domínio:
   - Para domínio raiz (`assertiva.com.br`): registro **A** apontando para o IP indicado.
   - Para `www.assertiva.com.br`: registro **CNAME** apontando para `cname.vercel-dns.com`.
4. Salve no painel do seu registrador (Registro.br, GoDaddy, etc.) e aguarde a propagação (de minutos a algumas horas).
5. O **HTTPS (cadeado)** é ativado automaticamente pela Vercel. 🔒

---

## Caminho B — Pela linha de comando (Vercel CLI)

```bash
# 1. Instale a CLI da Vercel
npm install -g vercel

# 2. Entre na pasta do site
cd assertiva-site

# 3. Faça o deploy (siga as perguntas no terminal)
vercel

# 4. Quando estiver tudo certo, publique em produção
vercel --prod
```
> No Caminho B, como você já está dentro de `assertiva-site/`, não precisa configurar Root Directory.

---

## 🔄 Atualizações futuras
A cada novo **push** para a branch conectada, a Vercel **republica automaticamente**. É só editar os arquivos, commitar e enviar.

---

## 🔒 Segurança já incluída
O arquivo `vercel.json` já aplica cabeçalhos de segurança em todas as páginas:
- **Content-Security-Policy** (restringe origens de scripts, estilos, imagens e fontes)
- **Strict-Transport-Security (HSTS)** — força HTTPS
- **X-Frame-Options: DENY** e `frame-ancestors 'none'` — bloqueia clickjacking
- **X-Content-Type-Options: nosniff**
- **Referrer-Policy** e **Permissions-Policy** restritivas
- HTTPS automático com certificado gerenciado pela Vercel

> Dica: após publicar, valide a segurança em **https://securityheaders.com** e **https://observatory.mozilla.org** — o site foi preparado para boa pontuação.

---

## 🧪 Testar localmente antes de publicar
Você pode abrir `assertiva-site/index.html` direto no navegador, mas o ideal é rodar um servidor local:

```bash
cd assertiva-site
python3 -m http.server 8080
# abra http://localhost:8080
```
ou
```bash
npx serve assertiva-site
```
