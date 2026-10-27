/* ==========================================================================
   Le Cabinet des Fées · Brest : mise en scène
   GSAP + ScrollTrigger + SplitText + DrawSVG, Lenis (tous embarqués).
   Règles : on n'anime que transform / opacity (+ clip-path pour les révélations),
   courbes douces (expo / power3), tout est neutralisé avec prefers-reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const NARROW = () => window.innerWidth <= 900;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (name, attrs = {}) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  const nav = $('#nav');
  const loader = $('#loader');
  let lenis = null;
  let loaderGone = false;

  /* ------------------------------------------------------------------------
     Utilitaires géométriques
     ------------------------------------------------------------------------ */

  /** Position d'un élément dans un ancêtre positionné, sans tenir compte des transform. */
  function posIn(el, ancestor) {
    let x = 0, y = 0, n = el;
    while (n && n !== ancestor) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y };
  }

  /** Courbe douce passant par une suite de points (Catmull-Rom → Bézier). */
  function smoothPath(pts, k = 1) {
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }

  /* ------------------------------------------------------------------------
     Contenus dynamiques sans animation : année, horaires, statut, avis, menu…
     ------------------------------------------------------------------------ */

  const SCHEDULE = { 1: [540, 1170], 2: [540, 1170], 3: [540, 1170], 4: [540, 1230], 5: [540, 1230], 6: [540, 1230] };
  const fmt = (m) => `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;

  function parisNow() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
    return { day, min: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
  }

  function initStatusAndHours() {
    const { day, min } = parisNow();
    const li = $(`#hours li[data-day="${day}"]`);
    if (li) li.classList.add('is-today');
    const out = $('#openStatus span');
    if (!out) return;
    const s = SCHEDULE[day];
    if (!s) out.textContent = 'Dimanche : appelez-nous au 02 98 46 83 06';
    else if (min < s[0]) out.textContent = `Ouvre aujourd’hui à ${fmt(s[0])} · Brest`;
    else if (min < s[1]) out.textContent = `Ouvert jusqu’à ${fmt(s[1])} · Brest`;
    else { out.textContent = 'Fermé pour aujourd’hui · Brest'; $('#openStatus .dot').style.opacity = '.4'; }
  }

  function initPrep() {
    const say = $('#prepSentence');
    const sentences = {
      'un massage': 'Bonjour, je souhaiterais réserver un massage.',
      'un soin du corps': 'Bonjour, je souhaiterais réserver un soin du corps.',
      'un soin du visage': 'Bonjour, je souhaiterais réserver un soin du visage.',
      'une beauté des mains et des pieds': 'Bonjour, je souhaiterais réserver une beauté des mains et des pieds.',
      'un moment sur mesure, pouvez-vous me conseiller': 'Bonjour, je voudrais me faire du bien mais je ne sais pas encore quoi choisir : pouvez-vous me conseiller ?'
    };
    $$('.prep input').forEach((input) => input.addEventListener('change', () => {
      say.textContent = sentences[input.value] || sentences['un massage'];
      if (!REDUCE && window.gsap) gsap.fromTo(say, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' });
    }));
  }

  /* ------------------------------------------------------------------------
     Décor généré : feuillage en feutre appliqué + lucioles
     ------------------------------------------------------------------------ */

  const leafD = (L, W) => `M0 0C${W} ${-L * .3} ${W * 1.05} ${-L * .72} 0 ${-L}C${-W * 1.05} ${-L * .72} ${-W} ${-L * .3} 0 0Z`;

  function branch(g, [x0, y0, cx, cy, x1, y1, n, L0], st) {
    g.appendChild(svgEl('path', { d: `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`, fill: 'none', stroke: st.stem, 'stroke-width': st.sw, 'stroke-linecap': 'round', ...(st.stemDash ? { 'stroke-dasharray': st.stemDash } : {}) }));
    const leaf = (px, py, rot, L) => {
      const W = L * rand(.27, .34);
      const lg = svgEl('g', { transform: `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${rot.toFixed(1)})` });
      lg.appendChild(svgEl('path', { d: leafD(L, W), fill: st.fill, 'fill-opacity': st.fo, ...(st.stroke ? { stroke: st.stroke, 'stroke-width': 1.4, 'stroke-dasharray': '5 6', 'stroke-linecap': 'round' } : {}) }));
      if (st.rib) lg.appendChild(svgEl('path', { d: `M0 -${L * .06}L0 -${L * .9}`, fill: 'none', stroke: st.rib, 'stroke-width': 1.1, 'stroke-dasharray': '3 5', 'stroke-linecap': 'round' }));
      g.appendChild(lg);
    };
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / (n + 1);
      const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
      const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
      const ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      const L = L0 * (1 - .5 * t) * rand(.86, 1.08);
      leaf(px, py, ang + (i % 2 ? 1 : -1) * rand(42, 62), L);
      if (i % 3 === 0) leaf(px, py, ang + (i % 2 ? -1 : 1) * rand(46, 70), L * .8);
    }
    leaf(x1, y1, Math.atan2(y1 - cy, x1 - cx) * 180 / Math.PI + 90, L0 * .5);
  }

  function buildFoliage() {
    const defs = {
      far: { fill: '#D9CFA5', fo: .075, stem: 'rgba(217,207,165,.12)', sw: 3, items: [[1700, -60, 1300, 220, 880, 110, 11, 250], [-100, 540, 230, 410, 540, 650, 10, 240], [900, 1100, 1020, 820, 1280, 760, 10, 220]] },
      mid: { fill: '#5D693D', fo: 1, stem: 'rgba(231,189,79,.5)', sw: 1.6, stemDash: '4 6', stroke: 'rgba(231,189,79,.62)', rib: 'rgba(231,189,79,.38)', items: [[1660, 280, 1390, 540, 1500, 880, 12, 205], [-70, -50, 270, 170, 340, 430, 12, 195], [640, 1090, 650, 900, 830, 810, 9, 170], [1090, -90, 1180, 70, 1390, 40, 7, 150]] },
      near: { fill: '#262D16', fo: .94, stem: '#262D16', sw: 6, items: [[-90, 1110, 110, 790, 430, 700, 9, 340], [1710, 1060, 1450, 800, 1170, 770, 9, 330], [1680, -90, 1570, 150, 1420, 170, 6, 270]] }
    };
    Object.entries(defs).forEach(([key, def]) => {
      const host = $(`.layer--${key}`);
      if (!host) return;
      const svg = svgEl('svg', { viewBox: '0 0 1600 1000', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true', focusable: 'false' });
      const g = svgEl('g');
      def.items.forEach((it) => branch(g, it, def));
      svg.appendChild(g);
      host.appendChild(svg);
    });
  }

  function buildFireflies() {
    $$('.fireflies').forEach((box) => {
      let n = parseInt(box.dataset.fireflies, 10) || 12;
      if (NARROW()) n = Math.ceil(n * .55);
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const f = document.createElement('i');
        f.className = 'fly';
        const s = rand(4, 10) * (Math.random() < .16 ? 1.9 : 1);
        f.style.cssText = `--x:${rand(2, 98).toFixed(1)}%;--y:${rand(4, 96).toFixed(1)}%;--s:${s.toFixed(1)}px;--d:${rand(10, 22).toFixed(1)}s;--t:${rand(3.6, 8.5).toFixed(1)}s;--dl:${(-rand(0, 14)).toFixed(1)}s;`
          + `--dx1:${rand(-70, 70).toFixed(0)}px;--dy1:${rand(-70, 70).toFixed(0)}px;--dx2:${rand(-90, 90).toFixed(0)}px;--dy2:${rand(-90, 90).toFixed(0)}px;--dx3:${rand(-60, 60).toFixed(0)}px;--dy3:${rand(-80, 40).toFixed(0)}px;`;
        frag.appendChild(f);
      }
      box.appendChild(frag);
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting)), { rootMargin: '120px' });
      $$('.fireflies').forEach((b) => io.observe(b));
    }
  }

  /* ------------------------------------------------------------------------
     Menu mobile
     ------------------------------------------------------------------------ */
  let menuOpen = false;
  function initMenu() {
    const burger = $('.nav__burger');
    const menu = $('#menu');
    const bg = $('.menu__bg');
    const links = $$('.menu__links a span');
    const setOpen = (open) => {
      if (open === menuOpen) return;
      menuOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-menu', open);
      $('#fab') && $('#fab').classList.toggle('is-hidden', open);
      if (open) {
        menu.hidden = false;
        lenis && lenis.stop();
        document.documentElement.style.overflow = 'hidden';
        if (window.gsap && !REDUCE) {
          gsap.fromTo(bg, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' });
          gsap.fromTo(links, { y: '105%' }, { y: '0%', duration: 1.1, ease: 'expo.out', stagger: .06, delay: .25 });
        } else { bg.style.clipPath = 'none'; links.forEach((l) => { l.style.transform = 'none'; }); }
        (menu.querySelector('a') || burger).focus({ preventScroll: true });
      } else {
        const done = () => { menu.hidden = true; document.documentElement.style.overflow = ''; lenis && lenis.start(); };
        if (window.gsap && !REDUCE) {
          gsap.to(links, { y: '105%', duration: .5, ease: 'power3.in', stagger: .03 });
          gsap.to(bg, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'expo.inOut', delay: .15, onComplete: done });
        } else done();
        burger.focus({ preventScroll: true });
      }
    };
    burger.addEventListener('click', () => setOpen(!menuOpen));
    document.addEventListener('keydown', (e) => {
      if (!menuOpen) return;
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab') {
        const f = [burger, ...$$('a, button', menu)].filter((el) => !el.disabled && el.offsetParent !== null);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.closeMenu = () => setOpen(false);
  }

  /* Ancres : défilement doux (Lenis) ou natif */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        const wasOpen = menuOpen;
        wasOpen && window.closeMenu && window.closeMenu();
        const go = () => {
          if (lenis) lenis.scrollTo(id === '#accueil' ? 0 : target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
          else target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          history.replaceState(null, '', id);
        };
        wasOpen ? setTimeout(go, 950) : go();
      });
    });
    const up = $('.footer__up');
    up && up.addEventListener('click', () => (lenis ? lenis.scrollTo(0, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) }) : window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' })));
  }

  /* ------------------------------------------------------------------------
     Navigation & progression (sans GSAP : valable aussi en mouvement réduit)
     ------------------------------------------------------------------------ */
  function initScrollChrome() {
    const bar = $('.progress__bar');
    const star = $('.progress__star');
    const fab = $('#fab');
    let lastY = window.scrollY, hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(y / max, 0, 1) : 0;
      bar.style.transform = `scaleX(${p})`;
      star.style.transform = `translateX(${p * window.innerWidth - 10}px)`;
      star.style.opacity = p > .004 && p < .996 ? '1' : '0';
      nav.classList.toggle('is-solid', y > 60);
      if (fab) fab.classList.toggle('is-on', y > window.innerHeight * .7);
      if (!REDUCE && !menuOpen) {
        const down = y > lastY;
        if (y > 220 && down && !hidden) { hidden = true; nav.classList.add('is-hidden'); }
        else if ((!down || y <= 220) && hidden) { hidden = false; nav.classList.remove('is-hidden'); }
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ------------------------------------------------------------------------
     Avis : pile de lettres (carrousel accessible)
     ------------------------------------------------------------------------ */
  function initReviews() {
    const wrap = $('#stack');
    if (!wrap) return;
    const cards = $$('.review', wrap);
    const n = cards.length;
    const idxOut = $('#reviewIdx');
    const pauseBtn = $('.stack__pause', wrap);
    let idx = 0, timer = null, paused = false, inView = false, hovering = false;
    const hasG = !!window.gsap && !REDUCE;

    // Les avis courts respirent : police plus grande
    cards.forEach((c) => {
      const len = c.querySelector('blockquote').textContent.length;
      if (len < 330) c.querySelector('blockquote').style.fontSize = 'clamp(1.3rem, 1.05rem + 1vw, 1.9rem)';
    });
    cards.forEach((c) => { c.style.display = 'flex'; c.style.flexDirection = 'column'; c.querySelector('blockquote').style.marginBlock = 'auto'; });

    const state = (pos) => {
      if (pos === 0) return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 5 };
      if (pos === 1) return { x: 26, y: 18, rotate: 2.4, scale: .975, opacity: 1, zIndex: 4 };
      if (pos === 2) return { x: -22, y: 34, rotate: -2.8, scale: .95, opacity: 1, zIndex: 3 };
      return { x: 0, y: 44, rotate: 0, scale: .93, opacity: 0, zIndex: 1 };
    };
    const place = (animate, leavingIdx, dir) => {
      cards.forEach((c, i) => {
        const pos = (i - idx + n) % n;
        const st = state(pos);
        const active = pos === 0;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (!hasG || !animate) { if (window.gsap) gsap.set(c, st); else Object.assign(c.style, { opacity: active ? 1 : 0 }); return; }
        if (i === leavingIdx) {
          gsap.timeline()
            .set(c, { zIndex: 6 })
            .to(c, { x: -dir * 130, y: -24, rotate: -dir * 9, opacity: 0, duration: .55, ease: 'power3.in' })
            .set(c, st);
        } else {
          gsap.to(c, { ...st, duration: 1.1, ease: 'expo.out', delay: pos === 0 ? .25 : 0, overwrite: 'auto' });
        }
      });
      idxOut.textContent = String(idx + 1);
    };
    const go = (to, dir = 1, animate = true) => { const prev = idx; idx = (to + n) % n; place(animate, prev, dir); schedule(); };
    const next = () => go(idx + 1, 1);
    const prev = () => go(idx - 1, -1);
    $('.knob--next', wrap).addEventListener('click', next);
    $('.knob--prev', wrap).addEventListener('click', prev);
    wrap.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });

    // Glisser / balayer
    const zone = $('.stack__cards', wrap);
    let sx = null, dx = 0;
    zone.addEventListener('pointerdown', (e) => { sx = e.clientX; dx = 0; });
    zone.addEventListener('pointermove', (e) => { if (sx !== null) dx = e.clientX - sx; });
    const end = () => { if (sx !== null && Math.abs(dx) > 55) (dx < 0 ? next : prev)(); sx = null; dx = 0; };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', () => { sx = null; });

    // Lecture automatique, respectueuse (pause explicite, survol, focus, hors écran)
    function schedule() {
      clearTimeout(timer);
      if (REDUCE || paused || hovering || !inView) return;
      const len = cards[idx].querySelector('blockquote').textContent.length;
      timer = setTimeout(next, clamp(5200 + len * 22, 6500, 17000));
    }
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.firstElementChild.textContent = paused ? 'Reprendre la lecture' : 'Mettre en pause';
      schedule();
    });
    wrap.addEventListener('pointerenter', () => { hovering = true; clearTimeout(timer); });
    wrap.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    wrap.addEventListener('focusin', () => { hovering = true; clearTimeout(timer); });
    wrap.addEventListener('focusout', () => { hovering = false; schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => { inView = es[0].isIntersecting; schedule(); }, { threshold: .35 }).observe(wrap);
    }
    if (REDUCE) pauseBtn.hidden = true;

    place(false);
  }

  /** Le texte circulaire du bouton d'appel remplit exactement le cercle (sans chevauchement). */
  function fitRingText() {
    const tp = $('.bigbtn__ring textPath');
    const path = $('#ringPath');
    if (!tp || !path || !path.getTotalLength) return;
    const fit = () => {
      tp.style.letterSpacing = '0px';
      const target = path.getTotalLength();
      const len = tp.getComputedTextLength();
      const extra = (target - len) / tp.textContent.length;
      tp.style.letterSpacing = Math.max(0, extra).toFixed(2) + 'px';
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* ------------------------------------------------------------------------
     Si l'utilisateur préfère moins de mouvement : on s'arrête ici.
     ------------------------------------------------------------------------ */
  function staticMode() {
    document.documentElement.classList.add('is-static');
    loader && loader.remove();
    initStatusAndHours(); initPrep(); initMenu(); initAnchors(); initScrollChrome();
    buildFoliage(); buildFireflies(); initReviews(); fitRingText();
    $('#year').textContent = new Date().getFullYear();
    $$('.hero__scroll').forEach((e) => e.remove());
  }

  /* ========================================================================
     MISE EN SCÈNE (GSAP)
     ======================================================================== */
  function stage() {
    gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
    gsap.defaults({ ease: 'power3.out' });
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();

    /* Lenis ---------------------------------------------------------------- */
    lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .92, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();

    /* Hero : titre, fil, calques ------------------------------------------ */
    const heroTitle = $('.hero__title');
    heroTitle.setAttribute('aria-label', 'Une parenthèse enchantée');
    $$('.hl', heroTitle).forEach((l) => l.setAttribute('aria-hidden', 'true'));
    const heroSplit = SplitText.create('.hl__w', { type: 'chars', mask: 'chars', aria: 'none', charsClass: 'ch', maskClass: 'mask-line' });

    function buildHeroThread() {
      const hero = $('.hero'), svg = $('.thread--hero');
      const h = hero.getBoundingClientRect();
      const W = h.width, H = h.height;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const rel = (el) => { const r = el.getBoundingClientRect(); return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height, b: r.bottom - h.top, r: r.right - h.left }; };
      const l1 = rel($('.hl--1 .hl__w')), l2 = rel($('.hl--2 .hl__w')), l3 = rel($('.hl--3 .hl__w')), cta = rel($('.hero__cta .btn'));
      const nv = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
      const pts = NARROW()
        ? [[-30, nv + 30], [W * .08, l1.b - l1.h * .2], [W * .62, l2.y + l2.h * .55], [W * .22, l3.y + l3.h * .85], [W * .7, l3.b + 8], [cta.x - 8, cta.y + cta.h / 2]]
        : [[-40, nv + 20], [W * .035, l1.y + l1.h * .72], [l1.r + 24, l1.y + l1.h * .96], [W * .52, l2.y + l2.h * .04], [W * .93, l2.y + l2.h * .9], [W * .56, l3.y + l3.h * .98], [W * .2, l3.b + 6], [cta.x - 10, cta.y + cta.h / 2]];
      const d = smoothPath(pts);
      $$('.thread--hero path').forEach((p) => p.setAttribute('d', d));
    }
    buildHeroThread();

    const introTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    introTl
      .from('.hero__layers .layer', { scale: 1.16, opacity: 0, duration: 2.4, stagger: .16, ease: 'power3.out' }, 0)
      .from(heroSplit.chars, { yPercent: 120, rotate: 8, duration: 1.6, stagger: { each: .045 } }, .1)
      .from('.hl__star', { scale: 0, rotate: -200, duration: 1.6, ease: 'back.out(2.2)' }, .95)
      .to('.hl__star', { rotate: 360, duration: 14, ease: 'none', repeat: -1 }, 2.4)
      .from('.hero__intro', { y: 36, opacity: 0, duration: 1.3 }, .8)
      .from('.hero__patch', { clipPath: 'circle(0% at 50% 55%)', rotate: -16, scale: .78, duration: 1.8 }, .55)
      .from('.hero__cta > *', { y: 32, opacity: 0, duration: 1.2, stagger: .12 }, 1)
      .from('.hero__status', { opacity: 0, x: 24, duration: 1.1 }, 1.25)
      .fromTo('.thread--hero .thread__path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 3.2, ease: 'power2.inOut' }, .25)
      .from('.thread--hero .thread__stitch', { opacity: 0, duration: 1.4, ease: 'power1.out' }, 1.2)
      .from('.nav > *', { yPercent: -140, opacity: 0, duration: 1.3, stagger: .08 }, .9);

    // Parallax multicouche (défilement + pointeur)
    $$('.layer').forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth);
      gsap.to(layer, { yPercent: depth * 26, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    mm.add('(min-width: 901px)', () => {
      gsap.to('.hero__title', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero__intro', { yPercent: -30, opacity: .0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '85% top', scrub: true } });
    gsap.to('.hero__patch', { y: -70, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (FINE) {
      const qx = $$('.layer').map((l) => ({ q: gsap.quickTo(l, 'x', { duration: 1.4, ease: 'power3' }), d: parseFloat(l.dataset.depth) }));
      const qy = $$('.layer').map((l) => ({ q: gsap.quickTo(l, 'rotation', { duration: 1.6, ease: 'power3' }), d: parseFloat(l.dataset.depth) }));
      window.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - .5;
        qx.forEach((o) => o.q(-nx * 70 * o.d));
        qy.forEach((o) => o.q(nx * 1.1 * o.d));
      }, { passive: true });
    }

    /* Préchargeur ---------------------------------------------------------- */
    const marks = $$('.lm:not(.lm--thread)', loader);
    gsap.set(marks, { drawSVG: '0%' });
    gsap.set('.lm--thread', { opacity: 0 });
    const countEl = $('#loaderCount');
    const prog = { v: 0 };
    const setCount = () => { countEl.textContent = String(Math.round(prog.v)); };
    gsap.to(marks, { drawSVG: '100%', duration: 1.7, stagger: .16, ease: 'power2.inOut' });
    gsap.to('.lm--thread', { opacity: 1, duration: .8, delay: 1.5 });
    gsap.to('.loader__name', { opacity: 1, duration: 0 });
    gsap.from('.loader__name, .loader__count', { y: 16, opacity: 0, duration: 1, delay: .4, stagger: .12 });
    gsap.to(prog, { v: 86, duration: 1.7, ease: 'power1.out', onUpdate: setCount });

    const heroImg = $('.hero__patch img');
    const imgReady = heroImg && heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve();
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const minTime = new Promise((r) => setTimeout(r, 1900));
    let leaving = false;
    const leave = () => {
      if (leaving) return;
      leaving = true;
      gsap.to(prog, { v: 100, duration: .5, ease: 'power2.out', onUpdate: setCount });
      const tl = gsap.timeline({ delay: .45, onComplete: () => { loaderGone = true; loader.remove(); lenis.start(); ScrollTrigger.refresh(); } });
      tl.to('.loader__center', { scale: .9, opacity: 0, duration: .55, ease: 'power3.in' })
        .to('.loader__panel--l', { xPercent: -104, duration: 1.45, ease: 'expo.inOut' }, '-=.15')
        .to('.loader__panel--r', { xPercent: 104, duration: 1.45, ease: 'expo.inOut' }, '<')
        .add(() => introTl.play(), '-=1.05');
    };
    Promise.all([imgReady, fontsReady, minTime]).then(leave);
    setTimeout(leave, 6500); // garde-fou

    /* Navigation, curseur, boutons magnétiques ----------------------------- */
    if (FINE) {
      const cur = $('.cursor');
      const ring = $('.cursor__ring');
      const label = $('.cursor__label');
      const cx = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' });
      const cy = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
      let shown = false;
      window.addEventListener('pointermove', (e) => {
        if (!shown) { shown = true; gsap.set(cur, { x: e.clientX, y: e.clientY }); cur.classList.add('is-on'); }
        cx(e.clientX); cy(e.clientY);
      }, { passive: true });
      document.addEventListener('pointerover', (e) => {
        const t = e.target.closest('[data-cursor]');
        if (t) { label.textContent = t.dataset.cursor; cur.classList.add('is-link'); }
        else cur.classList.remove('is-link');
      });
      $$('[data-magnetic]').forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: .7, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: .7, ease: 'power3' });
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * .3);
          yTo((e.clientY - (r.top + r.height / 2)) * .4);
        });
        el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
      });
    }

    /* Inclinaison 3D + reflet qui suit la souris ---------------------------- */
    function tilt(el, max) {
      if (!FINE) return;
      let glare = $('.soin__glare', el);
      if (!glare) { glare = document.createElement('span'); glare.className = 'soin__glare'; glare.setAttribute('aria-hidden', 'true'); el.appendChild(glare); }
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: .7, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: .7, ease: 'power3' });
      const gx = gsap.quickTo(glare, 'x', { duration: .5, ease: 'power3' });
      const gy = gsap.quickTo(glare, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        ry(px * max * 2); rx(-py * max * 2);
        gx(px * r.width * 1.1 + r.width * .5); gy(py * r.height * 1.1 + r.height * .5);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
    $$('.soin').forEach((c) => tilt(c, 7));
    $$('.patch').forEach((c) => tilt(c, 5));

    /* Titres : lignes masquées qui montent ---------------------------------- */
    $$('[data-split="lines"]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'line', maskClass: 'mask-line',
        onSplit(self) {
          return gsap.from(self.lines, { yPercent: 115, rotate: 2.5, duration: 1.4, ease: 'expo.out', stagger: .11, scrollTrigger: { trigger: el, start: 'top 87%', once: true } });
        }
      });
    });

    /* Rubans (marquee réactif au scroll) ------------------------------------ */
    $$('[data-marquee]').forEach((rib) => {
      const track = $('.ribbon__track', rib);
      const dir = parseInt(rib.dataset.marquee, 10) || 1;
      const html = track.innerHTML;
      while (track.scrollWidth < window.innerWidth * 2.6) track.insertAdjacentHTML('beforeend', html);
      let x = 0, boost = 0, lastY = window.scrollY;
      const base = 70 * dir;
      let loopW = 0;
      const measure = () => {
        // largeur d'un motif : on cherche la première répétition du premier mot
        const kids = Array.from(track.children);
        const firstText = kids[0].textContent;
        const rep = kids.findIndex((k, i) => i > 0 && k.textContent === firstText && k.tagName === kids[0].tagName);
        loopW = rep > 0 ? kids[rep].offsetLeft - kids[0].offsetLeft : track.scrollWidth / 2;
      };
      measure();
      ScrollTrigger.addEventListener('refresh', measure);
      gsap.ticker.add((time, dt) => {
        const v = window.scrollY - lastY; lastY = window.scrollY;
        boost += (clamp(v * .22, -9, 9) - boost) * .08;
        x += base * (1 + boost) * (dt / 1000);
        const wrapped = ((x % loopW) + loopW) % loopW;
        gsap.set(track, { x: -wrapped });
      });
      // rubans : léger balancement à l'arrivée
      gsap.from(rib, { yPercent: 40 * dir, rotate: dir * 5, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: rib, start: 'top 98%', once: true } });
    });

    /* Valeurs --------------------------------------------------------------- */
    const lead = $('[data-scrub-words]');
    if (lead) {
      const ws = SplitText.create(lead, { type: 'words', wordsClass: 'w', aria: 'auto' });
      gsap.to(ws.words, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: lead, start: 'top 82%', end: 'bottom 52%', scrub: .6 } });
    }
    gsap.to('.valeurs__spark', { rotation: 220, ease: 'none', scrollTrigger: { trigger: '.valeurs', start: 'top bottom', end: 'bottom top', scrub: .8 } });
    $$('.pillar').forEach((p) => {
      const sp = parseFloat(p.dataset.speed || '1');
      gsap.from(p, { clipPath: 'inset(100% 0 0 0)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 90%', once: true } });
      gsap.fromTo(p, { y: sp * 90 }, { y: -sp * 50, ease: 'none', scrollTrigger: { trigger: '.pillars', start: 'top bottom', end: 'bottom top', scrub: .7 } });
    });

    /* Rituel épinglé ---------------------------------------------------------- */
    mm.add('(min-width: 901px)', () => {
      const sec = $('.rituel');
      const stages = $$('.stage', sec);
      const stories = $$('.story', sec);
      const bgs = $$('.bg', sec);
      const steps = $$('.step', sec);
      const fill = document.createElement('span');
      fill.className = 'steps__fill';
      $('.steps', sec).appendChild(fill);

      gsap.set(stages[0], { clipPath: 'circle(78% at 50% 50%)' });
      gsap.set(stages.slice(1), { autoAlpha: 0, clipPath: 'circle(0% at 50% 50%)' });
      gsap.set(stories.slice(1), { autoAlpha: 0, y: 40 });
      gsap.set(bgs.slice(1), { opacity: 0 });

      // fil d'or qui serpente derrière la scène
      const buildStageThread = () => {
        const st = $('.rituel__stage', sec); const svg = $('.thread--stage', sec);
        const W = st.clientWidth, H = st.clientHeight;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        $('path', svg).setAttribute('d', smoothPath([[W * .1, -40], [W * .86, H * .12], [W * .16, H * .36], [W * .9, H * .6], [W * .22, H * .82], [W * .6, H + 40]]));
      };
      buildStageThread();
      ScrollTrigger.addEventListener('refreshInit', buildStageThread);

      let active = -1;
      const setActive = (i) => {
        if (i === active) return;
        active = i;
        steps.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-done', k < i); });
        sec.dataset.tone = i >= 2 ? 'dark' : 'light';
      };
      setActive(0);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, start: 'top top', end: '+=330%', pin: true, scrub: .7, anticipatePin: 1,
          onUpdate: (self) => setActive(clamp(Math.floor(self.progress * 4 + .22), 0, 3)),
          onLeave: () => setActive(3)
        }
      });
      tl.to(fill, { scaleX: 1, duration: 4 }, 0);
      tl.fromTo('.thread--stage path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 4 }, 0);
      tl.fromTo('.stage--1 img', { scale: 1.14 }, { scale: 1.3, duration: 1.2 }, 0);
      tl.fromTo('.stage--2 img', { scale: 1.3 }, { scale: 1.14, duration: 1.6 }, 1);
      for (let k = 1; k <= 3; k++) {
        const t = k - .2, d = .42;
        tl.to(bgs[k], { opacity: 1, duration: d }, t);
        tl.to(stories[k - 1], { autoAlpha: 0, y: -34, duration: d * .6 }, t);
        tl.to(stages[k - 1], { clipPath: 'circle(0% at 50% 50%)', scale: .9, autoAlpha: 0, duration: d, ease: 'power2.in' }, t);
        tl.fromTo(stages[k], { clipPath: 'circle(0% at 50% 50%)', scale: .92 }, { clipPath: 'circle(78% at 50% 50%)', scale: 1, autoAlpha: 1, duration: d * 1.2, ease: 'power2.out' }, t + d * .35);
        tl.fromTo(stories[k], { y: 44 }, { autoAlpha: 1, y: 0, duration: d, ease: 'power2.out' }, t + d * .5);
      }
      // le nœud final se noue
      tl.fromTo('.bow', { drawSVG: '0%' }, { drawSVG: '100%', duration: .6, stagger: .06 }, 2.8);
      return () => { ScrollTrigger.removeEventListener('refreshInit', buildStageThread); };
    });

    mm.add('(max-width: 900px)', () => {
      $$('.story').forEach((s) => gsap.from(s, { y: 50, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%', once: true } }));
    });

    /* Soins : défilement horizontal piloté par le vertical ---------------------- */
    mm.add('(min-width: 901px)', () => {
      const sec = $('.soins');
      const track = $('.soins__track', sec);
      const thread = $('.soins__rail-thread', sec);
      const idx = $('#soinsIdx');
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const move = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => { gsap.set(thread, { scaleX: self.progress }); idx.textContent = String(clamp(Math.ceil(self.progress * 5 - .15) || 1, 1, 5)); }
        }
      });
      // Navigation clavier : une carte qui reçoit le focus est ramenée au centre de l'écran
      const onFocus = (e) => {
        const card = e.target.closest('.soin');
        const st = move.scrollTrigger;
        if (!card || !st) return;
        const p = clamp((card.offsetLeft + card.offsetWidth / 2 - window.innerWidth / 2) / dist(), 0, 1);
        const y = st.start + p * (st.end - st.start);
        lenis ? lenis.scrollTo(y, { duration: 1.1 }) : window.scrollTo(0, y);
      };
      track.addEventListener('focusin', onFocus);
      $$('.soin', sec).forEach((card, i) => {
        gsap.from(card, { opacity: 0, y: 90, rotate: i % 2 ? 6 : -6, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 94%', toggleActions: 'play none none reverse' } });
      });
      gsap.from('.soins__outro > *', { opacity: 0, y: 40, duration: 1.1, stagger: .12, scrollTrigger: { trigger: '.soins__outro', containerAnimation: move, start: 'left 90%', toggleActions: 'play none none reverse' } });
      return () => track.removeEventListener('focusin', onFocus);
    });
    mm.add('(max-width: 900px)', () => {
      gsap.from('.soin', { opacity: 0, y: 40, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.soins__track', start: 'top 85%', once: true } });
    });

    /* Chiffres : boutons qui roulent, compteurs, fil dans les trous ------------ */
    {
      const sec = $('.chiffres');
      const ul = $('.buttons', sec);
      const discs = $$('.btnn__disc', sec);
      const fmtN = new Intl.NumberFormat('fr-FR');
      $$('[data-count]', sec).forEach((s) => { s.textContent = '0'; });
      gsap.from(discs, { scale: .25, rotate: -240, opacity: 0, duration: 1.7, ease: 'expo.out', stagger: .16, scrollTrigger: { trigger: ul, start: 'top 82%', once: true } });
      $$('[data-count]', sec).forEach((s, i) => {
        const o = { v: 0 }, target = parseInt(s.dataset.count, 10);
        gsap.to(o, { v: target, duration: 2.4, ease: 'power3.out', delay: .1 + i * .16, scrollTrigger: { trigger: ul, start: 'top 82%', once: true }, onUpdate: () => { s.textContent = fmtN.format(Math.round(o.v)); } });
      });
      gsap.from('.btnn__label', { opacity: 0, y: 22, duration: 1.2, stagger: .14, scrollTrigger: { trigger: ul, start: 'top 75%', once: true } });

      const svg = $('.thread--chiffres', sec);
      const path = $('path', svg);
      const build = () => {
        if (NARROW()) return;
        const W = sec.clientWidth, H = sec.clientHeight;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        const holes = discs.map((d) => $$('.hole', d).map((h) => {
          const a = posIn(d, sec); const hx = h.offsetLeft + h.offsetWidth / 2, hy = h.offsetTop + h.offsetHeight / 2;
          return [a.x + hx, a.y + hy];
        }));
        let d = `M-40 ${holes[0][0][1] - 120}`;
        const first = holes[0][0];
        d += `C${first[0] - 160} ${first[1] - 100} ${first[0] - 70} ${first[1] - 10} ${first[0]} ${first[1]}`;
        holes.forEach((hs, i) => {
          d += `L${hs[1][0]} ${hs[1][1]}`;
          if (i < holes.length - 1) {
            const nx = holes[i + 1][0];
            const sag = 70 + (i % 2) * 40;
            d += `C${hs[1][0] + 60} ${hs[1][1] + sag} ${nx[0] - 60} ${nx[1] + sag} ${nx[0]} ${nx[1]}`;
          }
        });
        const last = holes[holes.length - 1][1];
        d += `C${last[0] + 90} ${last[1] - 20} ${last[0] + 160} ${last[1] + 80} ${W + 60} ${last[1] + 160}`;
        path.setAttribute('d', d);
      };
      build();
      ScrollTrigger.addEventListener('refreshInit', build);
      gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: ul, start: 'top 85%', end: 'bottom 55%', scrub: .9 } });
    }

    /* Le lieu : la courtepointe s'assemble ----------------------------------------- */
    $$('.patch').forEach((p, i) => {
      const from = p.dataset.from;
      const fx = from === 'left' ? -140 : from === 'right' ? 140 : 0;
      const fy = from === 'bottom' ? 150 : 40;
      const rot = from === 'left' ? -9 : from === 'right' ? 9 : (i % 2 ? 5 : -5);
      gsap.from(p, { x: fx, y: fy, rotate: rot, opacity: 0, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 98%', end: 'top 58%', scrub: .9 } });
      gsap.set(p, { rotate: [-.7, .6, -.4, .8, -.5, .5][i % 6] });
      const img = $('img', p);
      if (img) gsap.fromTo(img, { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.from('.lieu__head p', { opacity: 0, y: 30, duration: 1.2, scrollTrigger: { trigger: '.lieu__head', start: 'top 80%', once: true } });

    /* Rendez-vous ------------------------------------------------------------------------ */
    {
      const title = $('.rdv__title');
      const parts = $$('[data-split="chars"]', title);
      const chars = [];
      parts.forEach((p) => { const sp = SplitText.create(p, { type: 'words,chars', mask: 'chars', maskClass: 'mask-line', aria: 'none' }); chars.push(...sp.chars); });
      title.setAttribute('aria-label', 'Prêt à vous évader ?');
      $$('span, em', title).forEach((s) => s.setAttribute('aria-hidden', 'true'));
      const rdvTl = gsap.timeline({ scrollTrigger: { trigger: '.rdv', start: 'top 62%', once: true }, defaults: { ease: 'expo.out' } });
      rdvTl.from(chars, { yPercent: 118, rotate: 6, duration: 1.4, stagger: .035 })
        .from('.rdv__title .script', { scale: .5, rotate: -8, opacity: 0, duration: 1.6, ease: 'back.out(1.8)' }, .35)
        .from('.rdv__lead, .prep', { opacity: 0, y: 30, duration: 1.2, stagger: .14 }, .6)
        .from('.bigbtn', { scale: .55, rotate: -40, opacity: 0, duration: 1.8 }, .2);

      const sec = $('.rdv'), inner = $('.rdv__inner', sec), svg = $('.thread--rdv', sec), path = $('path', svg);
      const build = () => {
        if (NARROW()) return;
        const W = sec.clientWidth, H = sec.clientHeight;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        const big = $('.bigbtn', sec), disc = $('.bigbtn__disc', sec), hole = $('.hole', disc);
        const a = posIn(big, sec), b = { x: disc.offsetLeft, y: disc.offsetTop };
        const hx = a.x + b.x + hole.offsetLeft + hole.offsetWidth / 2, hy = a.y + b.y + hole.offsetTop + hole.offsetHeight / 2;
        path.setAttribute('d', smoothPath([[W * .46, -30], [W * .56, H * .12], [W * .5, H * .22], [W * .68, H * .3], [hx - 30, hy - 70], [hx, hy]]));
      };
      build();
      ScrollTrigger.addEventListener('refreshInit', build);
      gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 15%', scrub: .9 } });
      gsap.to('.bigbtn__disc', { rotate: 14, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    /* Nous trouver ------------------------------------------------------------------------- */
    gsap.from('.card-info', { x: -70, opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: '.trouver__grid', start: 'top 82%', once: true } });
    gsap.from('.map', { clipPath: 'inset(0 0 0 100%)', duration: 1.8, ease: 'expo.inOut', scrollTrigger: { trigger: '.trouver__grid', start: 'top 80%', once: true } });
    gsap.from('.map iframe', { scale: 1.25, duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: '.trouver__grid', start: 'top 80%', once: true } });
    gsap.from('.hours li', { opacity: 0, x: -20, duration: .9, stagger: .07, scrollTrigger: { trigger: '.hours', start: 'top 88%', once: true } });

    /* Footer ------------------------------------------------------------------------------------- */
    gsap.from('.fw', { y: 90, opacity: 0, duration: 1.8, stagger: .18, ease: 'expo.out', scrollTrigger: { trigger: '.footer__word', start: 'top 92%', once: true } });
    gsap.from('.footer__top > *', { y: 30, opacity: 0, duration: 1.1, stagger: .12, scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true } });

    /* Rafraîchir quand tout est chargé ------------------------------------------------------------ */
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { buildHeroThread(); ScrollTrigger.refresh(); });
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildHeroThread(); }, 200); });
  }

  /* ------------------------------------------------------------------------
     Démarrage
     ------------------------------------------------------------------------ */
  function boot() {
    $('#year').textContent = new Date().getFullYear();
    if (REDUCE || !window.gsap || !window.ScrollTrigger || !window.Lenis) { staticMode(); return; }
    try {
      initStatusAndHours(); initPrep(); initMenu(); initAnchors(); initScrollChrome();
      buildFoliage(); buildFireflies(); initReviews(); fitRingText();
      stage();
    } catch (err) {
      console.error('[Cabinet des Fées] mise en scène désactivée :', err);
      document.documentElement.classList.add('is-static');
      loader && loader.remove();
    }
    // Garde-fou : le préchargeur ne doit jamais bloquer la page
    setTimeout(() => { if (!loaderGone && loader && loader.parentNode) { loader.remove(); lenis && lenis.start(); } }, 9000);
  }

  boot();
})();
