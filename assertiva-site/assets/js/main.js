/* =========================================================
   ASSERTIVA — Gestão & Facilities
   Scripts do site (carrossel, LGPD, menu, formulário)
   =========================================================

   >>> CONFIGURAÇÃO RÁPIDA <<<
   Edite os valores abaixo com os dados reais da empresa.
   (Telefone no formato internacional, só números: 55 + DDD + número)
*/
const CONFIG = {
  whatsapp: "5511915292154",           // WhatsApp oficial da Assertiva (da LP)
  email: "comercial@assertiva.com.br", // << TROCAR pelo e-mail real (não havia na LP)
  telefoneExibicao: "(11) 91529-2154", // exibição do WhatsApp
  cidade: "São Paulo / SP",            // << ajuste se necessário
  social: {
    instagram: "https://www.instagram.com/assertivagestaoefacilities", // Instagram da Assertiva (da LP)
    facebook:  "",   // não informado na LP (deixe "" para ocultar)
    linkedin:  "",   // não informado na LP (deixe "" para ocultar)
    youtube:   ""    // não informado na LP (deixe "" para ocultar)
  }
};

/* Marca que o JS está ativo (libera as animações .reveal sem esconder
   conteúdo quando o JavaScript estiver indisponível). */
document.documentElement.classList.add('js');

/* ---------- Helpers de contato (WhatsApp / e-mail / social) ---------- */
(function applyContact(){
  const waBase = "https://wa.me/" + CONFIG.whatsapp;
  const defaultMsg = encodeURIComponent("Olá! Gostaria de solicitar um orçamento de serviços terceirizados da Assertiva.");
  document.querySelectorAll('[data-wa]').forEach(a=>{
    const custom = a.getAttribute('data-wa');
    a.href = waBase + "?text=" + (custom ? encodeURIComponent(custom) : defaultMsg);
    a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll('[data-email]').forEach(a=>{ a.href = "mailto:" + CONFIG.email; });
  document.querySelectorAll('[data-email-text]').forEach(el=>{ el.textContent = CONFIG.email; });
  document.querySelectorAll('[data-phone-text]').forEach(el=>{ el.textContent = CONFIG.telefoneExibicao; });
  document.querySelectorAll('[data-city-text]').forEach(el=>{ el.textContent = CONFIG.cidade; });
  // socials
  const map = {instagram:'social-instagram',facebook:'social-facebook',linkedin:'social-linkedin',youtube:'social-youtube'};
  Object.entries(map).forEach(([key,id])=>{
    document.querySelectorAll('[data-social="'+key+'"]').forEach(a=>{
      const url = CONFIG.social[key];
      if(!url){ a.style.display='none'; return; }
      a.href = url; a.target="_blank"; a.rel="noopener";
    });
  });
})();

/* ---------- Header scroll state ---------- */
const header = document.querySelector('.header');
if(header){
  const onScroll = ()=> header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
}

/* ---------- Mobile nav ---------- */
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if(navToggle && nav){
  navToggle.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open'); navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded','false'); document.body.style.overflow='';
  }));
}

/* ---------- Carrossel (portfólio) ---------- */
(function carousel(){
  const root = document.querySelector('[data-carousel]');
  if(!root) return;
  const track = root.querySelector('.carousel__track');
  const slides = Array.from(track.children);
  const prev = root.querySelector('.carousel__btn--prev');
  const next = root.querySelector('.carousel__btn--next');
  const dotsWrap = root.querySelector('.carousel__dots');
  let index = 0, timer = null;
  const total = slides.length;

  slides.forEach((_,i)=>{
    const b = document.createElement('button');
    b.setAttribute('aria-label','Ir para o slide '+(i+1));
    if(i===0) b.classList.add('active');
    b.addEventListener('click',()=>{ go(i); restart(); });
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function go(i){
    index = (i+total)%total;
    track.style.transform = 'translateX(-'+(index*100)+'%)';
    dots.forEach((d,di)=>d.classList.toggle('active', di===index));
  }
  function start(){ timer = setInterval(()=>go(index+1), 5500); }
  function restart(){ clearInterval(timer); start(); }

  prev.addEventListener('click',()=>{ go(index-1); restart(); });
  next.addEventListener('click',()=>{ go(index+1); restart(); });
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',start);

  // swipe (touch)
  let x0=null;
  root.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
  root.addEventListener('touchend',e=>{
    if(x0===null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx)>45){ go(dx<0?index+1:index-1); restart(); }
    x0=null;
  },{passive:true});

  // keyboard
  root.setAttribute('tabindex','0');
  root.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){ go(index-1); restart(); }
    if(e.key==='ArrowRight'){ go(index+1); restart(); }
  });

  start();
})();

