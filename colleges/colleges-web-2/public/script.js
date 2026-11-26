(() => {
  'use strict';

  /* Header scroll */
  const header = document.getElementById('header');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    lastY = window.scrollY;
  }, { passive: true });

  /* Mobile nav toggle */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  /* Scroll animations */
  const els = document.querySelectorAll('.fade-in, .wipe-in');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
  }

  /* Fallback: show all after 4 seconds */
  setTimeout(() => els.forEach(el => el.classList.add('visible')), 4000);
})();
