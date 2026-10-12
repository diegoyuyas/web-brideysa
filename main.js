
// Brideysa - Carrusel + Fondo transparente
(function(){
  window.__BRAND__ = window.__BRAND__ || {};
  function safe(fn,name){ try{ fn(); }catch(e){ console.warn('[safe] '+name, e); } }
  function initRevealSafety(){
    setTimeout(function(){
      document.querySelectorAll('.reveal').forEach(function(el){
        var cs = getComputedStyle(el);
        if(cs.opacity === '0'){ el.classList.add('is-visible'); }
      });
    },6000);
  }
  function initSplash(){
    var s=document.getElementById('splash'); if(!s) return;
    setTimeout(function(){ s.classList.add('hide'); setTimeout(function(){ s.remove(); },600); },2800);
  }
  function initTextSplit(){
    document.querySelectorAll('[data-split]').forEach(function(el){
      if(el.dataset.done) return;
      var words=el.textContent.trim().split(' ');
      el.innerHTML=words.map(function(w){return '<span class="word"><span>'+w+'</span></span>';}).join(' ');
      el.dataset.done='1';
    });
  }
  function initObserver(){
    if(!('IntersectionObserver' in window)){
      document.querySelectorAll('.reveal').forEach(function(e){ e.classList.add('is-visible'); });
      return;
    }
    var o=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('is-visible'); o.unobserve(en.target);} });
    },{threshold:0.05, rootMargin:'0px 0px -10% 0px'});
    document.querySelectorAll('.reveal').forEach(function(e){ o.observe(e); });
  }
  function initMagnetic(){
    document.querySelectorAll('[data-magnetic]').forEach(function(b){
      if(b.dataset.mdone) return;
      b.addEventListener('mousemove',function(e){
        var r=b.getBoundingClientRect();
        var x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
        b.style.transform='translate('+(x*0.15)+'px,'+(y*0.35)+'px)';
      });
      b.addEventListener('mouseleave',function(){ b.style.transform='translate(0,0)'; });
      b.dataset.mdone='1';
    });
  }
  function initNav(){
    var t=document.getElementById('navToggle'), n=document.getElementById('navMenu'), ov=document.getElementById('navOverlay');
    if(!t||!n||t.dataset.done) return;
    function openNav(){ n.classList.add('open'); t.classList.add('open'); if(ov) ov.classList.add('open'); document.body.classList.add('no-scroll'); t.setAttribute('aria-expanded','true'); }
    function closeNav(){ n.classList.remove('open'); t.classList.remove('open'); if(ov) ov.classList.remove('open'); document.body.classList.remove('no-scroll'); t.setAttribute('aria-expanded','false'); }
    t.addEventListener('click',function(){ if(n.classList.contains('open')) closeNav(); else openNav(); });
    if(ov) ov.addEventListener('click', closeNav);
    n.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ closeNav(); }); });
    t.dataset.done='1';
  }
  function initAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      if(a.dataset.sdone) return;
      a.addEventListener('click',function(e){
        var id=a.getAttribute('href'); if(id.length>1){ var tg=document.querySelector(id); if(tg){ e.preventDefault(); window.scrollTo({top:tg.offsetTop-80,behavior:'smooth'}); } }
      });
      a.dataset.sdone='1';
    });
  }
  function initAdminAccess(){
    var logo=document.querySelector('.header .logo'); if(!logo||logo.dataset.adm) return;
    var clicks=0, timer=null;
    logo.addEventListener('click',function(e){
      clicks++; clearTimeout(timer);
      timer=setTimeout(function(){ clicks=0; },2500); // los 5 clics deben ser seguidos
      if(clicks>=5){ clicks=0; e.preventDefault(); window.location.href='portal_admin.html'; }
    });
    logo.dataset.adm='1';
  }
  document.addEventListener('DOMContentLoaded',function(){
    safe(initAdminAccess,'admin'); safe(initTextSplit,'split'); safe(initRevealSafety,'safety'); safe(initObserver,'observer');
    safe(initMagnetic,'magnetic'); safe(initNav,'nav'); safe(initAnchors,'anchors'); safe(initSplash,'splash');
  });
})();

