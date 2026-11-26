(() => {
  'use strict';

  // Clinic WhatsApp number in international format, digits only.
  const WHATSAPP_NUMBER = '919876543210';

  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Booking form -> WhatsApp
  const form = document.getElementById('bookingForm');
  const err = document.getElementById('formError');
  const serviceSel = document.getElementById('cf-pkg');
  const today = new Date().toISOString().split('T')[0];
  ['cf-checkin', 'cf-checkout'].forEach(id => { const d = document.getElementById(id); if (d) d.min = today; });

  document.querySelectorAll('[data-service]').forEach(btn => btn.addEventListener('click', () => {
    serviceSel.value = btn.dataset.service;
  }));

  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = id => document.getElementById('cf-' + id);
    const name = f('name').value.trim();
    const phone = f('phone').value.replace(/\D/g, '');
    const service = f('pkg').value;
    const problems = [];
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    if (!name) { problems.push('your name'); f('name').classList.add('invalid'); }
    if (!/^[6-9]\d{9}$/.test(phone)) { problems.push('a valid 10-digit mobile number'); f('phone').classList.add('invalid'); }
    if (f('checkin').value && f('checkout').value && f('checkout').value < f('checkin').value) { problems.push('a check-out date after check-in'); f('checkout').classList.add('invalid'); }
    if (!service) { problems.push('a package'); f('pkg').classList.add('invalid'); }
    if (problems.length) {
      err.textContent = 'Please enter ' + problems.join(', ') + '.';
      err.hidden = false;
      form.querySelector('.invalid').focus();
      return;
    }
    err.hidden = true;
    const lines = [
      'Hello Snuggle Stay, I would like to book a stay.',
      'Name: ' + name,
      'Mobile: ' + phone,
      'Package: ' + service
    ];
    if (f('pet').value.trim()) lines.push('Pet: ' + f('pet').value.trim());
    if (f('checkin').value) lines.push('Check-in: ' + f('checkin').value);
    if (f('checkout').value) lines.push('Check-out: ' + f('checkout').value);
    if (f('msg').value.trim()) lines.push('Special instructions: ' + f('msg').value.trim());
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  // Reveal on scroll (inline head script removes .js after 4s if this file never runs)
  clearTimeout(window.pcFallback);
  const els = document.querySelectorAll('.fade-in, .wipe-in');
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
  // Safety net: anything already scrolled past (e.g. after a #link jump) is shown.
  const revealPassed = () => els.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
  });
  window.addEventListener('load', () => setTimeout(revealPassed, 800));
  window.addEventListener('hashchange', () => setTimeout(revealPassed, 800));
})();