/* ---------- Reveal on scroll (geométrico + rede de segurança) ----------
   Determinístico: revela ao aproximar do viewport. Mesmo que algo falhe,
   um timeout garante que NENHUM conteúdo permaneça oculto. */
(function reveal(){
  const els = Array.from(document.querySelectorAll('.reveal'));
  if(!els.length) return;
  const check = ()=>{
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for(let i=els.length-1;i>=0;i--){
      const el = els[i];
      if(el.getBoundingClientRect().top < vh*0.9){
        el.classList.add('in'); els.splice(i,1);
      }
    }
  };
  check();
  window.addEventListener('scroll', check, {passive:true});
  window.addEventListener('resize', check);
  // Segurança: após 2,5s revela tudo que sobrou, independentemente do scroll.
  setTimeout(()=>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in')), 2500);
})();

/* ---------- Formulário -> WhatsApp ---------- */
(function quoteForm(){
  const form = document.getElementById('quote-form');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    // validação simples
    let ok = true;
    form.querySelectorAll('[required]').forEach(f=>{
      const invalid = !f.value || (f.type==='checkbox' && !f.checked);
      f.classList.toggle('field-error', invalid);
      if(invalid) ok=false;
    });
    if(!ok){ form.querySelector('.field-error')?.scrollIntoView({behavior:'smooth',block:'center'}); return; }

    const d = new FormData(form);
    const msg =
`*Novo pedido de orçamento — Site Assertiva*

*Nome:* ${d.get('nome')}
*Empresa/Condomínio:* ${d.get('empresa')}
*Telefone/WhatsApp:* ${d.get('telefone')}
*E-mail:* ${d.get('email') || '—'}
*Cidade:* ${d.get('cidade')}
*Serviço desejado:* ${d.get('servico')}`;

    window.open("https://wa.me/"+CONFIG.whatsapp+"?text="+encodeURIComponent(msg), "_blank", "noopener");
    const btn = form.querySelector('button[type=submit]');
    if(btn){ const o=btn.textContent; btn.textContent="Abrindo o WhatsApp…"; setTimeout(()=>btn.textContent=o,3500); }
  });
  // limpa erro ao digitar
  form.querySelectorAll('input,select').forEach(f=>{
    f.addEventListener('input',()=>f.classList.remove('field-error'));
    f.addEventListener('change',()=>f.classList.remove('field-error'));
  });
})();

/* ---------- Ano no rodapé ---------- */
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

/* =========================================================
   CONSENTIMENTO DE COOKIES (LGPD - Lei 13.709/2018)
   ========================================================= */
(function lgpd(){
  const KEY = 'assertiva_consent_v1';
  const banner = document.getElementById('cookie-banner');
  const modal  = document.getElementById('cookie-modal');
  if(!banner) return;

  const saved = ()=>{ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } };
  const save = (obj)=>{ localStorage.setItem(KEY, JSON.stringify({...obj, ts:Date.now()})); };

  function showBanner(){ banner.classList.add('show'); }
  function hideBanner(){ banner.classList.remove('show'); }
  function openModal(){
    const c = saved() || {analytics:false};
    const a = document.getElementById('pref-analytics');
    if(a) a.checked = !!c.analytics;
    modal?.classList.add('show');
  }
  function closeModal(){ modal?.classList.remove('show'); }

  function apply(consent){
    // Ponto de integração: ative tags/analytics só com consentimento.
    if(consent.analytics){ window.__assertivaAnalytics = true; /* ex.: carregar GA aqui */ }
  }

  // primeira visita -> mostra banner
  if(!saved()) setTimeout(showBanner, 900);
  else apply(saved());

  document.getElementById('cookie-accept')?.addEventListener('click',()=>{
    const c={essential:true,analytics:true}; save(c); apply(c); hideBanner();
  });
  document.getElementById('cookie-reject')?.addEventListener('click',()=>{
    const c={essential:true,analytics:false}; save(c); apply(c); hideBanner();
  });
  document.getElementById('cookie-config')?.addEventListener('click',openModal);
  document.getElementById('cookie-modal-close')?.addEventListener('click',closeModal);
  document.getElementById('cookie-save-prefs')?.addEventListener('click',()=>{
    const c={essential:true, analytics: !!document.getElementById('pref-analytics')?.checked};
    save(c); apply(c); closeModal(); hideBanner();
  });
  modal?.addEventListener('click',e=>{ if(e.target===modal) closeModal(); });

  // link "gerenciar cookies" no rodapé / qualquer lugar
  document.querySelectorAll('[data-open-cookies]').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); openModal(); }));
})();