// === CARRUSEL + FONDO TRANSPARENTE + DATA.JSON ===
(function(){
  let carouselIndex = 0;
  let carouselTimer = null;
  let slides = [];

  async function loadDataJson(){
    try{
      const res = await fetch('data.json?v=' + Date.now(), {cache: 'no-store'});
      if(!res.ok) throw new Error('data.json no encontrado');
      const data = await res.json();
      console.log('[Brideysa] data.json cargado', data);
      renderFromData(data);
      renderSecciones(data);
      initFondo(data);
      initCarrusel(data);
    }catch(e){
      console.warn('[Brideysa] No se pudo cargar data.json:', e);
    }
  }

  function renderFromData(data){
    if(data.hero){
      const b = document.getElementById('hero-badge');
      const t = document.getElementById('hero-titulo');
      const d = document.getElementById('hero-desc');
      const c = document.getElementById('hero-cta');
      const n = document.getElementById('hero-nota');
      const hw = document.getElementById('header-whatsapp');
      if(b && data.hero.badge) b.textContent = data.hero.badge;
      if(t && data.hero.titulo) t.textContent = data.hero.titulo;
      if(d && data.hero.descripcion) d.innerHTML = data.hero.descripcion;
      if(c){ if(data.hero.ctaTexto) c.textContent = data.hero.ctaTexto; if(data.hero.ctaLink) c.href = data.hero.ctaLink; }
      if(n && data.hero.ctaNota) n.textContent = data.hero.ctaNota;
      if(hw && data.hero.ctaLink) hw.href = data.hero.ctaLink;
    }
    if(data.trust && Array.isArray(data.trust)){
      const tg = document.getElementById('trust-grid');
      if(tg){ tg.innerHTML = data.trust.map(item => `<div><strong>${item.numero||''}</strong> ${item.texto||''}</div>`).join(''); }
    }
    if(data.servicios){
      const grid = document.getElementById('services-grid');
      if(grid){
        grid.innerHTML = '';
        data.servicios.filter(s=>s.activo!==false).forEach((s,i)=>{
          const div = document.createElement('div');
          div.className = 'svc reveal is-visible';
          div.style.transitionDelay = (i*0.05)+'s';
          div.innerHTML = `<i>${s.icono||'🐾'}</i><h3>${s.titulo||''}</h3><p>${s.descripcion||''}</p>`;
          grid.appendChild(div);
        });
      }
    }
    if(data.nosotros){
      const eye = document.getElementById('nosotros-eyebrow');
      const tit = document.getElementById('nosotros-titulo');
      const desc = document.getElementById('nosotros-desc');
      const val = document.getElementById('nosotros-valores');
      const test = document.getElementById('nosotros-testimonio');
      const aut = document.getElementById('nosotros-autor');
      if(eye && data.nosotros.eyebrow) eye.textContent = data.nosotros.eyebrow;
      if(tit && data.nosotros.titulo) tit.textContent = data.nosotros.titulo;
      if(desc && data.nosotros.descripcion) desc.textContent = data.nosotros.descripcion;
      if(val && Array.isArray(data.nosotros.valores)){
        val.innerHTML = data.nosotros.valores.map(v=>`<li><strong>${v.titulo||''}:</strong> ${v.descripcion||''}</li>`).join('');
      }
      if(test && data.nosotros.testimonio) test.textContent = '"' + data.nosotros.testimonio + '"';
      if(aut && data.nosotros.testimonioAutor) aut.textContent = '— ' + data.nosotros.testimonioAutor;
    }
    if(data.contacto){
      const ct = document.getElementById('contacto-titulo');
      const cd = document.getElementById('contacto-desc');
      const cta = document.getElementById('contacto-cta');
      const cm = document.getElementById('contacto-meta');
      const chat = document.getElementById('cta-chat');
      if(ct && data.contacto.titulo) ct.textContent = data.contacto.titulo;
      if(cd && data.contacto.descripcion) cd.innerHTML = data.contacto.descripcion;
      if(cta){ if(data.contacto.ctaTexto) cta.textContent = data.contacto.ctaTexto; if(data.contacto.ctaLink) cta.href = data.contacto.ctaLink; }
      if(cm && data.contacto.meta) cm.textContent = data.contacto.meta;
      if(chat && Array.isArray(data.contacto.chat)){
        chat.innerHTML = data.contacto.chat.map(m=>{
          const cls = m.tipo==='me' ? 'chat-bubble me' : 'chat-bubble';
          return `<div class="${cls}">${m.texto||''}</div>`;
        }).join('');
      }
    }
    if(data.footer){
      const fd = document.getElementById('footer-desc');
      const fs = document.getElementById('footer-servicios');
      const fh = document.getElementById('footer-horario');
      const fc = document.getElementById('footer-copy');
      if(fd && data.footer.descripcion) fd.innerHTML = data.footer.descripcion.replace(/\n/g,'<br>');
      if(fs && data.footer.serviciosTexto) fs.textContent = data.footer.serviciosTexto;
      if(fh && data.footer.horario) fh.innerHTML = data.footer.horario.replace(/\n/g,'<br>');
      if(fc && data.footer.copy) fc.textContent = data.footer.copy;
    }
  }

  const esc = v => String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function slugify(t){ return 'sec-' + (String(t||'seccion').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'seccion'); }

  function renderSecciones(data){
    document.querySelectorAll('[data-custom-sec]').forEach(e=>e.remove());
    const lista = (data.secciones||[]).filter(s=>s && s.activo!==false);
    if(!lista.length) return;
    const nav = document.getElementById('navMenu');
    const wa = document.getElementById('header-whatsapp');
    const usados = {};
    lista.forEach((s,idx)=>{
      let id = s.slug || slugify(s.menu || s.titulo);
      if(usados[id]) id += '-' + (idx+1); usados[id] = 1;
      const sec = document.createElement('section');
      sec.id = id; sec.setAttribute('data-custom-sec','1');
      sec.className = 'section' + (idx%2===0 ? ' alt' : '');
      const cards = (s.items||[]).map((it,i)=>`<div class="svc reveal is-visible" style="transition-delay:${i*0.05}s"><i>${esc(it.icono||'✨')}</i><h3>${esc(it.titulo)}</h3><p>${esc(it.descripcion)}</p></div>`).join('');
      const img = s.imagen ? `<img src="${esc(s.imagen)}" alt="${esc(s.titulo)}" loading="lazy" style="width:100%;max-height:420px;object-fit:cover;border-radius:20px;margin-top:24px;display:block">` : '';
      const btn = (s.ctaTexto && s.ctaLink) ? `<a class="btn btn-teal btn-lg" style="margin-top:24px;display:inline-block" href="${esc(s.ctaLink)}" target="_blank" rel="noopener">${esc(s.ctaTexto)}</a>` : '';
      sec.innerHTML = `<div class="container"><div class="section-head">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.titulo)}</h2>${s.texto?`<p style="margin-top:12px;opacity:.75;white-space:pre-line">${esc(s.texto)}</p>`:''}${img}${btn}</div>${cards?`<div class="services-grid">${cards}</div>`:''}</div>`;
      const after = {inicio:'.trust-bar', servicios:'#servicios', nosotros:'#nosotros'}[s.despues];
      const ref = after ? document.querySelector(after) : null;
      if(ref) ref.insertAdjacentElement('afterend', sec);
      else { const c = document.getElementById('contacto'); if(c) c.parentNode.insertBefore(sec, c); }
      if(nav && s.enMenu !== false){
        const a = document.createElement('a');
        a.href = '#'+id; a.textContent = s.menu || s.titulo; a.setAttribute('data-custom-sec','1');
        a.addEventListener('click', function(e){
          e.preventDefault();
          const ov = document.getElementById('navOverlay'); if(ov && ov.classList.contains('open')) ov.click();
          window.scrollTo({top:sec.offsetTop-80,behavior:'smooth'});
        });
        if(wa) nav.insertBefore(a, wa); else nav.appendChild(a);
      }
    });
  }

  function initFondo(data){
    const bg = document.getElementById('bg-watermark');
    if(!bg) return;
    const cfg = data.config && data.config.fondoTransparente;
    if(!cfg || cfg.activo===false){ bg.style.display='none'; return; }
    const op = cfg.opacidad!=null ? cfg.opacidad : 0.07;
    document.documentElement.style.setProperty('--bg-opacity', op);
    let imgUrl = '';
    if(cfg.imagen && cfg.imagen.startsWith('data:image')) imgUrl = cfg.imagen;
    else imgUrl = 'assets/img/logo.png';
    bg.style.backgroundImage = `url("${imgUrl}")`;
    bg.style.display = 'block';
  }

  function initCarrusel(data){
    const track = document.getElementById('carousel-track');
    const dotsC = document.getElementById('carousel-dots');
    const prev = document.getElementById('carousel-prev');
    const next = document.getElementById('carousel-next');
    if(!track) return;
    const lista = (data.carrusel || []).filter(c=>c.activo!==false);
    slides = lista.length ? lista : [{id:'ph', titulo:'Brideysa', descripcion:'Sube tus fotos desde el portal admin', imagen:'', activo:true}];
    
    track.innerHTML = slides.map(s=>{
      const hasImg = !!s.imagen; const cls = s.imagen && /(^|\/)logo\.png/.test(s.imagen) ? ' class="is-logo"' : '';
      if(hasImg){
        return `<div class="carousel-slide"><img${cls} src="${s.imagen}" alt="${s.titulo||''}" loading="lazy"><div class="caption"><strong>${s.titulo||''}</strong><span>${s.descripcion||''}</span></div></div>`;
      } else {
        return `<div class="carousel-slide"><div class="placeholder"><img src="assets/img/logo.png" alt="Brideysa"><div><strong>${s.titulo||'Agrega tu foto'}</strong><p style="font-size:13px;opacity:.6;margin-top:6px">${s.descripcion||'Desde el admin puedes subir fotos en base64'}</p></div></div></div>`;
      }
    }).join('');

    if(dotsC){
      dotsC.innerHTML = slides.map((_,i)=>`<button class="carousel-dot ${i===0?'active':''}" data-i="${i}" aria-label="Foto ${i+1}"></button>`).join('');
      dotsC.querySelectorAll('.carousel-dot').forEach(dot=>{
        dot.addEventListener('click', ()=>{ goTo(parseInt(dot.dataset.i)); resetTimer(); });
      });
    }

    function goTo(i){
      carouselIndex = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${carouselIndex*100}%)`;
      if(dotsC){
        dotsC.querySelectorAll('.carousel-dot').forEach((d,idx)=> d.classList.toggle('active', idx===carouselIndex));
      }
    }
    function nextSlide(){ goTo(carouselIndex+1); }
    function prevSlide(){ goTo(carouselIndex-1); }
    function resetTimer(){
      if(carouselTimer) clearInterval(carouselTimer);
      carouselTimer = setInterval(nextSlide, 5000);
    }

    if(prev) prev.onclick = ()=>{ prevSlide(); resetTimer(); };
    if(next) next.onclick = ()=>{ nextSlide(); resetTimer(); };

    // swipe mobile
    let startX = 0;
    track.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend', e=>{
      const diff = e.changedTouches[0].clientX - startX;
      if(Math.abs(diff)>50){ if(diff<0) nextSlide(); else prevSlide(); resetTimer(); }
    });

    goTo(0);
    resetTimer();
    window.__carouselGoTo = goTo;
  }

  document.addEventListener('DOMContentLoaded', loadDataJson);
})();
