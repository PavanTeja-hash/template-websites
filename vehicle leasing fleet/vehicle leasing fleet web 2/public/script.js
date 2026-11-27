/* === DRIVELINK — script.js === */
(function () {
  'use strict';

  // Number that receives assessment requests (country code + number, digits only)
  const WHATSAPP_NUMBER = '919845067123';
  // Average purchase price per vehicle used for "Upfront capital freed" in the calculator
  const AVG_PURCHASE_PRICE = 1000000;

  const $ = id => document.getElementById(id);
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  }

  /* Footer year */
  const year = $('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Vehicle catalogue ---------- */
  const N = 'stroke="#1B2D45" stroke-width="1.6" stroke-linejoin="round"';
  const F = 'fill="rgba(232,93,42,.08)"';
  const G = 'fill="rgba(27,45,69,.12)"';
  const wheel = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" ${N}/><circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="#E85D2A"/>`;
  const bolt = (x, y) => `<path d="M${x} ${y}l-6 11h7l-6 11" stroke="#E85D2A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const svg = body => `<svg viewBox="0 0 200 90" fill="none" aria-hidden="true" focusable="false"><path d="M10 74h180" stroke="rgba(27,45,69,.15)" stroke-width="2"/>${body}</svg>`;
  const sedan = (len, extra) => svg(`<path d="M${100 - len} 66v-12l14-4 18-14h${len - 14}l22 14 ${len / 4} 4v12z" ${N} ${F}/><path d="M${100 - len + 34} 50l14-11h${len / 2 - 6}v11z" ${G}/><path d="M${100 + len / 2 + 8} 50l-10-11h-${len / 2 - 22}v11z" ${G}/>${wheel(100 - len + 26, 68, 9)}${wheel(100 + len - 18, 68, 9)}${extra || ''}`);
  const suv = (len, h, extra) => svg(`<path d="M${100 - len} 66v-${h - 14}l10-4 12-${h - 22}h${len + 18}l20 ${h - 22} ${len / 5} 6v${h - 24}z" ${N} ${F}/><path d="M${100 - len + 26} ${78 - h}h${len - 14}v14h-${len - 14}z" ${G}/><path d="M${100 + 18} ${78 - h}h${len - 30}l10 14h-${len - 20}z" ${G}/>${wheel(100 - len + 26, 68, 10)}${wheel(100 + len - 16, 68, 10)}${extra || ''}`);
  const van = (len, extra) => svg(`<path d="M${100 - len} 66V22h${len + 34}l16 20 ${len / 6} 6v18z" ${N} ${F}/><path d="M${100 + 40} 27h12l12 15h-24z" ${G}/>${wheel(100 - len + 28, 68, 10)}${wheel(100 + len - 6, 68, 10)}${extra || ''}`);
  const fleetData = {
    sedan: [
      { name: 'DriveExec Premier', cat: 'Executive Sedan', rate: 30200, art: sedan(80), tags: ['Chauffeur Ready', 'Full Insurance', 'GPS'] },
      { name: 'DriveComfort Plus', cat: 'Mid-size Sedan', rate: 24500, art: sedan(72), tags: ['Maintenance Incl.', 'Insurance Incl.', '24/7 RSA'] },
      { name: 'DriveCity Compact', cat: 'Compact Sedan', rate: 17800, art: sedan(62), tags: ['Maintenance Incl.', 'Insurance Incl.'] }
    ],
    suv: [
      { name: 'DriveForce SUV', cat: 'SUV', rate: 35600, art: suv(76, 54), tags: ['7-Seater', 'All Terrain', 'GPS'] },
      { name: 'DriveTour MUV', cat: 'MUV', rate: 28400, art: suv(80, 50), tags: ['8-Seater', 'Insurance Incl.', '24/7 RSA'] },
      { name: 'DriveXplor Compact SUV', cat: 'Compact SUV', rate: 22600, art: suv(64, 48), tags: ['5-Seater', 'Maintenance Incl.'] }
    ],
    van: [
      { name: 'DriveCargo Max', cat: 'Commercial Van', rate: 21200, art: van(74), tags: ['1.5T Payload', 'GPS', '24/7 RSA'] },
      { name: 'DriveVan Standard', cat: 'Commercial Van', rate: 16800, art: van(62), tags: ['Maintenance Incl.', 'Insurance Incl.'] },
      { name: 'DriveFreeze Reefer', cat: 'Refrigerated Van', rate: 27200, art: van(74, '<path d="M48 32h50M48 42h50M48 52h50" stroke="#E85D2A" stroke-width="1.2" opacity=".5"/><path d="M73 28v30" stroke="#E85D2A" stroke-width="1.2" opacity=".5"/>'), tags: ['Cold Chain', 'GPS', 'Insurance Incl.'] }
    ],
    ev: [
      { name: 'DriveSpark E-Sedan', cat: 'Electric Sedan', rate: 32800, art: sedan(76, bolt(104, 46)), tags: ['Zero Emission', 'Charging Incl.', '400 km Range'] },
      { name: 'DriveVolt E-Van', cat: 'Electric Van', rate: 27500, art: van(70, bolt(80, 32)), tags: ['Zero Emission', '250 km Range', 'Maintenance Incl.'] },
      { name: 'DriveGreen E-Hatch', cat: 'Electric Hatchback', rate: 19800, art: suv(58, 44, bolt(100, 48)), tags: ['Zero Emission', 'City Range 180 km'] }
    ]
  };
  const tick = '<svg viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M2 5.5l2.5 2.5 4.5-4.5"/></svg>';
  const selected = [];
  const grid = $('fGrid');
  const tabs = $('fTabs');

  function renderFleet(cat) {
    tabs.querySelectorAll('.fleet-tab').forEach(t => {
      const on = t.dataset.c === cat;
      t.classList.toggle('active', on);
      t.setAttribute('aria-pressed', String(on));
    });
    grid.innerHTML = fleetData[cat].map(v => {
      const on = selected.includes(v.name);
      return `<article class="fleet-card">
  <div class="fleet-card-img">${v.art}</div>
  <div class="fleet-card-body">
    <div class="fleet-card-cat">${v.cat}</div>
    <h3 class="fleet-card-name">${v.name}</h3>
    <div class="fleet-card-price"><strong>${inr(v.rate)}</strong> /vehicle/mo*</div>
    <div class="fleet-tags">${v.tags.map(t => `<span class="fleet-tag">${tick}${t}</span>`).join('')}</div>
    <button type="button" class="fleet-add-btn${on ? ' added' : ''}" data-name="${v.name}" aria-pressed="${on}">${on ? 'Added to Quote' : 'Add to Quote'}</button>
  </div>
</article>`;
    }).join('');
  }
  if (grid && tabs) {
    tabs.addEventListener('click', e => { const t = e.target.closest('.fleet-tab'); if (t) renderFleet(t.dataset.c); });
    grid.addEventListener('click', e => {
      const btn = e.target.closest('.fleet-add-btn');
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

  /* ---------- Subscription calculator ---------- */
  const sFleet = $('sFleet');
  const sTerm = $('sTerm');
  const big = v => v >= 10000000 ? (v / 10000000).toFixed(2) + ' Cr' : v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v.toLocaleString('en-IN');
  const setVal = (id, text) => { $(id).innerHTML = '<span class="cur">₹</span>' + text; };
  let currentRate = 0;

  function calcUpdate() {
    const f = parseInt(sFleet.value, 10);
    const t = parseInt(sTerm.value, 10);
    $('vFleet').textContent = f;
    $('vTerm').textContent = t + ' mo';
    sFleet.setAttribute('aria-valuetext', f + ' vehicles');
    sTerm.setAttribute('aria-valuetext', t + ' months');
    sFleet.style.setProperty('--fill', ((f - 3) / (250 - 3) * 100) + '%');
    sTerm.style.setProperty('--fill', ((t - 12) / (60 - 12) * 100) + '%');
    let base = 28000;
    if (f >= 10) base *= 0.95;
    if (f >= 50) base *= 0.92;
    if (f >= 100) base *= 0.88;
    if (t >= 36) base *= 0.94;
    if (t >= 48) base *= 0.9;
    base = Math.round(base / 100) * 100;
    currentRate = base;
    const monthly = base * f;
    setVal('cRate', base.toLocaleString('en-IN'));
    setVal('cTotal', monthly.toLocaleString('en-IN'));
    setVal('cTerm', big(monthly * t));
    setVal('cCapital', big(AVG_PURCHASE_PRICE * f));
  }
  if (sFleet && sTerm) {
    sFleet.addEventListener('input', calcUpdate);
    sTerm.addEventListener('input', calcUpdate);
    calcUpdate();
  }

  /* ---------- Assessment drawer ---------- */
  const drawer = $('dDrawer');
  const overlay = $('dOverlay');
  let lastFocus = null;
  const focusables = () => Array.from(drawer.querySelectorAll('a[href], button, input, select, textarea')).filter(el => !el.disabled && el.offsetParent !== null);

  function summaryRows(rows) {
    const box = $('dSumContent');
    box.textContent = '';
    rows.forEach(([k, v]) => {
      const row = document.createElement('div'); row.className = 'drawer-summary-row';
      const a = document.createElement('span'); a.textContent = k;
      const b = document.createElement('strong'); b.textContent = v;
      row.append(a, b); box.append(row);
    });
    $('dSummary').hidden = !rows.length;
  }

  function openDrawer(withQuote) {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    overlay.hidden = false;
    void drawer.offsetWidth; // force layout so the slide-in transition runs
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('drawer-open');
    const rows = [];
    if (withQuote && sFleet) rows.push(['Fleet size', sFleet.value + ' vehicles'], ['Contract term', sTerm.value + ' months'], ['Est. rate', inr(currentRate) + ' /vehicle/mo']);
    if (selected.length) rows.push(['Vehicles', selected.join(', ')]);
    summaryRows(rows);
    drawer.dataset.quote = withQuote ? '1' : '';
    setTimeout(() => { const f = drawer.querySelector('input'); (f && f.offsetParent ? f : $('dClose')).focus(); }, 60);
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
    $('dClose').addEventListener('click', closeDrawer);
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

  /* Assessment form: validate, then open WhatsApp with a pre-filled message */
  const form = $('assessForm');
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
        'Hello DRIVELINK, I would like a free fleet assessment.',
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
      if (v('notes')) lines.push('Notes: ' + v('notes').slice(0, 600));
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      const win = window.open(url, '_blank', 'noopener');
      $('waLink').href = url;
      $('dForm').hidden = true;
      $('dDone').hidden = false;
      if (!win) $('waLink').textContent = 'Tap here to open WhatsApp';
      $('dDoneTitle').focus();
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
