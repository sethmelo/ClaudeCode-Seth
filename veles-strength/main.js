/* ═══════════════════════════════════════════════════════════
   VELES STRENGTH — interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

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

  /* ── FAQ: exclusive accordion ───────────────────────────── */
  // The `name` attribute makes <details> groups exclusive natively;
  // set it here so markup stays valid for older parsers.
  const qas = $$('.qa');
  qas.forEach(d => d.setAttribute('name', 'faq'));
  // Fallback for engines without exclusive-details support.
  qas.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) qas.forEach(o => { if (o !== d && o.open) o.open = false; });
  }));

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
})();
