/* === SPARKHAUS — script.js === */
(function () {
  'use strict';

  // Number that receives booking requests (country code + number, digits only)
  const WHATSAPP_NUMBER = '919849052617';

  const $ = id => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav shadow on scroll */
  const nav = $('nav');
  if (nav && !nav.classList.contains('solid')) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  const burger = $('hamburger');
  const menu = $('mobileMenu');
  if (burger && menu) {
    const setMenu = open => {
      menu.classList.toggle('open', open);
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1024) setMenu(false); });
  }

  /* Footer year */
  const year = $('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Checklist tabs (arrow keys move between tabs) */
  const tabs = Array.from(document.querySelectorAll('.checklist-tab'));
  const selectTab = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); selectTab(tabs[n], true); }
    });
  });

  /* ---------- Booking drawer ---------- */
  const drawer = $('drawer');
  const overlay = $('drawerOverlay');
  const form = $('bookForm');
  let lastFocus = null;

  if (drawer && overlay) {
    const focusables = () => Array.from(drawer.querySelectorAll('a[href], button, input, select, textarea'))
      .filter(el => !el.disabled && el.offsetParent !== null);

    const openDrawer = size => {
      lastFocus = document.activeElement;
      if (form) {
        form.hidden = false;
        $('bookDone').hidden = true;
        if (size) form.elements.size.value = size;
      }
      drawer.hidden = false;
      overlay.hidden = false;
      void drawer.offsetWidth; // force layout so the slide-in transition runs
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.classList.add('drawer-open');
      setTimeout(() => { const f = drawer.querySelector('select'); (f && f.offsetParent ? f : $('drawerClose')).focus(); }, 60);
    };
    const closeDrawer = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.classList.remove('drawer-open');
      setTimeout(() => { if (!drawer.classList.contains('open')) { drawer.hidden = true; overlay.hidden = true; } }, 400);
      if (lastFocus) lastFocus.focus();
    };

    document.querySelectorAll('[data-open-drawer]').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      openDrawer(b.dataset.size);
    }));
    $('drawerClose').addEventListener('click', closeDrawer);
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

  /* Booking form: validate, then open WhatsApp with a pre-filled message */
  if (form) {
    const err = $('formError');
    const dateInput = form.elements.date;
    const pad = n => String(n).padStart(2, '0');
    const t = new Date();
    dateInput.min = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());

    form.addEventListener('submit', e => {
      e.preventDefault();
      err.textContent = '';
      const v = n => (form.elements[n].value || '').trim();
      const fail = (msg, field) => { err.textContent = msg; form.elements[field].focus(); };
      const phone = v('phone').replace(/[\s-]/g, '').replace(/^(\+91|0091|91(?=\d{10}$)|0)/, '');
      if (!v('service')) return fail('Please choose a service.', 'service');
      if (!v('size')) return fail('Please choose your home size.', 'size');
      if (v('name').length < 2) return fail('Please enter your full name.', 'name');
      if (!/^[6-9]\d{9}$/.test(phone)) return fail('Please enter a valid 10-digit Indian mobile number.', 'phone');
      if (v('area').length < 2) return fail('Please enter your area or locality.', 'area');
      if (!v('date') || v('date') < dateInput.min) return fail('Please choose today or a later date.', 'date');
      if (!v('slot')) return fail('Please choose a time slot.', 'slot');

      const lines = [
        'Hello SPARKHAUS, I would like to book a cleaning.',
        '',
        'Service: ' + v('service'),
        'Home size: ' + v('size'),
        'Name: ' + v('name'),
        'Phone: +91 ' + phone,
        'Area: ' + v('area'),
        'Date: ' + v('date'),
        'Time slot: ' + v('slot')
      ];
      if (v('notes')) lines.push('Notes: ' + v('notes').slice(0, 600));
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      const win = window.open(url, '_blank', 'noopener');
      const link = $('waLink');
      link.href = url;
      if (!win) link.textContent = 'Tap here to open WhatsApp';
      form.hidden = true;
      $('bookDone').hidden = false;
      $('doneTitle').focus();
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
