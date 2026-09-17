/* =========================================================
   FIORESCER: interações
   Vanilla, sem dependências. Tudo respeita prefers-reduced-motion.
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const mqCalmo = matchMedia('(prefers-reduced-motion: reduce)');
  const calmo   = () => mqCalmo.matches;

  /* ---------------------------------------------------------
     1 · Ano do rodapé
     --------------------------------------------------------- */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     2 · Título do hero: quebra em máscaras animadas
     --------------------------------------------------------- */
  $$('[data-split]').forEach((ln, i) => {
    ln.innerHTML = `<span>${ln.innerHTML}</span>`;
    ln.style.setProperty('--d', `${0.07 + i * 0.085}s`);
  });

  /* ---------------------------------------------------------
     3 · Reveal on scroll
     --------------------------------------------------------- */
  const alvos = [...$$('[data-reveal]'), ...$$('.qual__cards li'), ...$$('.rev__grid li'), ...$$('.ln')];

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    alvos.forEach((el) => io.observe(el));
  } else {
    alvos.forEach((el) => el.classList.add('in'));
  }

  /* ---------------------------------------------------------
     4 · Header: fundo ao rolar + esconde ao descer
     --------------------------------------------------------- */
  const hd = $('#hd');
  let ultimoY = window.scrollY;
  let travaHeader = false;

  const onScrollHeader = () => {
    const y = window.scrollY;
    hd.classList.toggle('fix', y > 24);

    if (!travaHeader) {
      const descendo = y > ultimoY && y > 260;
      hd.classList.toggle('oculto', descendo);
    }
    ultimoY = y;
  };

  /* ---------------------------------------------------------
     5 · FAB do WhatsApp
     --------------------------------------------------------- */
  const fab = $('#fab');
  const onScrollFab = () => {
    fab.classList.toggle('on', window.scrollY > window.innerHeight * 0.55);
  };

  /* ---------------------------------------------------------
     6 · Parallax discreto no hero
     --------------------------------------------------------- */
  const heroImg = $('.hero__img');
  const heroFig = $('.hero__fig');
  const onScrollParallax = () => {
    if (calmo() || !heroImg) return;
    const y = window.scrollY;
    if (y > window.innerHeight * 1.2) return;
    heroImg.style.translate = `0 ${Math.min(y * 0.055, 42)}px`;
  };

  /* --- um único listener de scroll, em rAF --- */
  let agendado = false;
  const aoRolar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      onScrollFab();
      onScrollParallax();
      agendado = false;
    });
  };
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------------------------------------------------------
     7 · Menu lateral (mobile)
     --------------------------------------------------------- */
  const burger = $('#burger');
  const drawer = $('#drawer');
  const veu    = $('#veu');
  const fechar = $('#drwClose');
  const links  = $$('.drw__nav a');

  links.forEach((a, i) => a.style.setProperty('--i', i));

  let aberto = false;

  const abrirMenu = () => {
    if (aberto) return;
    aberto = true;
    veu.hidden = false;
    requestAnimationFrame(() => veu.classList.add('on'));
    drawer.classList.add('on');
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('trava');
    travaHeader = true;
    hd.classList.remove('oculto');
    setTimeout(() => fechar.focus({ preventScroll: true }), 260);
  };

  const fecharMenu = ({ devolverFoco = true } = {}) => {
    if (!aberto) return;
    aberto = false;
    veu.classList.remove('on');
    drawer.classList.remove('on');
    drawer.setAttribute('inert', '');
    drawer.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('trava');
    travaHeader = false;
    if (devolverFoco) burger.focus({ preventScroll: true });
    setTimeout(() => { if (!aberto) veu.hidden = true; }, 520);
  };

  burger.addEventListener('click', () => (aberto ? fecharMenu() : abrirMenu()));
  fechar.addEventListener('click', () => fecharMenu());
  veu.addEventListener('click', () => fecharMenu());
  links.forEach((a) => a.addEventListener('click', () => fecharMenu({ devolverFoco: false })));

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aberto) fecharMenu();
    if (e.key !== 'Tab' || !aberto) return;

    const foco = $$('a[href], button:not([disabled])', drawer);
    if (!foco.length) return;
    const primeiro = foco[0], ultimo = foco[foco.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });

  // largura de desktop cancela o drawer
  matchMedia('(min-width: 860px)').addEventListener('change', (e) => {
    if (e.matches) fecharMenu({ devolverFoco: false });
  });

  /* ---------------------------------------------------------
     8 · Link ativo na navegação
     --------------------------------------------------------- */
  const navLinks = $$('.hd__nav a');
  const secoes = navLinks
    .map((a) => ({ a, sec: $(a.getAttribute('href')) }))
    .filter((o) => o.sec);

  if (secoes.length && 'IntersectionObserver' in window) {
    const ioNav = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        const alvo = secoes.find((o) => o.sec === e.target);
        if (alvo && e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('ativo'));
          alvo.a.classList.add('ativo');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secoes.forEach((o) => ioNav.observe(o.sec));
  }

  /* ---------------------------------------------------------
     9 · Carrossel "O que você vê em um fio?"
     --------------------------------------------------------- */
  (() => {
    const palco  = $('#fioPalco');
    if (!palco) return;

    const slides = $$('.fio__s', palco);
    const barras = $$('#fioBarras button');
    const secao  = $('#fio');
    const DUR    = 6800;

    let atual = 0, pausado = false, visivel = false, decorrido = 0, ultimo = 0, raf = 0;

    const ir = (i, { reiniciar = true } = {}) => {
      const n = (i + slides.length) % slides.length;
      if (n === atual && !reiniciar) return;

      // direção do movimento alimenta a entrada da frase
      const avancou = i > atual || (atual === slides.length - 1 && n === 0);
      palco.style.setProperty('--dir', avancou ? 1 : -1);

      slides.forEach((s, k) => {
        const on = k === n;
        s.classList.toggle('is-on', on);
        s.setAttribute('aria-hidden', String(!on));
      });

      barras.forEach((b, k) => {
        b.setAttribute('aria-selected', String(k === n));
        if (k < n) b.dataset.feito = '1';
        else delete b.dataset.feito;
      });

      atual = n;
      decorrido = 0;
    };

    const proximo = () => ir(atual + 1);
    const anterior = () => ir(atual - 1);

    /* altura do palco = maior slide (evita salto no crossfade) */
    const ajustar = () => {
      const alturas = slides.map((s) => {
        const antes = s.classList.contains('is-on');
        if (!antes) { s.style.cssText = 'position:relative;visibility:hidden;opacity:0;pointer-events:none'; }
        const h = s.offsetHeight;
        if (!antes) s.style.cssText = '';
        return h;
      });
      $('#fioSlides').style.minHeight = `${Math.max(...alturas)}px`;
    };

    /* relógio do autoplay, sincronizado com a barra em CSS */
    const loop = (agora) => {
      const dt = ultimo ? agora - ultimo : 0;
      ultimo = agora;
      if (!pausado && visivel && !calmo() && !document.hidden) {
        decorrido += dt;
        if (decorrido >= DUR) proximo();
      }
      raf = requestAnimationFrame(loop);
    };

    const pausar  = (v) => { pausado = v; secao.classList.toggle('fio__pausado', v); };

    palco.addEventListener('pointerenter', () => pausar(true));
    palco.addEventListener('pointerleave', () => pausar(false));
    palco.addEventListener('focusin',  () => pausar(true));
    palco.addEventListener('focusout', () => pausar(false));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visivel = e.isIntersecting; },
        { threshold: 0.25 }).observe(palco);
    } else visivel = true;

    $('#fioNext').addEventListener('click', proximo);
    $('#fioPrev').addEventListener('click', anterior);
    barras.forEach((b, i) => b.addEventListener('click', () => ir(i)));

    palco.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); proximo(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); anterior(); }
    });

    /* swipe */
    let x0 = null, y0 = null, arrastando = false;
    palco.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      x0 = e.clientX; y0 = e.clientY; arrastando = true;
      pausar(true);
    });
    palco.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      if (Math.abs(e.clientY - y0) > Math.abs(e.clientX - x0) + 8) { arrastando = false; }
    });
    const soltar = (e) => {
      if (!arrastando) { pausar(false); return; }
      arrastando = false;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 48) (dx < 0 ? proximo : anterior)();
      pausar(false);
    };
    palco.addEventListener('pointerup', soltar);
    palco.addEventListener('pointercancel', () => { arrastando = false; pausar(false); });
    palco.addEventListener('dragstart', (e) => e.preventDefault());

    /* boot */
    ir(0);
    addEventListener('resize', debounce(ajustar, 180));
    addEventListener('load', ajustar);
    ajustar();
    raf = requestAnimationFrame(loop);

    document.addEventListener('visibilitychange', () => { ultimo = 0; });
  })();

  /* ---------------------------------------------------------
     10 · Carrossel de produtos
     --------------------------------------------------------- */
  (() => {
    const pista = $('#prodPista');
    if (!pista) return;

    const barra = $('#prodBarra');
    const prev  = $('#prodPrev');
    const next  = $('#prodNext');
    const card  = $('.card', pista);

    const passo = () => {
      const gap = parseFloat(getComputedStyle($('#prodLista')).columnGap) || 16;
      return card.getBoundingClientRect().width + gap;
    };

    const pintar = () => {
      const max = pista.scrollWidth - pista.clientWidth;
      const pct = max > 4 ? pista.scrollLeft / max : 0;
      const w = Math.min(1, pista.clientWidth / pista.scrollWidth);

      barra.style.width = `${w * 100}%`;
      barra.style.transform = `translateX(${pct * ((1 - w) / w) * 100}%)`;

      if (prev) prev.disabled = pista.scrollLeft < 8;
      if (next) next.disabled = pista.scrollLeft > max - 8;
    };

    pista.addEventListener('scroll', () => requestAnimationFrame(pintar), { passive: true });
    addEventListener('resize', debounce(pintar, 150));

    const rolar = (dir) => pista.scrollBy({ left: dir * passo(), behavior: calmo() ? 'auto' : 'smooth' });
    prev?.addEventListener('click', () => rolar(-1));
    next?.addEventListener('click', () => rolar(1));

    pista.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); rolar(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); rolar(-1); }
    });

    /* arrastar com o mouse (o toque usa o scroll nativo) */
    let puxando = false, xIni = 0, slIni = 0, moveu = 0;

    pista.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      puxando = true; moveu = 0;
      xIni = e.clientX; slIni = pista.scrollLeft;
      pista.classList.add('arrastando');
      pista.setPointerCapture(e.pointerId);
    });

    pista.addEventListener('pointermove', (e) => {
      if (!puxando) return;
      const dx = e.clientX - xIni;
      moveu = Math.max(moveu, Math.abs(dx));
      pista.scrollLeft = slIni - dx;
    });

    const largar = (e) => {
      if (!puxando) return;
      puxando = false;
      pista.classList.remove('arrastando');
      try { pista.releasePointerCapture(e.pointerId); } catch {}
      // encaixa no card mais próximo
      const p = passo();
      pista.scrollTo({ left: Math.round(pista.scrollLeft / p) * p, behavior: calmo() ? 'auto' : 'smooth' });
    };
    pista.addEventListener('pointerup', largar);
    pista.addEventListener('pointercancel', largar);
    pista.addEventListener('click', (e) => { if (moveu > 6) e.preventDefault(); }, true);
    pista.addEventListener('dragstart', (e) => e.preventDefault());

    addEventListener('load', pintar);
    pintar();
  })();

  /* ---------------------------------------------------------
     util
     --------------------------------------------------------- */
  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }
})();
