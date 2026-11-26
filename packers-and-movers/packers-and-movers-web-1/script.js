(() => {
  'use strict';

  // Business WhatsApp number in international format, digits only.
  const WHATSAPP_NUMBER = '919000012345';

  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Quote form -> WhatsApp
  const form = document.getElementById('quoteForm');
  if (form) {
    const err = document.getElementById('formError');
    const f = id => document.getElementById(id);
    f('date').min = new Date().toISOString().split('T')[0];
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = f('name').value.trim();
      const phone = f('phone').value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      const from = f('from').value.trim();
      const to = f('to').value.trim();
      const type = f('type').value;
      const problems = [];
      form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
      if (!name) { problems.push('your name'); f('name').classList.add('invalid'); }
      if (!/^[6-9]\d{9}$/.test(phone)) { problems.push('a valid 10-digit mobile number'); f('phone').classList.add('invalid'); }
      if (!from) { problems.push('where you are moving from'); f('from').classList.add('invalid'); }
      if (!to) { problems.push('where you are moving to'); f('to').classList.add('invalid'); }
      if (!type) { problems.push('a move type'); f('type').classList.add('invalid'); }
      if (problems.length) {
        err.textContent = 'Please enter ' + problems.join(', ') + '.';
        err.hidden = false;
        form.querySelector('.invalid').focus();
        return;
      }
      err.hidden = true;
      const lines = [
        'Hello SwiftShift, I would like a moving quote.',
        'Name: ' + name,
        'Mobile: ' + phone,
        'From: ' + from,
        'To: ' + to,
        'Move type: ' + type
      ];
      if (f('date').value) lines.push('Preferred date: ' + f('date').value);
      if (f('notes').value.trim()) lines.push('Notes: ' + f('notes').value.trim());
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

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
  const revealPassed = () => els.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
  });
  window.addEventListener('load', () => setTimeout(revealPassed, 800));
  window.addEventListener('hashchange', () => setTimeout(revealPassed, 800));
})();
