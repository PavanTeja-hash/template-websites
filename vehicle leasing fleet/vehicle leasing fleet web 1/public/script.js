/* === VELO FLEET — script.js === */
(function () {
  'use strict';

  // Number that receives fleet audit requests (country code + number, digits only)
  const WHATSAPP_NUMBER = '919849056789';

  const $ = id => document.getElementById(id);
  const inr = n => '₹' + n.toLocaleString('en-IN');

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
    links.querySelectorAll('a, button').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  }

  /* Footer year */
  const year = $('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Fleet explorer ---------- */
  const S = 'stroke="#0F172A" stroke-width="1.5"';
  const wheel = (cx, cy, r, h) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${S}/><circle cx="${cx}" cy="${cy}" r="${h}" fill="#2563EB"/>`;
  const svg = body => `<svg viewBox="0 0 200 80" fill="none" aria-hidden="true" focusable="false">${body}</svg>`;
  const fleetData = {
    sedan: [
      { name: 'VeloExec S-Class', type: 'Executive Sedan', rate: 32500, svg: svg(`<path d="M20 55h160M35 55l10-20h40l15-10h50l20 10v20H30z" ${S} fill="rgba(37,99,235,.06)"/>${wheel(55, 58, 8, 3)}${wheel(150, 58, 8, 3)}<path d="M80 35h35v8H80z" fill="rgba(37,99,235,.1)"/>`), badges: ['Chauffeur Ready', 'Full Insurance', 'GPS Tracked'] },
      { name: 'VeloComfort Plus', type: 'Executive Sedan', rate: 26800, svg: svg(`<path d="M25 55h150M40 55l8-18h35l12-8h55l18 8v18H35z" ${S} fill="rgba(37,99,235,.06)"/>${wheel(58, 58, 7, 2.5)}${wheel(148, 58, 7, 2.5)}`), badges: ['Maintenance Incl.', 'Insurance Incl.', 'Roadside 24/7'] },
      { name: 'VeloCity Compact', type: 'Executive Sedan', rate: 19500, svg: svg(`<path d="M30 55h140M42 55l7-15h30l10-8h48l16 8v15H38z" ${S} fill="rgba(37,99,235,.06)"/>${wheel(56, 58, 6.5, 2)}${wheel(145, 58, 6.5, 2)}`), badges: ['Maintenance Incl.', 'Insurance Incl.'] }
    ],
    van: [
      { name: 'VeloCargo Max', type: 'Commercial Van', rate: 22800, svg: svg(`<rect x="30" y="22" width="130" height="36" rx="4" ${S} fill="rgba(37,99,235,.06)"/><rect x="130" y="28" width="25" height="20" rx="2" ${S} fill="rgba(37,99,235,.1)"/>${wheel(60, 60, 8, 3)}${wheel(140, 60, 8, 3)}`), badges: ['1.5T Payload', 'GPS Tracked', 'Roadside 24/7'] },
      { name: 'VeloVan Standard', type: 'Commercial Van', rate: 18200, svg: svg(`<rect x="35" y="25" width="120" height="33" rx="3" ${S} fill="rgba(37,99,235,.06)"/><rect x="125" y="30" width="22" height="18" rx="2" ${S} fill="rgba(37,99,235,.1)"/>${wheel(60, 60, 7, 2.5)}${wheel(135, 60, 7, 2.5)}`), badges: ['Maintenance Incl.', 'Insurance Incl.'] },
      { name: 'VeloPanel Refrigerated', type: 'Commercial Van', rate: 28500, svg: svg(`<rect x="28" y="20" width="135" height="38" rx="4" ${S} fill="rgba(37,99,235,.06)"/><path d="M42 28v22M56 28v22M70 28v22" stroke="#2563EB" stroke-width=".8" opacity=".3"/><rect x="128" y="26" width="28" height="22" rx="2" ${S} fill="rgba(37,99,235,.1)"/>${wheel(58, 60, 8, 3)}${wheel(142, 60, 8, 3)}`), badges: ['Cold Chain', 'GPS Tracked', 'Insurance Incl.'] }
    ],
    ev: [
      { name: 'VeloSpark E-Sedan', type: 'Electric Vehicle', rate: 34200, svg: svg(`<path d="M30 55l8-18h35l12-10h55l18 10v18H28z" ${S} fill="rgba(37,99,235,.08)"/>${wheel(55, 58, 7, 2.5)}${wheel(148, 58, 7, 2.5)}<path d="M95 30l-6 12h8l-6 12" stroke="#2563EB" stroke-width="2"/>`), badges: ['Zero Emission', 'Charging Incl.', '400 km Range'] },
      { name: 'VeloVolt E-Van', type: 'Electric Vehicle', rate: 28900, svg: svg(`<rect x="30" y="22" width="130" height="36" rx="4" ${S} fill="rgba(37,99,235,.08)"/><path d="M75 30l-5 10h7l-5 10" stroke="#2563EB" stroke-width="2"/>${wheel(60, 60, 8, 3)}${wheel(140, 60, 8, 3)}`), badges: ['Zero Emission', '250 km Range', 'Maintenance Incl.'] },
      { name: 'VeloGreen E-Compact', type: 'Electric Vehicle', rate: 21500, svg: svg(`<path d="M35 55l6-14h28l10-8h45l15 8v14H32z" ${S} fill="rgba(37,99,235,.08)"/><path d="M88 32l-4 8h6l-4 8" stroke="#2563EB" stroke-width="1.5"/>${wheel(52, 58, 6, 2)}${wheel(140, 58, 6, 2)}`), badges: ['Zero Emission', 'City Range 180 km'] }
    ],
    heavy: [
      { name: 'VeloHaul 16T Truck', type: 'Heavy Duty', rate: 45800, svg: svg(`<rect x="10" y="18" width="100" height="40" rx="3" ${S} fill="rgba(37,99,235,.06)"/><rect x="110" y="28" width="45" height="30" rx="3" ${S} fill="rgba(37,99,235,.1)"/>${wheel(40, 62, 8, 3)}${wheel(75, 62, 8, 3)}${wheel(140, 62, 8, 3)}`), badges: ['16T GVW', 'GPS + Geofence', 'Roadside 24/7'] },
      { name: 'VeloFreight 25T', type: 'Heavy Duty', rate: 62500, svg: svg(`<rect x="8" y="15" width="110" height="43" rx="3" ${S} fill="rgba(37,99,235,.06)"/><rect x="118" y="24" width="50" height="34" rx="3" ${S} fill="rgba(37,99,235,.1)"/>${wheel(35, 62, 8, 3)}${wheel(65, 62, 8, 3)}${wheel(95, 62, 8, 3)}${wheel(148, 62, 8, 3)}`), badges: ['25T GVW', 'Full Insurance', 'Telematics'] },
      { name: 'VeloBus 32-Seater', type: 'Heavy Duty', rate: 55000, svg: svg(`<rect x="12" y="18" width="176" height="38" rx="6" ${S} fill="rgba(37,99,235,.06)"/>${[20, 35, 50, 65, 80].map(x => `<rect x="${x}" y="24" width="10" height="10" rx="1" stroke="#0F172A" stroke-width="1"/>`).join('')}<rect x="150" y="24" width="30" height="22" rx="2" ${S} fill="rgba(37,99,235,.1)"/>${wheel(40, 60, 7, 2.5)}${wheel(160, 60, 7, 2.5)}`), badges: ['Staff Transport', 'GPS Tracked', 'Driver Provided'] }
    ]
  };
  const tick = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M2 6l3 3 5-5"/></svg>';
  const selected = [];
  const grid = $('fleetGrid');
  const tabs = $('fleetTabs');

  function renderFleet(cat) {
    tabs.querySelectorAll('.fleet-tab').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.cat === cat)));
    tabs.querySelectorAll('.fleet-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
    grid.innerHTML = fleetData[cat].map(v => {
      const on = selected.includes(v.name);
      return `<article class="fleet-card">
  <div class="fleet-card-visual">${v.svg}</div>
  <div class="fleet-card-body">
    <div class="fleet-card-type">${v.type}</div>
    <h3 class="fleet-card-name">${v.name}</h3>
    <div class="fleet-card-price"><strong>${inr(v.rate)}</strong> /vehicle/month*</div>
    <div class="fleet-badges">${v.badges.map(b => `<span class="fleet-badge">${tick}${b}</span>`).join('')}</div>
    <button type="button" class="fleet-add${on ? ' added' : ''}" data-name="${v.name}" aria-pressed="${on}">${on ? 'Added to Quote' : 'Add to Quote'}</button>
  </div>
</article>`;
    }).join('');
  }
  if (grid && tabs) {
    tabs.addEventListener('click', e => { const t = e.target.closest('.fleet-tab'); if (t) renderFleet(t.dataset.cat); });
    grid.addEventListener('click', e => {
      const btn = e.target.closest('.fleet-add');
      if (!btn) return;
      const name = btn.dataset.name;
      const i = selected.indexOf(name);
      if (i > -1) selected.splice(i, 1); else selected.push(name);
      const on = i === -1;
      btn.classList.toggle('added', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Added to Quote' : 'Add to Quote';
    });
    renderFleet('sedan');
  }

  /* ---------- Lease calculator ---------- */
  const sFleet = $('sliderFleet');
  const sTerm = $('sliderTerm');
  const fmtL = v => v >= 10000000 ? (v / 10000000).toFixed(2) + ' Cr' : v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v.toLocaleString('en-IN');
  const setVal = (id, text) => { $(id).innerHTML = '<span class="currency">₹</span>' + text; };
  let currentRate = 0;

  function updateCalc() {
    const fleet = parseInt(sFleet.value, 10);
    const term = parseInt(sTerm.value, 10);
    $('valFleet').textContent = fleet;
    $('valTerm').textContent = term + ' mo';
    sFleet.setAttribute('aria-valuetext', fleet + ' vehicles');
    sTerm.setAttribute('aria-valuetext', term + ' months');
    sFleet.style.setProperty('--fill', ((fleet - 5) / (200 - 5) * 100) + '%');
    sTerm.style.setProperty('--fill', ((term - 12) / (60 - 12) * 100) + '%');
    let baseRate = 28500;
    if (fleet >= 50) baseRate = 26200;
    if (fleet >= 100) baseRate = 24000;
    if (fleet >= 150) baseRate = 22500;
    if (term >= 48) baseRate = Math.round(baseRate * 0.92);
    else if (term >= 36) baseRate = Math.round(baseRate * 0.96);
    currentRate = baseRate;
    const totalMonthly = baseRate * fleet;
    const totalBuying = 850000 * fleet;
    const totalLease = totalMonthly * term;
    const taxBenefit = Math.round(totalLease * 0.3 * 0.25);
    setVal('calcRate', baseRate.toLocaleString('en-IN'));
    setVal('calcTotal', totalMonthly.toLocaleString('en-IN'));
    setVal('calcSavings', fmtL(totalBuying));
    setVal('calcTax', fmtL(taxBenefit));
  }
  if (sFleet && sTerm) {
    sFleet.addEventListener('input', updateCalc);
    sTerm.addEventListener('input', updateCalc);
    updateCalc();
    const quick = $('quickFleetSize');
    if (quick) quick.addEventListener('change', () => {
      if (!quick.value) return;
      sFleet.value = quick.value;
      updateCalc();
      $('calculator').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Fleet audit drawer ---------- */
  const drawer = $('drawer');
  const overlay = $('drawerOverlay');
  let lastFocus = null;
  const focusables = () => Array.from(drawer.querySelectorAll('a[href], button, input, select, textarea')).filter(el => !el.disabled && el.offsetParent !== null);

  function openDrawer(withQuote) {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    overlay.hidden = false;
    // force layout so the slide-in transition runs
    void drawer.offsetWidth;
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('drawer-open');
    const sd = $('drawerSummary');
    if (withQuote && sFleet) {
      const rows = [['Fleet size', sFleet.value + ' vehicles'], ['Contract term', sTerm.value + ' months'], ['Est. monthly rate', inr(currentRate) + ' /vehicle']];
      if (selected.length) rows.push(['Selected vehicles', selected.join(', ')]);
      const box = $('drawerSummaryContent');
      box.textContent = '';
      rows.forEach(([k, v]) => {
        const row = document.createElement('div'); row.className = 'drawer-summary-row';
        const a = document.createElement('span'); a.textContent = k;
        const b = document.createElement('strong'); b.textContent = v;
        row.append(a, b); box.append(row);
      });
      sd.hidden = false;
    } else if (selected.length) {
      $('drawerSummaryContent').textContent = '';
      const row = document.createElement('div'); row.className = 'drawer-summary-row';
      const a = document.createElement('span'); a.textContent = 'Selected vehicles';
      const b = document.createElement('strong'); b.textContent = selected.join(', ');
      row.append(a, b); $('drawerSummaryContent').append(row);
      sd.hidden = false;
    } else {
      sd.hidden = true;
    }
    drawer.dataset.quote = withQuote ? '1' : '';
    setTimeout(() => { const f = drawer.querySelector('input'); (f && f.offsetParent ? f : $('drawerClose')).focus(); }, 60);
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
      openDrawer(b.dataset.openDrawer === 'quote');
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

  /* Audit form: validate, then open WhatsApp with a pre-filled message */
  const form = $('auditForm');
  if (form) {
    const err = $('formError');
    form.addEventListener('submit', e => {
      e.preventDefault();
      err.textContent = '';
      const v = n => (form.elements[n].value || '').trim();
      const fail = (msg, field) => { err.textContent = msg; form.elements[field].focus(); };
      const phone = v('phone').replace(/[\s-]/g, '').replace(/^(\+91|0091|91(?=\d{10}$)|0)/, '');
      if (v('name').length < 2) return fail('Please enter your full name.', 'name');
      if (v('company').length < 2) return fail('Please enter your company name.', 'company');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) return fail('Please enter a valid work email.', 'email');
      if (!/^[6-9]\d{9}$/.test(phone)) return fail('Please enter a valid 10-digit Indian mobile number.', 'phone');
      if (!v('size')) return fail('Please choose your approximate fleet size.', 'size');
      if (!v('need')) return fail('Please choose your primary need.', 'need');

      const lines = [
        'Hello VELO FLEET, I would like a fleet audit.',
        '',
        'Name: ' + v('name'),
        'Company: ' + v('company'),
        'Email: ' + v('email'),
        'Phone: +91 ' + phone,
        'Fleet size: ' + v('size'),
        'Primary need: ' + v('need')
      ];
      if (drawer.dataset.quote && sFleet) lines.push('Calculator: ' + sFleet.value + ' vehicles, ' + sTerm.value + ' months, est. ' + inr(currentRate) + '/vehicle/month');
      if (selected.length) lines.push('Vehicles of interest: ' + selected.join(', '));
      if (v('details')) lines.push('Details: ' + v('details').slice(0, 600));
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      const win = window.open(url, '_blank', 'noopener');
      $('waLink').href = url;
      $('drawerForm').hidden = true;
      $('drawerSuccess').hidden = false;
      if (!win) $('waLink').textContent = 'Tap here to open WhatsApp';
      $('drawerSuccessTitle').focus();
    });
  }

  /* Reveal on scroll (inline head script removes .js after 4s if this file never runs) */
  clearTimeout(window.pcFallback);
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    // Safety net: never leave content hidden if the observer doesn't fire
    setTimeout(() => els.forEach(el => el.classList.add('visible')), 4000);
  }
})();
