/* =========================================================
   ASSERTIVA — Página "Nossos Clientes"
   Estrutura pronta para crescer. NÃO há clientes fictícios.
   =========================================================

   >>> COMO ADICIONAR UM CLIENTE (quando tiver autorização) <<<
   Basta adicionar um objeto ao array CLIENTES abaixo. O layout,
   os filtros e a busca passam a funcionar automaticamente.

   Campos:
     nome      (obrigatório) — nome da empresa/condomínio
     segmento  (obrigatório) — um dos ids de SEGMENTOS (ex.: "condominios")
     cidade    (opcional)    — "Cidade / UF"
     descricao (opcional)    — frase curta sobre o serviço prestado
     site      (opcional)    — URL oficial (https://...). Deixe "" se não houver
     logo      (opcional)    — caminho da imagem, ex.: "assets/img/clientes/empresa.png"
                               (se vazio, mostra as iniciais do nome)

   Exemplo:
     { nome:"Condomínio Parque das Flores", segmento:"condominios",
       cidade:"São Paulo / SP", descricao:"Portaria e limpeza com supervisão contínua.",
       site:"https://exemplo.com.br", logo:"assets/img/clientes/parque-flores.png" }
*/

const SEGMENTOS = [
  { id: "todos",        label: "Todos" },
  { id: "condominios",  label: "Condomínios" },
  { id: "empresas",     label: "Empresas" },
  { id: "industrias",   label: "Indústrias" },
  { id: "logistica",    label: "Centros logísticos" },
  { id: "comercios",    label: "Comércios" },
  { id: "obras",        label: "Obras e pós-obra" }
];

// Sem clientes públicos ainda — array vazio (estrutura pronta para receber).
const CLIENTES = [
  // adicione os clientes aqui quando tiver autorização (veja o modelo acima)
];

(function clientesPage(){
  const grid    = document.getElementById("cli-grid");
  const chipsEl = document.getElementById("cli-chips");
  const searchEl= document.getElementById("cli-search-input");
  const countEl = document.getElementById("cli-count");
  if(!grid) return;

  const segLabel = (id)=> (SEGMENTOS.find(s=>s.id===id)||{}).label || id;
  let activeSeg = "todos";
  let query = "";

  // monta os chips de filtro
  SEGMENTOS.forEach(seg=>{
    const b = document.createElement("button");
    b.className = "cli-chip" + (seg.id==="todos" ? " active" : "");
    b.textContent = seg.label;
    b.setAttribute("aria-pressed", seg.id==="todos");
    b.addEventListener("click", ()=>{
      activeSeg = seg.id;
      chipsEl.querySelectorAll(".cli-chip").forEach(c=>{c.classList.remove("active");c.setAttribute("aria-pressed","false");});
      b.classList.add("active"); b.setAttribute("aria-pressed","true");
      render();
    });
    chipsEl.appendChild(b);
  });

  if(searchEl){
    searchEl.addEventListener("input", ()=>{ query = searchEl.value.trim().toLowerCase(); render(); });
  }

  const esc = (s)=> String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const initials = (nome)=> nome.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();

  function cardHTML(c){
    const logo = c.logo
      ? `<img src="${esc(c.logo)}" alt="Logo ${esc(c.nome)}" loading="lazy">`
      : `<span class="ph">${esc(initials(c.nome))}</span>`;
    const city = c.cidade
      ? `<span class="city"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${esc(c.cidade)}</span>` : "";
    const desc = c.descricao ? `<p>${esc(c.descricao)}</p>` : `<p></p>`;
    const visit = c.site
      ? `<span class="visit">Visitar site <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : "";
    const inner = `
      <div class="client-card__logo">${logo}</div>
      <span class="client-card__seg">${esc(segLabel(c.segmento))}</span>
      <h3>${esc(c.nome)}</h3>
      ${city}
      ${desc}
      ${visit}`;
    // Card totalmente clicável quando há site
    return c.site
      ? `<a class="client-card" href="${esc(c.site)}" target="_blank" rel="noopener" aria-label="Abrir site de ${esc(c.nome)}">${inner}</a>`
      : `<div class="client-card">${inner}</div>`;
  }

  function emptyHTML(filtered){
    const semClientes = CLIENTES.length === 0;
    const titulo = semClientes ? "Em breve, nossos clientes aqui" : "Nenhum cliente encontrado";
    const texto = semClientes
      ? "Estamos construindo uma base de clientes parceiros. Em breve, empresas e condomínios que confiam na Assertiva aparecerão nesta página."
      : "Tente ajustar a busca ou selecionar outro segmento.";
    return `<div class="cli-empty">
        <div class="cli-empty__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5" stroke-linejoin="round" stroke-linecap="round"/><path d="M9 11h.01M15 11h.01"/></svg></div>
        <h3>${titulo}</h3>
        <p>${texto}</p>
        <a href="index.html#orcamento" class="btn btn--primary btn--lg">Quero ser um cliente Assertiva</a>
      </div>`;
  }

  function render(){
    const filtered = CLIENTES.filter(c=>{
      const okSeg = activeSeg==="todos" || c.segmento===activeSeg;
      const hay = (c.nome+" "+segLabel(c.segmento)+" "+(c.cidade||"")+" "+(c.descricao||"")).toLowerCase();
      const okQuery = !query || hay.includes(query);
      return okSeg && okQuery;
    });

    if(countEl){
      countEl.textContent = CLIENTES.length===0 ? "" :
        `${filtered.length} ${filtered.length===1?"cliente":"clientes"}` + (activeSeg!=="todos" ? ` em ${segLabel(activeSeg)}` : "");
    }

    grid.innerHTML = filtered.length ? filtered.map(cardHTML).join("") : emptyHTML(filtered);
  }

  render();
})();
