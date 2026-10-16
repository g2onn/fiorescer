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
  const alvos = [...new Set([...$$('[data-reveal]'), ...$$('.qual__cards li'), ...$$('.ln')])];

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-ready');
    // Aplica o estado transparente antes do primeiro callback do observador.
    void document.documentElement.offsetHeight;
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

    // Nomes e ordem das cartelas do Catálogo Fiorescer 2026.
    // Os hex são aproximações visuais: o PDF não informa códigos de cor.
    const paletas = {
      brilhare: [
        ['Ouro', '#A18942'], ['Prata', '#B8BBB9'], ['Branco', '#E0E0DC'],
        ['Cappuccino', '#746859'], ['Rosé', '#A97F87'], ['Preto', '#1B1B18'],
      ],
      lotus: [
        ['Azul Jeans', '#607A9B'], ['Cacau', '#522B1A'], ['Ouro Antigo', '#9D7E39'], ['Pérola', '#E9D4C4'],
        ['Preto', '#171916'], ['Rosa Antigo', '#AB787F'], ['Rosa Pink', '#CB2E5D'], ['Verde Oliva', '#918E54'],
        ['Vermelho Paixão', '#A92B2D'], ['Palha', '#A07E53'], ['Ferrugem', '#9A4C23'], ['Verde Floresta', '#1F4F45'],
        ['Natural', '#D0CAB6'], ['Cinza Níquel', '#A5A896'], ['Azul Marinho', '#232962'], ['Verde Maçã', '#9BB45D'],
        ['Amarelo Sol', '#F0C148'], ['Azul Royal', '#313294'], ['Verde Bandeira', '#43A151'], ['Mostarda', '#C68B35'],
        ['Copa', 'linear-gradient(135deg,#148E57 0 34%,#F1CF45 34% 67%,#2374C6 67%)'],
      ],
      'lotus-glitter': [
        ['Pérola Glitter', '#C1A388'], ['Preto Glitter', '#2B413F'], ['Rosa Antigo Glitter', '#B37A94'],
        ['Ouro Antigo Glitter', '#9B6C33'], ['Vermelho Glitter', '#B9442E'], ['Verde Glitter', '#2D6D58'],
      ],
      'malha-residual': [
        ['Amarelo Claro', '#D7D278'], ['Amarelo Médio', '#D5B358'], ['Amarelo Escuro', '#C99614'],
        ['Azul Claro', '#81A9CA'], ['Azul Médio', '#2B83B5'], ['Azul Estonado', '#748AA5'], ['Azul Marinho', '#27375E'],
        ['Bordô', '#711A38'], ['Branco', '#F0F1ED'], ['Cinza Claro', '#B8C0C3'], ['Cinza Médio', '#8E989A'], ['Cinza Escuro', '#4F5860'],
        ['Cinza Mescla Claro', 'linear-gradient(135deg,#D8DEE0,#AAB3B7)'],
        ['Cinza Mescla Médio', 'linear-gradient(135deg,#ADB6B9,#727C82)'],
        ['Cinza Mescla Escuro', 'linear-gradient(135deg,#767F85,#424A51)'],
        ['Coral', '#F16A5C'], ['Laranja', '#EF680D'], ['Lilás', '#A99CBD'], ['Mostarda', '#C68B35'],
        ['Neon', 'linear-gradient(135deg,#D9F23D 0 33%,#FF56B2 33% 66%,#51DF86 66%)'],
        ['Nude', '#B7A993'], ['Off White', '#F1EDE5'], ['Preto', '#1B1B18'],
        ['Rosa Claro', '#D69EB4'], ['Rosa Médio', '#CF7891'], ['Rosa Envelhecido', '#B58A87'], ['Rosa Escuro', '#C92855'], ['Roxo', '#713F92'],
        ['Salmão', '#ECA07E'], ['Terrosos', 'linear-gradient(135deg,#D1AD8A 0 33%,#B37B58 33% 66%,#8F5639 66%)'],
        ['Verde Claro', '#9CB9A3'], ['Verde Médio', '#36AD87'], ['Verde Médio', '#36AD87'],
        ['Verde Escuro', '#267764'], ['Verde Escuro', '#267764'], ['Vermelho', '#D72E33'],
        ['Misturinha', 'linear-gradient(135deg,#D7B358 0 25%,#C92855 25% 50%,#267764 50% 75%,#607A9B 75%)'],
      ],
      'cotton-residual': [
        ['Azul Claro', '#81A9CA'], ['Azul Médio', '#2B83B5'], ['Azul Escuro', '#27375E'], ['Coral', '#F16A5C'],
        ['Verde Claro', '#9CB9A3'], ['Verde Médio', '#36AD87'], ['Verde Escuro', '#267764'], ['Laranja', '#EF680D'],
        ['Vermelho', '#D72E33'], ['Bordô', '#711A38'],
        ['Terrosos', 'linear-gradient(135deg,#D1AD8A 0 33%,#B37B58 33% 66%,#8F5639 66%)'],
        ['Terrosos', 'linear-gradient(135deg,#D1AD8A 0 33%,#B37B58 33% 66%,#8F5639 66%)'],
        ['Rosa Claro', '#D69EB4'], ['Rosa Médio', '#CF7891'], ['Rosa Escuro', '#C92855'], ['Rosa Envelhecido', '#B58A87'],
        ['Lilás', '#A99CBD'], ['Roxo', '#713F92'],
        ['Neon', 'linear-gradient(135deg,#D9F23D 0 33%,#FF56B2 33% 66%,#51DF86 66%)'], ['Nude', '#B7A993'],
        ['Amarelo Claro', '#D7D278'], ['Amarelo Médio', '#D5B358'], ['Amarelo Escuro', '#C99614'], ['Tom de Mostarda', '#C68B35'],
        ['Branco', '#F0F1ED'], ['Off White', '#F1EDE5'],
        ['Mescla Claro', 'linear-gradient(135deg,#D8DEE0,#AAB3B7)'],
        ['Mescla Médio', 'linear-gradient(135deg,#ADB6B9,#727C82)'],
        ['Mescla Escuro', 'linear-gradient(135deg,#767F85,#424A51)'],
        ['Cinza Claro', '#B8C0C3'], ['Cinza Médio', '#8E989A'], ['Cinza Escuro', '#4F5860'], ['Preto', '#1B1B18'],
      ],
      'poliamida-residual': [
        ['Amarelo Claro', '#D7D278'], ['Amarelo Escuro', '#C99614'], ['Azul Claro', '#81A9CA'], ['Azul Médio', '#2B83B5'],
        ['Azul Escuro', '#27375E'], ['Bordô', '#711A38'], ['Branco', '#F0F1ED'], ['Cinza', '#8E989A'], ['Laranja', '#EF680D'],
        ['Lilás', '#A99CBD'], ['Mescla', 'linear-gradient(135deg,#D8DEE0,#727C82)'], ['Mostarda', '#C68B35'],
        ['Neon', 'linear-gradient(135deg,#D9F23D 0 33%,#FF56B2 33% 66%,#51DF86 66%)'], ['Nude', '#B7A993'], ['Preto', '#1B1B18'],
        ['Rosa Claro', '#D69EB4'], ['Rosa Médio', '#CF7891'], ['Rosa Escuro', '#C92855'], ['Rosé', '#A97F87'], ['Roxo', '#713F92'],
        ['Salmão', '#ECA07E'], ['Verde Claro', '#9CB9A3'], ['Verde Médio', '#36AD87'], ['Verde Escuro', '#267764'],
        ['Vermelho', '#D72E33'],
        ['Terrosos', 'linear-gradient(135deg,#D1AD8A 0 33%,#B37B58 33% 66%,#8F5639 66%)'],
        ['Misturinha', 'linear-gradient(135deg,#D7B358 0 25%,#C92855 25% 50%,#267764 50% 75%,#607A9B 75%)'],
      ],
    };

    $$('.card__cores', pista).forEach((area) => {
      const cores = paletas[area.dataset.paleta] || [];
      const lista = area.parentElement.querySelector('.card__cores-lista');
      const nomeVisivel = area.parentElement.querySelector('.card__cor-nome');
      area.setAttribute('role', 'img');
      area.setAttribute('aria-label', `Cartela com ${cores.length} cores`);

      cores.forEach(([nome, cor]) => {
        const ponto = document.createElement('span');
        ponto.className = 'card__cor';
        ponto.dataset.nome = nome;
        ponto.style.setProperty('--cor', cor);
        ponto.setAttribute('aria-hidden', 'true');
        area.append(ponto);

        const item = document.createElement('li');
        item.textContent = nome;
        lista.append(item);
      });

      const mostrarNome = (nome) => {
        if (!nomeVisivel || nomeVisivel.textContent === nome) return;
        nomeVisivel.classList.remove('is-on');
        if (!nome) { nomeVisivel.textContent = ''; return; }
        requestAnimationFrame(() => {
          nomeVisivel.textContent = nome;
          nomeVisivel.classList.add('is-on');
        });
      };

      area.addEventListener('pointerover', (event) => {
        const ponto = event.target.closest('.card__cor');
        if (ponto && area.contains(ponto)) mostrarNome(ponto.dataset.nome);
      });
      area.addEventListener('pointerout', (event) => {
        if (event.pointerType === 'touch') return;
        if (!area.contains(event.relatedTarget)) mostrarNome('');
      });
      area.addEventListener('click', (event) => {
        const ponto = event.target.closest('.card__cor');
        if (ponto && area.contains(ponto)) mostrarNome(ponto.dataset.nome);
      });
    });

    const barra = $('#prodBarra');
    const prev  = $('#prodPrev');
    const next  = $('#prodNext');
    const lista = $('#prodLista');
    const cards = $$('.card', pista);
    const comportamento = () => calmo() ? 'auto' : 'smooth';
    let scrollDeOrigem = null;
    let retornoPendente = null;
    let temporizadorRetorno = 0;

    const maisPertoDoInicio = () => {
      if (pista.scrollLeft <= 8) return cards[0];
      const margem = Number.parseFloat(getComputedStyle(lista).paddingLeft) || 0;
      const inicio = pista.getBoundingClientRect().left + margem;
      return cards.reduce((maisPerto, atual) => {
        const distancia = Math.abs(atual.getBoundingClientRect().left - inicio);
        return distancia < maisPerto.distancia ? { card: atual, distancia } : maisPerto;
      }, { card: cards[0], distancia: Infinity }).card;
    };

    const alinharInicio = (card) => {
      if (!card) return;
      const pistaRect = pista.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const margem = Number.parseFloat(getComputedStyle(lista).paddingLeft) || 0;
      const left = pista.scrollLeft + cardRect.left - pistaRect.left - margem;
      pista.scrollTo({ left, behavior: comportamento() });
    };

    const centralizarAberto = (card) => card?.scrollIntoView({ behavior: comportamento(), block: 'start', inline: 'center' });
    let destinoAposFechar = null;

    const concluirRetorno = (card) => {
      if (retornoPendente !== card) return;
      clearTimeout(temporizadorRetorno);
      temporizadorRetorno = 0;
      retornoPendente = null;

      const aberto = $('.card.is-aberto', pista);
      if (aberto) {
        centralizarAberto(aberto);
        return;
      }

      pista.classList.remove('is-expandido');
      const proximo = destinoAposFechar;
      destinoAposFechar = null;
      if (proximo) {
        scrollDeOrigem = null;
        setTimeout(() => alinharInicio(proximo), calmo() ? 0 : 320);
        return;
      }
      const destino = scrollDeOrigem ?? pista.scrollLeft;
      scrollDeOrigem = null;
      requestAnimationFrame(() => pista.scrollTo({ left: destino, behavior: comportamento() }));
    };

    const fecharCard = (card, devolverFoco = false, proximoCard = null) => {
      if (!card?.classList.contains('is-aberto')) return;
      const abrir = $('.card__ver-mais', card);
      const fechar = $('.card__fechar', card);
      const detalhes = document.getElementById(abrir.getAttribute('aria-controls'));
      card.classList.remove('is-aberto');
      abrir.setAttribute('aria-expanded', 'false');
      abrir.hidden = false;
      fechar.hidden = true;
      detalhes.hidden = true;
      if (devolverFoco) abrir.focus({ preventScroll: true });
      destinoAposFechar = proximoCard;
      retornoPendente = card;
      clearTimeout(temporizadorRetorno);
      temporizadorRetorno = setTimeout(() => concluirRetorno(card), 360);
    };

    cards.forEach((card) => {
      const abrir = $('.card__ver-mais', card);
      const fechar = $('.card__fechar', card);
      const detalhes = document.getElementById(abrir.getAttribute('aria-controls'));

      abrir.addEventListener('click', () => {
        if (!$('.card.is-aberto', pista)) scrollDeOrigem = pista.scrollLeft;
        cards.forEach((outra) => { if (outra !== card) fecharCard(outra); });
        clearTimeout(temporizadorRetorno);
        temporizadorRetorno = 0;
        retornoPendente = null;
        destinoAposFechar = null;
        card.classList.add('is-aberto');
        pista.classList.add('is-expandido');
        abrir.setAttribute('aria-expanded', 'true');
        abrir.hidden = true;
        fechar.hidden = false;
        detalhes.hidden = false;
        requestAnimationFrame(() => {
          centralizarAberto(card);
          fechar.focus({ preventScroll: true });
        });
      });

      fechar.addEventListener('click', () => fecharCard(card, true));
      card.addEventListener('transitionend', (event) => {
        if (event.propertyName !== 'width') return;
        if (retornoPendente === card) {
          concluirRetorno(card);
          return;
        }
        centralizarAberto($('.card.is-aberto', pista));
      });
    });

    addEventListener('keydown', (event) => {
      if (event.key === 'Escape') fecharCard($('.card.is-aberto', pista), true);
    });

    const pintar = () => {
      const max = pista.scrollWidth - pista.clientWidth;
      const pct = max > 4 ? pista.scrollLeft / max : 0;
      const w = Math.min(1, pista.clientWidth / pista.scrollWidth);

      barra.style.width = `${w * 100}%`;
      barra.style.transform = `translateX(${pct * ((1 - w) / w) * 100}%)`;

      if (prev) prev.hidden = pista.scrollLeft <= 8;
      if (next) next.hidden = max <= 8 || pista.scrollLeft >= max - 8;
    };

    pista.addEventListener('scroll', () => requestAnimationFrame(pintar), { passive: true });
    addEventListener('resize', debounce(pintar, 150));

    const rolar = (dir) => {
      const aberto = $('.card.is-aberto', pista);
      const atual = aberto || maisPertoDoInicio();
      const indice = cards.indexOf(atual);
      const proximo = cards[Math.max(0, Math.min(cards.length - 1, indice + dir))];
      if (proximo === atual) return;
      if (aberto) {
        fecharCard(aberto, false, proximo);
        return;
      }
      alinharInicio(proximo);
    };
    prev?.addEventListener('click', () => rolar(-1));
    next?.addEventListener('click', () => rolar(1));

    pista.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); rolar(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); rolar(-1); }
    });

    addEventListener('resize', () => {
      const aberto = $('.card.is-aberto', pista);
      if (aberto) centralizarAberto(aberto);
    });
    addEventListener('load', pintar);
    pista.scrollLeft = 0;
    pintar();
  })();

  /* ---------------------------------------------------------
     11 · Vídeo do canal: toca visível, sem controles nativos
     --------------------------------------------------------- */
  (() => {
    const video = $('#videoFiorescer');
    const botao = $('#videoSom');
    if (!video || !botao) return;

    const icones = $$('.canal__som-icone', botao);
    let naTela = false;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const atualizarBotao = () => {
      const comSom = !video.muted;
      botao.setAttribute('aria-pressed', String(comSom));
      botao.setAttribute('aria-label', comSom ? 'Silenciar áudio do vídeo' : 'Ativar áudio do vídeo');
      icones[0].toggleAttribute('hidden', !comSom);
      icones[1].toggleAttribute('hidden', comSom);
    };

    const iniciar = () => {
      if (!naTela || document.hidden) return;
      video.play()?.catch(() => {});
    };

    botao.addEventListener('click', () => {
      video.muted = !video.muted;
      atualizarBotao();
      iniciar();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else iniciar();
    });

    if ('IntersectionObserver' in window) {
      const observador = new IntersectionObserver(([entrada]) => {
        naTela = entrada.isIntersecting && entrada.intersectionRatio >= .15;
        if (naTela) iniciar();
        else video.pause();
      }, { threshold: [0, .15] });
      observador.observe(video);
    } else {
      naTela = true;
      iniciar();
    }

    atualizarBotao();
  })();

  /* ---------------------------------------------------------
     util
     --------------------------------------------------------- */
  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }
})();
