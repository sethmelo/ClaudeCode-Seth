/* ═══════════════════════════════════════════════════════════
   VELES STRENGTH — interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ── Blueprint rack: generate the upright hole columns ──── */
  (function drawHoles() {
    const left = $('#holesL'), right = $('#holesR');
    if (!left || !right) return;
    const NS = 'http://www.w3.org/2000/svg';
    for (let y = 128; y <= 420; y += 16) {
      // holes read heavier through the bench/pull zone — the "Westside" band
      const inBand = y > 200 && y < 320;
      [[75, left], [345, right]].forEach(([x, g]) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x);
        c.setAttribute('cy', y);
        c.setAttribute('r', inBand ? 3.6 : 3);
        g.appendChild(c);
      });
    }
  })();

  /* ── Sticky nav ─────────────────────────────────────────── */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile menu ────────────────────────────────────────── */
  const burger = $('#burger');
  const menu   = $('#mobileMenu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ── Scroll reveals ─────────────────────────────────────── */
  const revealables = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const explicit = el.dataset.d;
        // Stagger siblings within the same container for a rolling reveal.
        const delay = explicit !== undefined
          ? Number(explicit) * 90
          : Math.min(indexAmongPeers(el) * 80, 480);
        setTimeout(() => el.classList.add('in'), delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(el => io.observe(el));
  }

  function indexAmongPeers(el) {
    if (!el.parentElement) return 0;
    return Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal')).indexOf(el);
  }

  /* ── Animated stat counters ─────────────────────────────── */
  const counters = $$('[data-count]');
  if (counters.length) {
    const run = (el) => {
      const target  = parseFloat(el.dataset.count);
      const dec     = Number(el.dataset.dec || 0);
      const suffix  = el.dataset.suffix || '';
      const dur     = 1500;
      if (reduced) { el.textContent = target.toFixed(dec) + suffix; return; }
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(c => cio.observe(c));
    } else {
      counters.forEach(run);
    }
  }

  /* ── Package tabs ───────────────────────────────────────── */
  const tabs   = $$('.tab');
  const panels = $$('.panel');
  const glider = $('#glider');

  const moveGlider = () => {
    const active = $('.tab.is-active');
    if (!active || !glider) return;
    glider.style.width = active.offsetWidth + 'px';
    glider.style.transform = `translateX(${active.offsetLeft - 5}px)`;
  };

  const selectTab = (i) => {
    tabs.forEach((t, n) => {
      const on = n === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      panels[n].classList.toggle('is-active', on);
      panels[n].hidden = !on;
    });
    moveGlider();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      selectTab(next);
    });
  });

  // Glider sizing depends on webfont metrics, so settle it after fonts load.
  moveGlider();
  window.addEventListener('resize', moveGlider);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveGlider);

  /* ── Testimonial carousel ───────────────────────────────── */
  const track = $('#qTrack');
  if (track) {
    const prev = $('#qPrev'), next = $('#qNext');
    let index = 0;

    const slideWidth = () => {
      const first = track.children[0];
      if (!first) return 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return first.getBoundingClientRect().width + gap;
    };

    const maxIndex = () => {
      const w = slideWidth();
      if (!w) return 0;
      const visible = Math.max(1, Math.floor(track.parentElement.clientWidth / w));
      return Math.max(0, track.children.length - visible);
    };

    const apply = () => {
      index = Math.min(index, maxIndex());
      track.style.transform = `translateX(${-index * slideWidth()}px)`;
      prev.disabled = index === 0;
      next.disabled = index >= maxIndex();
    };

    prev.addEventListener('click', () => { index = Math.max(0, index - 1); apply(); });
    next.addEventListener('click', () => { index = Math.min(maxIndex(), index + 1); apply(); });
    window.addEventListener('resize', apply);
    apply();

    // Touch swipe
    let x0 = null;
    track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) {
        index = dx < 0 ? Math.min(maxIndex(), index + 1) : Math.max(0, index - 1);
        apply();
      }
      x0 = null;
    }, { passive: true });
  }

  /* ── Budget chips ───────────────────────────────────────── */
  const chips = $$('.chip');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
  }));

  /* ── Demo form ──────────────────────────────────────────── */
  const form = $('#quoteForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const done = $('#formDone');
      const fine = $('.form__fine', form);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      done.hidden = false;
      if (fine) fine.hidden = true;
      form.querySelector('button[type="submit"]').textContent = 'Sent';
    });
  }

  /* ── Parallax drift on the hero blueprint ───────────────── */
  const art = $('.rack-svg');
  if (art && !reduced && window.matchMedia('(pointer:fine)').matches) {
    let raf = null, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 16;
      ty = (e.clientY / window.innerHeight - 0.5) * 16;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        art.style.translate = `${tx}px ${ty}px`;
        raf = null;
      });
    }, { passive: true });
  }
})();
