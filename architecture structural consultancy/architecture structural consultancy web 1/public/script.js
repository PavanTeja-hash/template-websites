/* === ARCVAULT — script.js === */
(function () {
  'use strict';

  // Number that receives consultation requests (country code + number, digits only)
  const WHATSAPP_NUMBER = '919848056789';

  const $ = id => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav background on scroll */
  const nav = $('nav');
  if (nav && !nav.classList.contains('solid')) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  const toggle = $('navToggle');
  const links = $('navLinks');
  if (toggle && links) {
    const setMenu = open => {
      links.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  }

  /* Footer year */
  const year = $('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Consultation drawer ---------- */
  const drawer = $('dDrawer');
  const overlay = $('dOverlay');
  let lastFocus = null;
  const focusables = () => Array.from(drawer.querySelectorAll('a[href], button, input, select, textarea')).filter(el => !el.disabled && el.offsetParent !== null);

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    overlay.hidden = false;
    void drawer.offsetWidth; // force layout so the slide-in transition runs
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('drawer-open');
    setTimeout(() => { const f = drawer.querySelector('input'); (f && f.offsetParent ? f : $('dClose')).focus(); }, 60);
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('drawer-open');
    setTimeout(() => { if (!drawer.classList.contains('open')) { drawer.hidden = true; overlay.hidden = true; } }, 400);
    if (lastFocus) lastFocus.focus();
  }
  if (drawer && overlay) {
    document.querySelectorAll('[data-open-drawer]').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      openDrawer();
    }));
    $('dClose').addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* Consultation form: validate, then open WhatsApp with a pre-filled message */
  const form = $('consultForm');
  if (form) {
    const err = $('formError');
    form.addEventListener('submit', e => {
      e.preventDefault();
      err.textContent = '';
      const v = n => (form.elements[n].value || '').trim();
      const fail = (msg, field) => { err.textContent = msg; form.elements[field].focus(); };
      const phone = v('phone').replace(/[\s-]/g, '').replace(/^(\+91|0091|91(?=\d{10}$)|0)/, '');
      if (v('name').length < 2) return fail('Please enter your full name.', 'name');
      if (!/^[6-9]\d{9}$/.test(phone)) return fail('Please enter a valid 10-digit Indian mobile number.', 'phone');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) return fail('Please enter a valid email address.', 'email');
      if (!v('type')) return fail('Please choose the project type.', 'type');
      if (!v('area')) return fail('Please choose the approximate built-up area.', 'area');
      if (v('location').length < 2) return fail('Please enter the site location.', 'location');

      const lines = [
        'Hello ARCVAULT, I would like a free consultation.',
        '',
        'Name: ' + v('name'),
        'Phone: +91 ' + phone,
        'Email: ' + v('email'),
        'Project type: ' + v('type'),
        'Built-up area: ' + v('area'),
        'Site location: ' + v('location')
      ];
      if (v('brief')) lines.push('Brief: ' + v('brief').slice(0, 600));
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      const win = window.open(url, '_blank', 'noopener');
      $('waLink').href = url;
      $('dForm').hidden = true;
      $('dDone').hidden = false;
      if (!win) $('waLink').textContent = 'Tap here to open WhatsApp';
      $('dDoneTitle').focus();
    });
  }

  /* Reveal on scroll (inline head script removes .js after 4s if this file never runs) */
  clearTimeout(window.pcFallback);
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach(el => el.classList.add('visible'));
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    setTimeout(() => els.forEach(el => el.classList.add('visible')), 4000);
  }
})();
