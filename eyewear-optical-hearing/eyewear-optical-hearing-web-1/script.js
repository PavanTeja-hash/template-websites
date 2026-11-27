/* === AURA OPTICS — script.js === */
(function () {
  'use strict';

  // Number that receives booking requests (country code + number, digits only)
  const WHATSAPP_NUMBER = '919849012345';

  /* Header shadow on scroll */
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    const setMenu = open => {
      nav.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* Footer year */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Frame filter buttons */
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.frame-card');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
    t.classList.add('active');
    t.setAttribute('aria-pressed', 'true');
    const cat = t.dataset.cat;
    cards.forEach(c => {
      const show = cat === 'all' || c.dataset.cat === cat;
      c.classList.toggle('hidden', !show);
      if (show) c.classList.add('visible');
    });
  }));

  /* Booking form -> WhatsApp */
  const form = document.getElementById('bookForm');
  if (form) {
    const errBox = document.getElementById('formError');
    const success = document.getElementById('formSuccess');
    const retry = document.getElementById('waRetry');
    const date = document.getElementById('bdate');
    const pad = n => String(n).padStart(2, '0');
    const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const today = new Date();
    date.min = iso(today);
    date.max = iso(new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()));

    const fields = {
      name: document.getElementById('bname'),
      phone: document.getElementById('bphone'),
      email: document.getElementById('bemail'),
      visit: document.getElementById('btype'),
      date: date,
      time: document.getElementById('btime')
    };
    Object.values(fields).forEach(el => el.addEventListener('input', () => el.removeAttribute('aria-invalid')));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = k => fields[k].value.trim();
      const phone = v('phone').replace(/[\s\-()]/g, '').replace(/^(\+?91)(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
      const errors = [];
      const bad = (k, msg) => { fields[k].setAttribute('aria-invalid', 'true'); errors.push([k, msg]); };

      if (v('name').length < 2) bad('name', 'Please enter your name.');
      if (!/^[6-9]\d{9}$/.test(phone)) bad('phone', 'Please enter a valid 10-digit mobile number.');
      if (v('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) bad('email', 'Please check your email address.');
      if (!v('visit')) bad('visit', 'Please choose a visit type.');
      if (!v('date') || v('date') < date.min || v('date') > date.max) bad('date', 'Please pick a date within the next 3 months.');
      if (!v('time')) bad('time', 'Please choose a preferred time.');

      if (errors.length) {
        errBox.textContent = errors.map(x => x[1]).join(' ');
        errBox.hidden = false;
        fields[errors[0][0]].focus();
        return;
      }
      errBox.hidden = true;

      const d = new Date(v('date') + 'T00:00:00');
      const niceDate = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      const lines = [
        'Hello Aura Optics, I would like to book an appointment.',
        'Name: ' + v('name'),
        'Phone: +91 ' + phone,
        v('email') ? 'Email: ' + v('email') : null,
        'Visit: ' + v('visit'),
        'Date: ' + niceDate,
        'Time: ' + v('time')
      ].filter(Boolean);
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      if (retry) retry.href = url;
      window.open(url, '_blank', 'noopener');
      form.classList.add('submitted');
      success.classList.add('show');
    });
  }

  /* Reveal on scroll (inline head script removes .js after 4s if this file never runs) */
  clearTimeout(window.pcFallback);
  const els = document.querySelectorAll('.fade-in');
  const showAll = () => els.forEach(el => el.classList.add('visible'));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
  const revealPassed = () => els.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
  });
  window.addEventListener('load', () => setTimeout(revealPassed, 800));
  window.addEventListener('hashchange', () => setTimeout(revealPassed, 800));
})();
