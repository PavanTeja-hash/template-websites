(function () {
  'use strict';

  // Studio WhatsApp number: country code + mobile, digits only. Replace before going live.
  var WHATSAPP_NUMBER = '919815045678';

  var doc = document;
  clearTimeout(window.pcFallback);

  var yr = doc.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  doc.querySelectorAll('.wa-link').forEach(function (a) {
    a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + WHATSAPP_NUMBER);
  });

  // Nav background on scroll
  var nav = doc.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 50); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  var ham = doc.getElementById('ham');
  var mob = doc.getElementById('mobM');
  function setMenu(open) {
    ham.classList.toggle('active', open);
    mob.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    ham.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    doc.body.style.overflow = open ? 'hidden' : '';
  }
  if (ham && mob) {
    ham.addEventListener('click', function () { setMenu(!mob.classList.contains('open')); });
    mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  // Reveal on scroll
  var rv = doc.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('v'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('v'); });
  }

  // Smooth scroll for in-page links (skips bare "#" and booking triggers)
  doc.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.classList.contains('bk-t')) return;
      var t = doc.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (id === '#main') t.focus({ preventScroll: true });
    });
  });
  var main = doc.getElementById('main');
  if (main) main.setAttribute('tabindex', '-1');

  // Booking drawer
  var ov = doc.getElementById('drOv');
  var dr = doc.getElementById('dr');
  var form = doc.getElementById('bkForm');
  var fType = doc.getElementById('f-type');
  var fNotes = doc.getElementById('f-notes');
  var fDate = doc.getElementById('f-date');
  var lastFocus = null;
  if (!dr || !form) return;

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function focusables() {
    return Array.prototype.filter.call(
      dr.querySelectorAll('button, input, select, textarea, a[href]'),
      function (el) { return !el.disabled; }
    );
  }

  function openDrawer(trigger) {
    lastFocus = trigger || doc.activeElement;
    if (trigger && trigger.dataset.type) fType.value = trigger.dataset.type;
    if (trigger && trigger.dataset.pkg && !fNotes.value) fNotes.value = 'Package: ' + trigger.dataset.pkg + '\n';
    fDate.min = today();
    dr.removeAttribute('inert');
    dr.setAttribute('aria-hidden', 'false');
    ov.classList.add('open');
    dr.classList.add('open');
    doc.body.style.overflow = 'hidden';
    setTimeout(function () { doc.getElementById('f-name').focus(); }, 50);
  }

  function closeDrawer() {
    ov.classList.remove('open');
    dr.classList.remove('open');
    dr.setAttribute('aria-hidden', 'true');
    dr.setAttribute('inert', '');
    doc.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  doc.querySelectorAll('.bk-t').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      if (mob && mob.classList.contains('open')) setMenu(false);
      openDrawer(b);
    });
  });
  doc.getElementById('drCls').addEventListener('click', closeDrawer);
  ov.addEventListener('click', closeDrawer);

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (dr.classList.contains('open')) closeDrawer();
      else if (mob && mob.classList.contains('open')) { setMenu(false); ham.focus(); }
      return;
    }
    if (e.key === 'Tab' && dr.classList.contains('open')) {
      var f = focusables();
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function setErr(id, msg) {
    var input = doc.getElementById('f-' + id);
    var out = doc.getElementById('e-' + id);
    out.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !msg;
  }

  function cleanPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
    return d;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = doc.getElementById('f-name').value.trim();
    var phone = cleanPhone(doc.getElementById('f-phone').value);
    var type = fType.value;
    var date = fDate.value;
    var city = doc.getElementById('f-city').value.trim();
    var notes = fNotes.value.trim();

    var ok = setErr('name', name.length < 2 ? 'Please enter your name.' : '');
    ok = setErr('phone', /^[6-9]\d{9}$/.test(phone) ? '' : 'Enter a 10-digit Indian mobile number.') && ok;
    ok = setErr('type', type ? '' : 'Please choose a shoot type.') && ok;
    if (!ok) {
      var bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }
    if (date && date < today()) date = '';

    var msg = 'Hi LENSCAPE, I\'d like to book a shoot.\n\nName: ' + name + '\nMobile: +91 ' + phone + '\nType: ' + type;
    if (date) msg += '\nDate: ' + date.split('-').reverse().join('/');
    if (city) msg += '\nCity: ' + city;
    if (notes) msg += '\nBrief: ' + notes;

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    form.reset();
    closeDrawer();
  });
})();
