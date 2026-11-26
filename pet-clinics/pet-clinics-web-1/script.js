(() => {
  'use strict';

  // Clinic WhatsApp number in international format, digits only.
  const WHATSAPP_NUMBER = '919845012345';

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
  const serviceSel = document.getElementById('cf-service');
  const dateInput = document.getElementById('cf-date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  document.querySelectorAll('[data-service]').forEach(btn => btn.addEventListener('click', () => {
    serviceSel.value = btn.dataset.service;
  }));

  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = id => document.getElementById('cf-' + id);
    const name = f('name').value.trim();
    const phone = f('phone').value.replace(/\D/g, '');
    const service = f('service').value;
    const problems = [];
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    if (!name) { problems.push('your name'); f('name').classList.add('invalid'); }
    if (!/^[6-9]\d{9}$/.test(phone)) { problems.push('a valid 10-digit mobile number'); f('phone').classList.add('invalid'); }
    if (!service) { problems.push('a service'); f('service').classList.add('invalid'); }
    if (problems.length) {
      err.textContent = 'Please enter ' + problems.join(', ') + '.';
      err.hidden = false;
      form.querySelector('.invalid').focus();
      return;
    }
    err.hidden = true;
    const lines = [
      'Hello PawCare, I would like to book an appointment.',
      'Name: ' + name,
      'Mobile: ' + phone,
      'Service: ' + service
    ];
    if (f('pet').value.trim()) lines.push('Pet: ' + f('pet').value.trim());
    if (f('date').value) lines.push('Preferred date: ' + f('date').value);
    if (f('msg').value.trim()) lines.push('Notes: ' + f('msg').value.trim());
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  // Reveal on scroll (inline head script removes .js after 4s if this file never runs)
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
  // Safety net: anything already scrolled past (e.g. after a #link jump) is shown.
  const revealPassed = () => els.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
  });
  window.addEventListener('load', () => setTimeout(revealPassed, 800));
  window.addEventListener('hashchange', () => setTimeout(revealPassed, 800));
})();
