// Sri Chamundi Tours and Travels: interactions and reveal animations
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * GO-LIVE SETTINGS
   * FORM_ENDPOINT: URL that accepts a JSON POST (Formspree, Web3Forms,
   *   your own API). Leave empty to send enquiries on WhatsApp.
   * WHATSAPP_NUMBER: digits only with country code, e.g. 919845012345.
   * OFFICE_PHONE: shown in error messages.
   * ------------------------------------------------------------------ */
  var FORM_ENDPOINT = '';
  var WHATSAPP_NUMBER = '919845012345';
  var OFFICE_PHONE = '+91 80 4123 6650';

  clearTimeout(window.scFallback);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Heading line masks ---------- */
  document.querySelectorAll('.mask > span').forEach(function (s) {
    var i = document.createElement('i');
    while (s.firstChild) i.appendChild(s.firstChild);
    s.appendChild(i);
  });

  /* ---------- Reveal on scroll (plays once) ---------- */
  var targets = document.querySelectorAll('.mask, .fade, .wipe');
  var hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { (e.target._wipe || e.target).classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    // Wipe images are fully clipped at the start, which stops both the
    // observer and lazy loading from seeing them. Watch their wrapper instead.
    targets.forEach(function (el) {
      if (el.classList.contains('wipe') && el.parentElement) {
        el.parentElement._wipe = el;
        io.observe(el.parentElement);
      } else io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }
  requestAnimationFrame(function () {
    if (hero) {
      hero.classList.add('in');
      hero.querySelectorAll('.mask, .fade').forEach(function (el) { el.classList.add('in'); });
    }
  });

  /* ---------- Smooth, eased scroll for in-page links ---------- */
  var scrolling = null;
  var easeInOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var cancelGlide = function () { if (scrolling) { cancelAnimationFrame(scrolling); scrolling = null; } };
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, cancelGlide, { passive: true }); });

  function glideTo(target) {
    var offset = window.innerWidth < 960 ? 72 : 88;
    var start = window.scrollY;
    var end = target === 'top' ? 0 : target.getBoundingClientRect().top + start - offset;
    end = Math.max(0, Math.min(end, document.documentElement.scrollHeight - window.innerHeight));
    var dist = end - start;
    if (reduce || Math.abs(dist) < 2) { window.scrollTo(0, end); return; }
    var dur = Math.min(1100, Math.max(500, Math.abs(dist) * 0.35));
    var t0 = null;
    cancelGlide();
    var step = function (now) {
      if (t0 === null) t0 = now;
      var k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + dist * easeInOut(k));
      scrolling = k < 1 ? requestAnimationFrame(step) : null;
    };
    scrolling = requestAnimationFrame(step);
  }

  /* ---------- Header: solid after scroll, hides on scroll down ---------- */
  var hdr = document.querySelector('.hdr');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('solid', y > 40);
    if (!hdr.classList.contains('open')) {
      hdr.classList.toggle('hide', y > 400 && y > lastY && !scrolling);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });

  /* ---------- Enquiry form helpers ---------- */
  var form = document.getElementById('enq');
  var chips = Array.prototype.slice.call(document.querySelectorAll('#chips button'));
  function pickChip(name) {
    chips.forEach(function (c) {
      if (c.textContent.trim() === name) c.setAttribute('aria-pressed', 'true');
    });
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      clearErr(c.closest('.fld'));
    });
  });

  /* In-page links: glide, close menu, preselect destination */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id === 'top' ? 'top' : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    if (a.dataset.pick) pickChip(a.dataset.pick);
    glideTo(target);
    history.replaceState(null, '', id === 'top' ? location.pathname : '#' + id);
  });

  /* ---------- Package filters ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
  var cards = document.querySelectorAll('.pk');
  function filterTo(tab) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
    var f = tab.dataset.f;
    cards.forEach(function (c) {
      c.hidden = !(f === 'all' || c.dataset.c === f);
      if (!c.hidden) { var im = c.querySelector('.wipe'); if (im) im.classList.add('in'); }
    });
  }
  tabs.forEach(function (t, i) {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', function () { filterTo(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); filterTo(n);
    });
  });

  /* ---------- Quick planner under the hero ---------- */
  var planner = document.getElementById('planner');
  if (planner) planner.addEventListener('submit', function (e) {
    e.preventDefault();
    var dest = planner.dest.value;
    if (dest !== 'Not sure yet') pickChip(dest); else pickChip('Not sure yet');
    var note = document.getElementById('f-note');
    var line = 'Travel month: ' + planner.month.value + '. Travellers: ' + planner.pax.value + '.';
    if (note.value.indexOf('Travel month:') === -1) note.value = line + (note.value ? '\n' + note.value : '');
    glideTo(document.getElementById('contact'));
    setTimeout(function () { document.getElementById('f-name').focus({ preventScroll: true }); }, 900);
  });

  /* ---------- Validation and submit ---------- */
  function setErr(fld, msg) { fld.classList.add('bad'); fld.querySelector('.err').textContent = msg; }
  function clearErr(fld) { if (!fld) return; fld.classList.remove('bad'); var e = fld.querySelector('.err'); if (e) e.textContent = ''; }
  if (!form) return;
  ['f-name', 'f-phone'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () { clearErr(this.closest('.fld')); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.website.value) return; // honeypot
    var name = form.name.value.trim();
    var phone = form.phone.value.replace(/[^\d]/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    var picked = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).map(function (c) { return c.textContent.trim(); });
    var ok = true;
    if (name.length < 2) { setErr(form.name.closest('.fld'), 'Please enter your name.'); ok = false; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setErr(form.phone.closest('.fld'), 'Please enter a 10 digit mobile number.'); ok = false; }
    if (!picked.length) { setErr(document.getElementById('chips').closest('.fld'), 'Please pick at least one place, or "Not sure yet".'); ok = false; }
    if (!ok) { var first = form.querySelector('.bad input, .bad button'); if (first) first.focus(); return; }

    var data = {
      name: name, phone: phone, destinations: picked.join(', '),
      start: form.date.value || 'Flexible', adults: form.adults.value, children: form.kids.value,
      hotel: form.hotel.value, note: form.note.value.trim()
    };
    var done = form.querySelector('.ok');

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); done.textContent = 'Thank you. We will call you within a few working hours.'; done.hidden = false; form.reset(); })
        .catch(function () { done.textContent = 'That did not go through. Please call us on ' + OFFICE_PHONE + '.'; done.hidden = false; });
      return;
    }
    var msg = 'Hello Sri Chamundi Tours and Travels, I would like a trip plan.\n' +
      'Name: ' + data.name + '\nMobile: ' + data.phone + '\nPlaces: ' + data.destinations +
      '\nStart date: ' + data.start + '\nAdults: ' + data.adults + ', Children: ' + data.children +
      '\nHotels: ' + data.hotel + (data.note ? '\nNotes: ' + data.note : '');
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    done.hidden = false;
  });
})();
