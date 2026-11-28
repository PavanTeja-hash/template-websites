(function () {
  'use strict';

  /* Placeholder: the events team's WhatsApp number (country code + number, no + or spaces). See README. */
  var WHATSAPP_NUMBER = '919850412367';
  var BUSINESS = 'GRANDVIEW';
  var MAX_DAYS_AHEAD = 730; /* enquiries accepted up to about two years ahead */

  clearTimeout(window.pcFallback);
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* YEAR */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* NAV SCROLL */
  var nav = document.getElementById('nav');
  if (nav && !nav.classList.contains('solid')) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 60); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* FOCUS helpers */
  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; }
    );
  }
  function trapTab(e, root) {
    if (e.key !== 'Tab') return;
    var f = focusables(root);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* MOBILE MENU */
  var ham = document.getElementById('hamburger');
  var mob = document.getElementById('mobileMenu');
  function setMenu(open, restoreFocus) {
    if (!ham || !mob) return;
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    ham.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mob.classList.toggle('open', open);
    if (nav) nav.classList.toggle('solid', open || nav.dataset.solid === '1');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var f = focusables(mob); if (f[0]) f[0].focus(); }
    else if (restoreFocus) ham.focus();
  }
  if (ham && mob) {
    if (nav && nav.classList.contains('solid')) nav.dataset.solid = '1';
    ham.addEventListener('click', function () { setMenu(ham.getAttribute('aria-expanded') !== 'true', true); });
    mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    document.addEventListener('keydown', function (e) {
      if (!mob.classList.contains('open')) return;
      if (e.key === 'Escape') setMenu(false, true);
      else if (e.key === 'Tab') {
        var f = [ham].concat(focusables(mob));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 860 && mob.classList.contains('open')) setMenu(false, false); });
  }

  /* REVEAL */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* BOOKING DRAWER */
  var overlay = document.getElementById('drawerOverlay');
  var drawer = document.getElementById('drawer');
  var form = document.getElementById('bookingForm');
  var lastTrigger = null;

  function preselect(id, value) {
    var sel = form && form.querySelector('#' + id);
    if (!sel || !value) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === value) { sel.selectedIndex = i; return; }
    }
  }
  function openDrawer(trigger) {
    if (!drawer) return;
    lastTrigger = trigger || document.activeElement;
    if (trigger) {
      preselect('bk-event', trigger.getAttribute('data-event'));
      preselect('bk-hall', trigger.getAttribute('data-hall'));
    }
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var n = document.getElementById('bk-name'); if (n) n.focus(); }, 60);
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('open')) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }

  if (drawer) {
    document.querySelectorAll('.book-trigger').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        if (mob && mob.classList.contains('open')) setMenu(false, false);
        openDrawer(b);
      });
    });
    document.getElementById('drawerClose').addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
      else trapTab(e, drawer);
    });
  }

  /* BOOKING FORM -> WhatsApp */
  if (form) {
    var dateInput = form.querySelector('#bk-date');
    function isoLocal(d) {
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    }
    var today = new Date();
    dateInput.min = isoLocal(today);
    var maxD = new Date(today.getTime()); maxD.setDate(maxD.getDate() + MAX_DAYS_AHEAD);
    dateInput.max = isoLocal(maxD);

    function setError(id, msg) {
      var input = form.querySelector('#' + id);
      var err = form.querySelector('#' + id + '-err');
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      if (err) err.textContent = msg || '';
      return !msg;
    }
    function val(id) { return form.querySelector('#' + id).value.trim(); }
    function normalisePhone(p) {
      var d = p.replace(/[^\d]/g, '');
      if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
      if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
      return d;
    }

    form.querySelectorAll('input,select,textarea').forEach(function (el) {
      var clear = function () { if (el.getAttribute('aria-invalid')) setError(el.id, ''); };
      el.addEventListener('input', clear);
      el.addEventListener('change', clear);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');
      status.textContent = '';

      var name = val('bk-name'), phone = normalisePhone(val('bk-phone')), org = val('bk-org');
      var ev = val('bk-event'), guests = val('bk-guests'), hall = val('bk-hall');
      var date = val('bk-date'), days = val('bk-days'), notes = val('bk-notes');
      var ok = true;

      ok = setError('bk-name', name.length < 2 ? 'Please enter your name.' : '') && ok;
      ok = setError('bk-phone', /^[6-9]\d{9}$/.test(phone) ? '' : 'Please enter a 10-digit Indian mobile number.') && ok;
      ok = setError('bk-event', ev ? '' : 'Please choose the type of event.') && ok;
      ok = setError('bk-guests', guests ? '' : 'Please choose the expected number of guests.') && ok;

      var dateMsg = '';
      if (!date) dateMsg = 'Please choose a preferred date.';
      else if (date < dateInput.min) dateMsg = 'Please choose today or a later date.';
      else if (date > dateInput.max) dateMsg = 'Please choose a date within the next two years.';
      ok = setError('bk-date', dateMsg) && ok;

      if (!ok) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      var pretty = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      var msg = 'Hi ' + BUSINESS + ', I would like to check availability.\n\n' +
        'Name: ' + name + '\n' +
        'Mobile: +91 ' + phone + '\n';
      if (org) msg += 'Organisation: ' + org + '\n';
      msg += 'Event: ' + ev + '\n' +
        'Guests: ' + guests + '\n' +
        'Hall: ' + (hall || 'No preference') + '\n' +
        'Date: ' + pretty + ' (' + days + ')';
      if (notes) msg += '\nNotes: ' + notes;

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
      /* With 'noopener', window.open returns null even on success, so the link below is always shown as a fallback. */
      window.open(url, '_blank', 'noopener');
      status.innerHTML = '';
      var line = document.createElement('span');
      line.textContent = 'WhatsApp should now be open with your enquiry. Press send and our events team will reply with available halls. Nothing opened? ';
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open WhatsApp';
      status.appendChild(line); status.appendChild(a);
    });
  }

  /* SMOOTH SCROLL for in-page links (respects reduced motion) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.classList.contains('skip-link')) return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });
})();
