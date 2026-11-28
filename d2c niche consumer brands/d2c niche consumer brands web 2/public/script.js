/* === BREWCRAFT — script.js === */
(function () {
  'use strict';

  // Number that receives orders (country code + number, digits only)
  const WHATSAPP_NUMBER = '919880421365';
  // Orders at or above this subtotal ship free; below it, SHIPPING_FEE is added
  const FREE_SHIPPING_FROM = 599;
  const SHIPPING_FEE = 59;
  // Subscription discount on the regular price (0.2 = 20% off); subscriptions always ship free
  const SUB_DISCOUNT = 0.2;
  const MAX_QTY = 10;
  const STORE_KEY = 'brewcraft-bag';

  // Keep in sync with the product cards and JSON-LD in index.html
  const PRODUCTS = {
    chikmagalur: { name: 'Chikmagalur Estate',    size: '250 g', price: 449, img: '/images/bag-chikmagalur.svg' },
    araku:       { name: 'Araku Valley Reserve',  size: '250 g', price: 549, img: '/images/bag-araku.svg' },
    malabar:     { name: 'Monsoon Malabar AA',    size: '250 g', price: 649, img: '/images/bag-malabar.svg' },
    nilgiri:     { name: 'Nilgiri Single-Estate', size: '250 g', price: 499, img: '/images/bag-nilgiri.svg' },
    wayanad:     { name: 'Wayanad Robusta Blend', size: '250 g', price: 349, img: '/images/bag-wayanad.svg' },
    coldbrew:    { name: 'Cold Brew Pack',        size: '200 g', price: 399, img: '/images/bag-coldbrew.svg', grind: 'Coarse (cold brew)' }
  };
  const GRINDS = ['Whole bean', 'South Indian filter', 'French press', 'Pour over', 'AeroPress', 'Espresso'];
  const validGrind = (id, g) => PRODUCTS[id].grind ? g === PRODUCTS[id].grind : GRINDS.indexOf(g) !== -1;

  const $ = id => document.getElementById(id);
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const rs = n => 'Rs ' + n.toLocaleString('en-IN');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const subPrice = id => Math.floor(PRODUCTS[id].price * (1 - SUB_DISCOUNT));

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

  /* ---------- Bag (cart) ----------
     Each line is keyed "productId|grind", so the same coffee in two grinds is two lines. */
  const splitKey = k => { const i = k.indexOf('|'); return [k.slice(0, i), k.slice(i + 1)]; };
  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      const out = {};
      Object.keys(raw).forEach(k => {
        const [id, g] = splitKey(k);
        const q = parseInt(raw[k], 10);
        if (PRODUCTS[id] && validGrind(id, g) && q > 0) out[k] = Math.min(q, MAX_QTY);
      });
      return out;
    } catch (e) { return {}; }
  };
  let bag = load();
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(bag)); } catch (e) { /* private mode: bag lasts for this visit */ } };
  const count = () => Object.values(bag).reduce((a, b) => a + b, 0);
  const totals = () => {
    const sub = Object.keys(bag).reduce((s, k) => s + PRODUCTS[splitKey(k)[0]].price * bag[k], 0);
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
    if (n === 0) return;

    const list = $('cartList');
    list.textContent = '';
    Object.keys(bag).forEach(k => {
      const [id, g] = splitKey(k);
      const p = PRODUCTS[id], q = bag[k];
      const li = el('li', 'cart-item');
      const imgWrap = el('div', 'cart-item-img');
      const img = el('img'); img.src = p.img; img.alt = ''; img.width = 80; img.height = 80;
      imgWrap.appendChild(img);
      const info = el('div', 'cart-item-info');
      info.appendChild(el('p', 'cart-item-name', p.name));
      info.appendChild(el('p', 'cart-item-size', p.size + ' · ' + g + ' · ' + inr(p.price) + ' each'));
      info.appendChild(el('p', 'cart-item-price', inr(p.price * q)));
      const label = p.name + ', ' + g;
      const row = el('div', 'cart-row');
      const qty = el('div', 'cart-qty');
      const minus = el('button', null, '−'); minus.type = 'button'; minus.dataset.qty = k; minus.dataset.step = '-1';
      minus.setAttribute('aria-label', 'Decrease quantity of ' + label);
      const val = el('span', null, String(q)); val.setAttribute('aria-label', 'Quantity ' + q);
      const plus = el('button', null, '+'); plus.type = 'button'; plus.dataset.qty = k; plus.dataset.step = '1';
      plus.setAttribute('aria-label', 'Increase quantity of ' + label);
      if (q >= MAX_QTY) plus.disabled = true;
      qty.append(minus, val, plus);
      const rm = el('button', 'cart-remove', 'Remove'); rm.type = 'button'; rm.dataset.remove = k;
      rm.setAttribute('aria-label', 'Remove ' + label);
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

  const add = (id, grind) => {
    if (!PRODUCTS[id] || !validGrind(id, grind)) return false;
    const k = id + '|' + grind;
    const q = bag[k] || 0;
    if (q >= MAX_QTY) { showToast('You already have the maximum quantity of this in your bag.'); return false; }
    bag[k] = q + 1;
    save(); render();
    showToast(PRODUCTS[id].name + ' (' + grind.toLowerCase() + ') added to your bag.');
    return true;
  };

  document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.add;
    const sel = document.querySelector('[data-grind-for="' + id + '"]');
    const grind = PRODUCTS[id] && PRODUCTS[id].grind ? PRODUCTS[id].grind : (sel ? sel.value : GRINDS[0]);
    if (!add(id, grind)) return;
    const label = b.textContent;
    b.classList.add('added'); b.textContent = 'Added ✓';
    setTimeout(() => { b.classList.remove('added'); b.textContent = label; }, 1600);
  }));

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
        const k = b.dataset.qty;
        const q = (bag[k] || 0) + parseInt(b.dataset.step, 10);
        if (q <= 0) delete bag[k]; else bag[k] = Math.min(q, MAX_QTY);
      } else return;
      save(); render();
      if (count() === 0) { showView('bag'); $('cartClose').focus(); }
      else {
        // keep focus on the same control after re-render
        let again = null;
        if (!b.dataset.remove) {
          again = Array.from(document.querySelectorAll('#cartList button[data-qty]'))
            .find(x => x.dataset.qty === b.dataset.qty && x.dataset.step === b.dataset.step);
        }
        if (!again) again = document.querySelector('#cartList button');
        if (again && !again.disabled) again.focus(); else $('cartClose').focus();
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

  const openWhatsApp = text => {
    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    const win = window.open(url, '_blank', 'noopener');
    return { url, opened: !!win };
  };

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
      const lines = ['Hello BREWCRAFT, I would like to place an order.', ''];
      Object.keys(bag).forEach(k => {
        const [id, g] = splitKey(k);
        const p = PRODUCTS[id];
        lines.push(bag[k] + ' x ' + p.name + ' (' + p.size + ', ' + g + ') - ' + rs(p.price * bag[k]));
      });
      lines.push('', 'Subtotal: ' + rs(t.sub), 'Shipping: ' + (t.ship ? rs(t.ship) : 'Free'), 'Total: ' + rs(t.total), '',
        'Name: ' + v('name').slice(0, 80),
        'Phone: +91 ' + phone,
        'Address: ' + v('address').replace(/\s+/g, ' ').slice(0, 300),
        'City: ' + v('city').slice(0, 60),
        'PIN: ' + v('pin'),
        'Payment: ' + v('pay'));

      const wa = openWhatsApp(lines.join('\n'));
      const link = $('waLink');
      link.href = wa.url;
      link.textContent = wa.opened ? "WhatsApp didn't open? Tap here." : 'Tap here to open WhatsApp and send your order.';
      showView('done');
      $('doneTitle').focus();
    });
  }

  /* ---------- Subscription builder ---------- */
  const subForm = $('subForm');
  if (subForm) {
    const coffee = $('subCoffee'), bags = $('subBags'), grind = $('subGrind'), pin = $('subPin');
    const summary = $('subSummary'), subErr = $('subError');
    let lastGrind = grind.value;
    const coarse = document.createElement('option');

    const update = () => {
      const id = coffee.value, n = parseInt(bags.value, 10) || 1;
      const fixed = PRODUCTS[id].grind;
      if (fixed) {
        if (!grind.disabled) lastGrind = grind.value;
        coarse.textContent = fixed;
        if (!coarse.parentNode) grind.appendChild(coarse);
        grind.value = fixed; grind.disabled = true;
      } else if (grind.disabled) {
        if (coarse.parentNode) coarse.remove();
        grind.disabled = false; grind.value = lastGrind;
      }
      const now = subPrice(id) * n, was = PRODUCTS[id].price * n;
      summary.textContent = '';
      summary.append(el('strong', null, inr(now)), document.createTextNode(' per delivery '),
        el('s', null, inr(was)), document.createTextNode(', shipping free'));
    };
    [coffee, bags].forEach(x => x.addEventListener('change', update));
    update();

    subForm.addEventListener('submit', e => {
      e.preventDefault();
      subErr.textContent = '';
      const p = pin.value.trim();
      if (!/^[1-9]\d{5}$/.test(p)) { subErr.textContent = 'Please enter a valid 6-digit PIN code so we can check delivery.'; pin.focus(); return; }
      const id = coffee.value, n = parseInt(bags.value, 10) || 1, prod = PRODUCTS[id];
      const freq = subForm.elements.freq.value;
      const text = ['Hello BREWCRAFT, I would like to start a subscription.', '',
        'Coffee: ' + n + ' x ' + prod.name + ' (' + prod.size + ')',
        'Grind: ' + (prod.grind || grind.value),
        'Frequency: ' + freq,
        'Price: ' + rs(subPrice(id) * n) + ' per delivery (20% off), free shipping',
        'Delivery PIN code: ' + p, '',
        'Please confirm my first delivery date.'].join('\n');
      const wa = openWhatsApp(text);
      if (!wa.opened) window.location.href = wa.url;
    });
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
