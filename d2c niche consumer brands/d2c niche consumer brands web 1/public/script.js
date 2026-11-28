/* === DEWBLOOM — script.js === */
(function () {
  'use strict';

  // Number that receives orders (country code + number, digits only)
  const WHATSAPP_NUMBER = '919820145673';
  // Orders at or above this subtotal ship free; below it, SHIPPING_FEE is added
  const FREE_SHIPPING_FROM = 499;
  const SHIPPING_FEE = 49;
  const MAX_QTY = 10;
  const STORE_KEY = 'dewbloom-bag';

  // Keep in sync with the product cards in index.html
  const PRODUCTS = {
    serum:     { name: '15% Vitamin C Glow Serum',   size: '30 ml',  price: 649, img: '/images/prod-serum.svg',     note: 'Brightens dullness and dark spots. Morning, before sunscreen.' },
    cream:     { name: '5% Niacinamide Day Cream',   size: '50 g',   price: 549, img: '/images/prod-cream.svg',     note: 'Balances oil and supports the skin barrier.' },
    cleanser:  { name: 'Rice Water Gentle Cleanser', size: '100 ml', price: 399, img: '/images/prod-cleanser.svg',  note: 'Gentle, low-foam cleanse. Morning and night.' },
    sunscreen: { name: 'SPF 50+ Invisible Sunscreen', size: '50 ml', price: 499, img: '/images/prod-sunscreen.svg', note: 'Last step every morning. Reapply outdoors.' }
  };

  const $ = id => document.getElementById(id);
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const rs = n => 'Rs ' + n.toLocaleString('en-IN');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  /* Nav shadow on scroll */
  const nav = $('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Footer year */
  const year = $('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Focus trap helper for the drawer and mobile menu */
  const focusables = root => Array.from(root.querySelectorAll('a[href], button, input, select, textarea'))
    .filter(x => !x.disabled && x.offsetParent !== null);
  const trapTab = (root, e) => {
    if (e.key !== 'Tab') return;
    const f = focusables(root); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---------- Mobile menu ---------- */
  const burger = $('hamburger');
  const menu = $('mobileMenu');
  const menuOverlay = $('mobileOverlay');
  if (burger && menu) {
    const setMenu = open => {
      menu.classList.toggle('open', open);
      if (menuOverlay) menuOverlay.classList.toggle('open', open);
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('locked', open);
      if (open) setTimeout(() => { const c = $('mobileClose'); if (c) c.focus(); }, 50);
    };
    burger.addEventListener('click', () => setMenu(true));
    const close = $('mobileClose');
    if (close) close.addEventListener('click', () => { setMenu(false); burger.focus(); });
    if (menuOverlay) menuOverlay.addEventListener('click', () => setMenu(false));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    menu.addEventListener('keydown', e => {
      if (e.key === 'Escape') { setMenu(false); burger.focus(); return; }
      trapTab(menu, e);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1024 && menu.classList.contains('open')) setMenu(false); });
  }

  /* ---------- Bag (cart) ---------- */
  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      const out = {};
      Object.keys(raw).forEach(id => {
        const q = parseInt(raw[id], 10);
        if (PRODUCTS[id] && q > 0) out[id] = Math.min(q, MAX_QTY);
      });
      return out;
    } catch (e) { return {}; }
  };
  let bag = load();
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(bag)); } catch (e) { /* private mode: bag lasts for this visit */ } };
  const count = () => Object.values(bag).reduce((a, b) => a + b, 0);
  const totals = () => {
    const sub = Object.keys(bag).reduce((s, id) => s + PRODUCTS[id].price * bag[id], 0);
    const ship = sub === 0 || sub >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    return { sub, ship, total: sub + ship };
  };

  const drawer = $('cart');
  const overlay = $('cartOverlay');
  const cartBtn = $('cartBtn');
  const form = $('checkoutForm');
  let lastFocus = null;

  const render = () => {
    const n = count();
    const badge = $('cartCount');
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    if (cartBtn) cartBtn.setAttribute('aria-label', 'Open bag, ' + n + (n === 1 ? ' item' : ' items'));
    if (!drawer) return;

    $('cartTitle').textContent = n ? 'Your Bag (' + n + ')' : 'Your Bag';
    $('cartEmpty').hidden = n > 0;
    $('cartFilled').hidden = n === 0;
    if (n === 0) return;

    const list = $('cartList');
    list.textContent = '';
    Object.keys(bag).forEach(id => {
      const p = PRODUCTS[id], q = bag[id];
      const li = el('li', 'cart-item');
      const imgWrap = el('div', 'cart-item-img');
      const img = el('img'); img.src = p.img; img.alt = ''; img.width = 72; img.height = 96;
      imgWrap.appendChild(img);
      const info = el('div', 'cart-item-info');
      info.appendChild(el('p', 'cart-item-name', p.name));
      info.appendChild(el('p', 'cart-item-size', p.size + ' · ' + inr(p.price) + ' each'));
      info.appendChild(el('p', 'cart-item-price', inr(p.price * q)));
      const row = el('div', 'cart-row');
      const qty = el('div', 'cart-qty');
      const minus = el('button', null, '−'); minus.type = 'button'; minus.dataset.qty = id; minus.dataset.step = '-1';
      minus.setAttribute('aria-label', 'Decrease quantity of ' + p.name);
      const val = el('span', null, String(q)); val.setAttribute('aria-label', 'Quantity ' + q);
      const plus = el('button', null, '+'); plus.type = 'button'; plus.dataset.qty = id; plus.dataset.step = '1';
      plus.setAttribute('aria-label', 'Increase quantity of ' + p.name);
      if (q >= MAX_QTY) plus.disabled = true;
      qty.append(minus, val, plus);
      const rm = el('button', 'cart-remove', 'Remove'); rm.type = 'button'; rm.dataset.remove = id;
      rm.setAttribute('aria-label', 'Remove ' + p.name);
      row.append(qty, rm);
      info.appendChild(row);
      li.append(imgWrap, info);
      list.appendChild(li);
    });

    const t = totals();
    $('cartSubtotal').textContent = inr(t.sub);
    $('cartShipping').textContent = t.ship ? inr(t.ship) : 'Free';
    $('cartTotal').textContent = inr(t.total);
    const note = $('cartShipNote');
    if (t.ship) { note.textContent = 'Add ' + inr(FREE_SHIPPING_FROM - t.sub) + ' more for free shipping.'; note.classList.add('more'); }
    else { note.textContent = 'Your order ships free.'; note.classList.remove('more'); }
  };

  const showView = view => {
    // view: 'bag' | 'checkout' | 'done'
    if (!drawer) return;
    const filled = count() > 0;
    $('cartEmpty').hidden = view === 'done' || filled;
    $('cartFilled').hidden = view === 'done' || !filled;
    $('orderDone').hidden = view !== 'done';
    if (form) form.hidden = view !== 'checkout';
    $('toCheckout').hidden = view === 'checkout';
  };

  const openCart = view => {
    if (!drawer) return;
    lastFocus = document.activeElement;
    showView(view || 'bag');
    drawer.hidden = false;
    overlay.hidden = false;
    void drawer.offsetWidth; // force layout so the slide-in transition runs
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('locked');
    setTimeout(() => $('cartClose').focus(), 60);
  };
  const closeCart = () => {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('locked');
    setTimeout(() => { if (!drawer.classList.contains('open')) { drawer.hidden = true; overlay.hidden = true; } }, 400);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };

  /* Toast */
  const toast = $('toast');
  let toastTimer = null;
  const showToast = msg => {
    if (!toast) return;
    $('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  };
  if (toast) $('toastView').addEventListener('click', () => { toast.classList.remove('show'); openCart(); });

  const add = (ids, opts) => {
    let added = 0;
    ids.forEach(id => {
      if (!PRODUCTS[id]) return;
      const q = bag[id] || 0;
      if (q < MAX_QTY) { bag[id] = q + 1; added++; }
    });
    save(); render();
    if (!added) { showToast('You already have the maximum quantity in your bag.'); return; }
    if (opts && opts.open) { openCart(); return; }
    showToast(ids.length === 1 ? PRODUCTS[ids[0]].name + ' added to your bag.' : added + ' products added to your bag.');
  };

  document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
    add([b.dataset.add]);
    const label = b.textContent;
    b.classList.add('added'); b.textContent = 'Added ✓';
    setTimeout(() => { b.classList.remove('added'); b.textContent = label; }, 1600);
  }));
  document.querySelectorAll('[data-add-set]').forEach(b => b.addEventListener('click', () => add(b.dataset.addSet.split(','), { open: true })));

  if (drawer) {
    cartBtn.addEventListener('click', () => openCart());
    $('cartClose').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    drawer.querySelectorAll('[data-close-cart]').forEach(a => a.addEventListener('click', closeCart));
    drawer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeCart(); return; }
      trapTab(drawer, e);
    });
    $('cartList').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.remove) {
        delete bag[b.dataset.remove];
      } else if (b.dataset.qty) {
        const id = b.dataset.qty;
        const q = (bag[id] || 0) + parseInt(b.dataset.step, 10);
        if (q <= 0) delete bag[id]; else bag[id] = Math.min(q, MAX_QTY);
      } else return;
      save(); render();
      if (count() === 0) { showView('bag'); $('cartClose').focus(); }
      else {
        // keep focus on the same control after re-render
        const sel = b.dataset.remove ? '#cartList button' : '#cartList button[data-qty="' + b.dataset.qty + '"][data-step="' + b.dataset.step + '"]';
        const again = document.querySelector(sel); if (again && !again.disabled) again.focus(); else $('cartClose').focus();
      }
    });
    $('toCheckout').addEventListener('click', () => {
      showView('checkout');
      $('checkoutTitle').focus();
    });
    $('backToBag').addEventListener('click', () => { showView('bag'); $('cartClose').focus(); });
    $('clearBag').addEventListener('click', () => {
      bag = {}; save(); render(); showView('bag'); $('cartClose').focus();
      if (form) form.reset();
    });
  }

  /* Checkout: validate, then open WhatsApp with the order filled in */
  if (form) {
    const err = $('coError');
    form.addEventListener('submit', e => {
      e.preventDefault();
      err.textContent = '';
      const v = n => (form.elements[n].value || '').trim();
      const fail = (msg, field) => { err.textContent = msg; form.elements[field].focus(); };
      if (count() === 0) { err.textContent = 'Your bag is empty.'; return; }
      const phone = v('phone').replace(/[\s-]/g, '').replace(/^(\+91|0091|91(?=\d{10}$)|0)/, '');
      if (v('name').length < 2) return fail('Please enter your full name.', 'name');
      if (!/^[6-9]\d{9}$/.test(phone)) return fail('Please enter a valid 10-digit Indian mobile number.', 'phone');
      if (v('address').length < 8) return fail('Please enter your full delivery address.', 'address');
      if (v('city').length < 2) return fail('Please enter your city.', 'city');
      if (!/^[1-9]\d{5}$/.test(v('pin'))) return fail('Please enter a valid 6-digit PIN code.', 'pin');

      const t = totals();
      const lines = ['Hello DEWBLOOM, I would like to place an order.', ''];
      Object.keys(bag).forEach(id => {
        const p = PRODUCTS[id];
        lines.push(bag[id] + ' x ' + p.name + ' (' + p.size + ') - ' + rs(p.price * bag[id]));
      });
      lines.push('', 'Subtotal: ' + rs(t.sub), 'Shipping: ' + (t.ship ? rs(t.ship) : 'Free'), 'Total: ' + rs(t.total), '',
        'Name: ' + v('name').slice(0, 80),
        'Phone: +91 ' + phone,
        'Address: ' + v('address').replace(/\s+/g, ' ').slice(0, 300),
        'City: ' + v('city').slice(0, 60),
        'PIN: ' + v('pin'),
        'Payment: ' + v('pay'));

      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      const win = window.open(url, '_blank', 'noopener');
      const link = $('waLink');
      link.href = url;
      link.textContent = win ? "WhatsApp didn't open? Tap here." : 'Tap here to open WhatsApp and send your order.';
      showView('done');
      $('doneTitle').focus();
    });
  }

  /* ---------- Skin quiz ---------- */
  const quiz = $('quiz');
  const qForm = $('quizForm');
  if (quiz && qForm) {
    const steps = Array.from(qForm.querySelectorAll('.quiz-step'));
    const qErr = $('quizError');
    let step = 0, picks = [];
    const TYPE = { oily: 'oily skin', combination: 'combination skin', dry: 'dry skin', normal: 'normal skin' };
    const CONCERN = { dullness: 'dullness and dark spots', oil: 'oiliness and pores', breakouts: 'occasional breakouts', dryness: 'dryness' };

    const showStep = i => {
      step = i;
      steps.forEach((s, k) => { s.hidden = k !== i; });
      $('quizResult').hidden = true;
      $('quizNav').hidden = false;
      $('quizBack').hidden = i === 0;
      $('quizNext').textContent = i === steps.length - 1 ? 'See my routine' : 'Next';
      $('quizProgress').textContent = 'Question ' + (i + 1) + ' of ' + steps.length;
      qErr.textContent = '';
      const first = steps[i].querySelector('input:checked') || steps[i].querySelector('input');
      if (first) first.focus();
    };

    const showResult = () => {
      const type = qForm.elements.type.value, concern = qForm.elements.concern.value;
      const sensitive = qForm.elements.sensitive.value === 'yes';
      const treat = [];
      if (concern === 'dullness' && !sensitive) treat.push('serum');
      if (concern !== 'dullness' || type === 'dry' || type === 'oily' || sensitive) treat.push('cream');
      picks = ['cleanser'].concat(treat, ['sunscreen']);

      steps.forEach(s => { s.hidden = true; });
      $('quizNav').hidden = true;
      $('quizResult').hidden = false;
      $('quizProgress').textContent = 'Your results';
      $('quizResultIntro').textContent = 'For ' + TYPE[type] + ', focusing on ' + CONCERN[concern] + ':';
      const ul = $('quizPicks'); ul.textContent = '';
      let sum = 0;
      picks.forEach(id => {
        const p = PRODUCTS[id]; sum += p.price;
        const li = el('li', 'quiz-pick');
        const img = el('img'); img.src = p.img; img.alt = ''; img.width = 56; img.height = 72;
        const txt = el('div'); txt.append(el('strong', null, p.name), el('span', null, p.note));
        li.append(img, txt, el('span', 'qp-price', inr(p.price)));
        ul.appendChild(li);
      });
      let note = 'Patch test each new product for 2 to 3 days before using it on your face.';
      if (sensitive) note = 'We have left out the Vitamin C serum for now, as 15% Vitamin C can sting reactive skin. ' + note;
      if (concern === 'breakouts') note += ' If breakouts are painful, frequent or leave marks, please see a dermatologist.';
      $('quizNote').textContent = note;
      $('quizAdd').textContent = 'Add routine to bag, ' + inr(sum);
      $('quizResultTitle').focus();
    };

    const openQuiz = e => {
      if (e) e.preventDefault();
      qForm.reset();
      if (typeof quiz.showModal === 'function') quiz.showModal(); else quiz.setAttribute('open', '');
      showStep(0);
    };
    const closeQuiz = () => { if (typeof quiz.close === 'function') quiz.close(); else quiz.removeAttribute('open'); };

    document.querySelectorAll('[data-open-quiz]').forEach(b => b.addEventListener('click', openQuiz));
    $('quizClose').addEventListener('click', closeQuiz);
    quiz.addEventListener('click', e => { if (e.target === quiz) closeQuiz(); }); // click on backdrop
    $('quizBack').addEventListener('click', () => showStep(Math.max(0, step - 1)));
    $('quizRestart').addEventListener('click', () => { qForm.reset(); showStep(0); });
    qForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!steps[step].querySelector('input:checked')) { qErr.textContent = 'Please choose an option.'; return; }
      if (step < steps.length - 1) showStep(step + 1); else showResult();
    });
    $('quizAdd').addEventListener('click', () => { closeQuiz(); add(picks, { open: true }); });
  }

  render();

  /* Reveal on scroll (inline head script removes .js after 4s if this file never runs) */
  clearTimeout(window.pcFallback);
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach(x => x.classList.add('visible'));
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(x => obs.observe(x));
    setTimeout(() => els.forEach(x => x.classList.add('visible')), 4000);
  }
})();
