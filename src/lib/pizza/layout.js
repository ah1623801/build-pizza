// src/lib/pizza/layout.js
"use client";

import { DOUGH, SAUCE, CHEESE, MEAT, VEG, EXTRAS, TOPCFG } from './config';
import { SIZES, getIngPrice, meatPrice, effectiveUnit, baseHas } from './pricing';
import { clamp } from './geometry';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

export const STEPS = [
  { id: 'dough', label: 'DOUGH', title: '01 — CHOOSE YOUR DOUGH', single: true },
  { id: 'sauce', label: 'SAUCE', title: '02 — CHOOSE YOUR SAUCE', single: true },
  { id: 'cheese', label: 'CHEESE', title: '03 — CHOOSE YOUR CHEESE', single: true },
  { id: 'meat', label: 'MEAT', title: '04 — ADD YOUR MEAT', multi: true },
  { id: 'veg', label: 'VEGGIES', title: '05 — MAKE IT FRESH', multi: true },
  { id: 'extras', label: 'EXTRAS', title: '06 — ONE MORE THING.', multi: true },
  { id: 'bake', label: 'BAKE', title: '07 — YOUR PIZZA', summary: true }
];

const QORDER = ['less', 'normal', 'more'];

let toastT = null;
export function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.classList.remove('show');
  void t.offsetWidth;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2300);
}

export function updateBadge(state) {
  if (!state) return;
  const n = (state.dough ? 1 : 0) + (state.sauce ? 1 : 0) + (state.cheese ? 1 : 0) +
    Object.keys(state.meats || {}).length + (state.vegs || []).length + (state.extras || []).length;
  const b = $('#dbBadge');
  if (b) b.textContent = n;
}

export function triggerSizeAlert() {
  const gsap = window.gsap;
  const popup = document.getElementById('sizeHintPopup');
  if (popup && gsap) {
    gsap.killTweensOf(popup);
    gsap.fromTo(popup,
      { autoAlpha: 0, y: -6, scale: 0.95 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
    );
    gsap.to(popup, { autoAlpha: 0, delay: 1.6, duration: 0.3 });
  }

  const btns = document.querySelectorAll('.ms-circle-btn');
  if (btns.length && gsap) {
    gsap.killTweensOf(btns);
    gsap.timeline()
      .to(btns, {
        y: -6,
        scale: 1.05,
        duration: 0.18,
        stagger: 0.06,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
  }
}

export function setupLayout({
  getState,
  getCombo,
  getOrderQty,
  setOrderQty,
  getStage,
  onStartBake,
  getLenis
}) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  let curStep = 0;
  let maxReached = 0;
  let advTimer = null;
  let mobileSizeChosen = false;

  function buildRail() {
    const rail = $('#rail');
    if (!rail) return;
    rail.innerHTML = STEPS.map((s, i) =>
      '<button data-i="' + i + '"><b>0' + (i + 1) + '</b><span>' + s.label + '</span></button>'
    ).join('');

    $$('#rail button').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      const state = getState();
      if (i <= maxReached && (i < 6 || (state.dough && state.sauce && state.cheese))) {
        goStep(i);
        if (window.innerWidth <= 980) document.body.classList.add('drawer-open');
      }
    }));
  }

  function paintRail() {
    $$('#rail button').forEach((b, i) => {
      b.classList.toggle('cur', i === curStep);
      b.classList.toggle('done', i < curStep || (i <= maxReached && i !== curStep));
    });
  }

  function goStep(i) {
    curStep = i;
    maxReached = Math.max(maxReached, i);
    paintRail();
    const s = STEPS[i];
    if (!s) return;
    if ($('#pStepNo')) $('#pStepNo').textContent = '0' + (i + 1) + ' / 07';
    if ($('#pBack')) $('#pBack').style.visibility = i > 0 && !s.summary ? 'visible' : 'hidden';
    if ($('#pNext')) $('#pNext').style.visibility = s.multi ? 'visible' : 'hidden';
    renderPanel();
    if (gsap && $('#panelBody')) {
      gsap.fromTo('#panelBody', { autoAlpha: 0, x: 46 }, { autoAlpha: 1, x: 0, duration: .55, ease: 'power3.out' });
    }
  }

  function renderPanel() {
    const s = STEPS[curStep];
    const body = $('#panelBody');
    if (!s || !body) return;
    if (s.summary) {
      renderSummary();
      return;
    }

    const state = getState();
    const combo = getCombo();
    const stage = getStage();

    const data = s.id === 'size' ? SIZES : { dough: DOUGH, sauce: SAUCE, cheese: CHEESE, meat: MEAT, veg: VEG, extras: EXTRAS }[s.id] || [];

    const isOn = id => {
      if (s.id === 'size') return (state.size || 'med') === id;
      if (s.id === 'dough') return state.dough === id;
      if (s.id === 'sauce') return state.sauce === id;
      if (s.id === 'cheese') return state.cheese === id;
      if (s.id === 'meat') return id in (state.meats || {});
      if (s.id === 'veg') return (state.vegs || []).includes(id);
      return (state.extras || []).includes(id);
    };

    body.innerHTML = '<h3 class="p-title">' + s.title + '</h3><p class="p-hint">' + (s.single ? 'Pick one — watch it change live.' : 'Select as many as you like.') + '</p>' +
      '<div class="opts">' + data.map(o => {
        const on = isOn(o.id);
        const pr = s.id === 'size' ? '' : ('EGP ' + getIngPrice(o, state.size));
        return '<div class="opt' + (on ? ' on' : '') + '" data-id="' + o.id + '">' +
          '<span class="opt-name">' + o.name + '</span>' +
          '<span class="opt-desc">' + (o.desc || '') + '</span>' +
          '<span class="opt-price">' + (pr || 'SELECT') + '</span>' +
          (s.id === 'meat' ? '<span class="qty">' + ['less', 'normal', 'more'].map(q => '<button data-q="' + q + '" class="' + (((state.meats || {})[o.id] || 'normal') === q ? 'on' : '') + '">' + q.toUpperCase() + '</button>').join('') + '</span>' : '') +
          '</div>';
      }).join('') + '</div>';

    body.querySelectorAll('.opt').forEach(btn => {
      btn.addEventListener('click', e => {
        if (e.target.closest('.qty button')) return;
        const id = btn.dataset.id;
        if (s.single) {
          body.querySelectorAll('.opt').forEach(b => b.classList.remove('on'));
          btn.classList.add('on');

          if (s.id === 'size') {
            state.size = id;
          }
          if (s.id === 'dough') { state.dough = id; stage?.setDough(id, 1); }
          if (s.id === 'sauce') { state.sauce = id; stage?.setSauce(id, 1); }
          if (s.id === 'cheese') { state.cheese = id; stage?.setCheese(id, 1); }

          clearTimeout(advTimer);
          advTimer = setTimeout(() => goStep(curStep + 1), 600);
        } else {
          if (baseHas(s.id, id, combo)) {
            toast('INCLUDED IN ' + (combo.name || 'COMBO') + ' 🔒');
            return;
          }
          const on = btn.classList.toggle('on');
          if (s.id === 'meat') {
            if (on) {
              if (!state.meats) state.meats = {};
              state.meats[id] = 'normal';
              stage?.setTopping(id, TOPCFG[id]?.counts.normal || 0, 1);
            } else {
              delete state.meats[id];
              stage?.setTopping(id, 0, 1);
            }
          }
          if (s.id === 'veg') {
            if (!state.vegs) state.vegs = [];
            if (on) {
              state.vegs.push(id);
              stage?.setTopping(id, TOPCFG[id]?.fixed || 0, 1);
            } else {
              state.vegs = state.vegs.filter(v => v !== id);
              stage?.setTopping(id, 0, 1);
            }
          }
          if (s.id === 'extras') {
            if (!state.extras) state.extras = [];
            if (on) {
              state.extras.push(id);
              stage?.setExtra(id, true, 1);
            } else {
              state.extras = state.extras.filter(v => v !== id);
              stage?.setExtra(id, false, 1);
            }
          }
        }
      });
    });

    body.querySelectorAll('.qty button').forEach(qb => {
      qb.addEventListener('click', () => {
        const id = qb.closest('.opt').dataset.id;
        const q = qb.dataset.q;
        const bq = combo && combo.snap.meats[id] ? combo.snap.meats[id] : null;
        if (bq && QORDER.indexOf(q) < QORDER.indexOf(bq)) {
          toast('COMBO INCLUDES ' + bq.toUpperCase() + ' 🔒');
          return;
        }
        if (!state.meats) state.meats = {};
        state.meats[id] = q;
        stage?.setTopping(id, TOPCFG[id]?.counts[q] || 0, 1);
        qb.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === qb));
      });
    });
  }

  function renderSummary() {
    const state = getState();
    const combo = getCombo();
    let orderQty = getOrderQty();
    const rows = [];
    const szObj = SIZES.find(x => x.id === (state.size || 'med'));

    rows.push({ st: 0, t: 'SIZE: ' + (szObj ? szObj.name : 'MEDIUM'), p: 0, inc: true });

    const d = DOUGH.find(x => x.id === state.dough);
    if (d) rows.push({ st: 1, t: d.name, p: getIngPrice(d, state.size) });

    const sc = SAUCE.find(x => x.id === state.sauce);
    if (sc) rows.push({ st: 2, t: sc.name, p: getIngPrice(sc, state.size) });

    const ch = CHEESE.find(x => x.id === state.cheese);
    if (ch) rows.push({ st: 3, t: ch.name, p: getIngPrice(ch, state.size) });

    for (const [id, q] of Object.entries(state.meats || {})) {
      const m = MEAT.find(x => x.id === id);
      if (m) rows.push({ st: 4, t: m.name + ' × ' + q.toUpperCase(), p: meatPrice(id, q, state.size) });
    }
    for (const v of state.vegs || []) {
      const m = VEG.find(x => x.id === v);
      if (m) rows.push({ st: 5, t: m.name, p: getIngPrice(m, state.size) });
    }
    for (const e of state.extras || []) {
      const m = EXTRAS.find(x => x.id === e);
      if (m) rows.push({ st: 6, t: m.name, p: getIngPrice(m, state.size) });
    }

    const unit = effectiveUnit(state, combo);
    const body = $('#panelBody');
    if (!body) return;

    body.innerHTML =
      '<h3 class="p-title">07 — YOUR PIZZA</h3><p class="p-hint">' + (combo ? 'Combo base locked — your changes are priced on top.' : 'Raw, assembled and waiting for the fire. Tap a line to edit it.') + '</p>' +
      '<div class="sum-card"><h4>YOUR PIZZA</h4>' +
      rows.map(r => '<div class="sum-row" data-st="' + (r.st == null ? '' : r.st) + '"><span>' + r.t + '</span><span class="ed">' + (r.inc ? '🔒' : (r.st != null ? 'EDIT' : '')) + '</span><span>' + (r.inc ? 'INCLUDED' : (r.fix ? 'EGP ' + r.p : (r.sw ? '+ EGP ' + r.p : 'EGP ' + r.p))) + '</span></div>').join('') +
      '<div class="qty-line"><b>QUANTITY</b><div class="stepper"><button id="qMinus">−</button><span id="sumQty">' + orderQty + '</span><button id="qPlus">+</button></div></div>' +
      '<div class="sum-total"><span>TOTAL</span><b id="sumTotal">EGP ' + (unit * orderQty) + '</b></div></div>' +
      '<div class="sum-btns"><button class="btn ghost" id="btnEdit">EDIT PIZZA</button><button class="btn solid" id="btnBake">BAKE MY PIZZA</button></div>';

    body.querySelectorAll('.sum-row').forEach(r => {
      if (!r.dataset.st) return;
      r.addEventListener('click', () => goStep(+r.dataset.st));
    });
    $('#btnEdit')?.addEventListener('click', () => goStep(0));
    $('#qMinus')?.addEventListener('click', () => {
      orderQty = clamp(orderQty - 1, 1, 9);
      setOrderQty(orderQty);
      syncSum();
    });
    $('#qPlus')?.addEventListener('click', () => {
      orderQty = clamp(orderQty + 1, 1, 9);
      setOrderQty(orderQty);
      syncSum();
    });
    $('#btnBake')?.addEventListener('click', () => onStartBake?.());

    function syncSum() {
      const qEl = $('#sumQty');
      const totEl = $('#sumTotal');
      if (qEl) qEl.textContent = orderQty;
      if (totEl && gsap) {
        gsap.fromTo('#sumTotal', { scale: 1.15 }, { scale: 1, duration: .4 });
        totEl.textContent = 'EGP ' + (unit * orderQty);
      }
    }
  }

  $('#pBack')?.addEventListener('click', () => {
    if (curStep > 0) goStep(curStep - 1);
  });
  $('#pNext')?.addEventListener('click', () => {
    goStep(curStep + 1);
  });

  // Drawer mobile toggle
  $('#drawerBtn')?.addEventListener('click', () => document.body.classList.add('drawer-open'));
  $('#drawerClose')?.addEventListener('click', () => document.body.classList.remove('drawer-open'));
  $('#drawerOverlay')?.addEventListener('click', () => document.body.classList.remove('drawer-open'));
  document.addEventListener('click', () => setTimeout(() => updateBadge(getState()), 0));

  function setAppHeight() {
    document.documentElement.style.setProperty('--apph', window.innerHeight + 'px');
  }
  setAppHeight();

  let lastWidth = window.innerWidth;
  function updateResponsiveLayout() {
    setAppHeight();
    const stageHost = document.getElementById('stageHost');
    if (!stageHost) return;

    const isLandscape = window.innerWidth > window.innerHeight;
    const isMobileLandscape = isLandscape && window.innerHeight <= 520;
    const isMobilePortrait = !isLandscape && window.innerWidth < 650;

    if (mobileSizeChosen && gsap) {
      gsap.killTweensOf(stageHost);
      if (isMobileLandscape) {
        gsap.to(stageHost, {
          left: '50%', top: '100%', right: 'auto',
          xPercent: -50, yPercent: -50, x: 0, y: 0,
          scale: 1, rotation: 0, duration: 0.65, ease: 'power2.out',
          onUpdate: () => window.__forno_place_wheel?.(),
          onComplete: () => window.__forno_place_wheel?.()
        });
      } else if (isMobilePortrait) {
        gsap.to(stageHost, {
          left: '60%', top: '-2vh', right: 'auto',
          xPercent: -50, yPercent: 0, x: '50vw', y: 0,
          scale: 1, rotation: 35, duration: 0.65, ease: 'power2.out',
          force3D: true,
          onUpdate: () => window.__forno_place_wheel?.(),
          onComplete: () => window.__forno_place_wheel?.()
        });
      }
    }

    setTimeout(() => {
      window.__forno_place_wheel?.();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 700);
  }

  let orientTimer = null;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastWidth) > 30) {
      lastWidth = window.innerWidth;
      clearTimeout(orientTimer);
      orientTimer = setTimeout(updateResponsiveLayout, 100);
    }
  });
  window.addEventListener('orientationchange', () => {
    clearTimeout(orientTimer);
    orientTimer = setTimeout(updateResponsiveLayout, 150);
  });

  function setupMobileSizeAnimation() {
    mobileSizeChosen = true;
    const state = getState();
    if (state && !state.size) state.size = 'med';

    const builder = document.getElementById('builder');
    const stageHost = document.getElementById('stageHost');
    const selector = document.getElementById('mobileSizeSelector');

    if (builder) builder.classList.remove('picking-size');

    if (selector) {
      selector.style.display = 'flex';
      selector.style.opacity = '1';
      selector.style.transform = 'none';
      selector.style.pointerEvents = 'auto';
    }

    const circleBtns = document.querySelectorAll('.ms-circle-btn');
    circleBtns.forEach(btn => {
      const isAct = btn.dataset.size === (state?.size || 'med');
      if (isAct) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }

      btn.onclick = (e) => {
        e.stopPropagation();
        circleBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const sz = btn.dataset.size || 'med';
        const st = getState();
        if (st) st.size = sz;
        mobileSizeChosen = true;

        if (builder) builder.classList.remove('picking-size');

        const scaleMap = { small: 0.84, med: 1.0, large: 1.14 };
        if (gsap && stageHost) {
          gsap.to(stageHost, {
            scale: scaleMap[sz] || 1,
            duration: 0.55,
            ease: 'back.out(1.5)',
            onUpdate: () => window.__forno_place_wheel?.(),
            onComplete: () => window.__forno_place_wheel?.()
          });
        }

        if (curStep === 6) renderSummary();
        toast(`SIZE: ${sz.toUpperCase()} 🍕`);
      };
    });

    setTimeout(() => {
      window.__forno_place_wheel?.();
    }, 60);
  }

  function setupMobileLivePrice() {
    const old = document.getElementById('mPrice');
    if (old) old.remove();
    document.getElementById('builder')?.insertAdjacentHTML('beforeend', '<div id="mPrice"><span id="mPriceVal">EGP 0</span></div>');
    const pill = document.getElementById('mPrice');
    const val = document.getElementById('mPriceVal');
    if (!pill || !val) return;

    let shown = 0;
    function render() {
      const state = getState();
      const combo = getCombo();
      const orderQty = getOrderQty();
      const target = effectiveUnit(state, combo) * orderQty;
      if (target === shown) return;
      const up = target > shown;
      const o = { v: shown };
      if (gsap) {
        gsap.to(o, {
          v: target,
          duration: .55,
          ease: 'power2.out',
          onUpdate: () => { val.textContent = 'EGP ' + Math.round(o.v); }
        });
        shown = target;
        gsap.fromTo(pill, { scale: 1.16 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.45)' });
      } else {
        val.textContent = 'EGP ' + Math.round(target);
        shown = target;
      }
      pill.classList.remove('up', 'down');
      void pill.offsetWidth;
      pill.classList.add(up ? 'up' : 'down');
      setTimeout(() => pill.classList.remove('up', 'down'), 700);
    }

    document.addEventListener('click', () => setTimeout(render, 0));
    document.addEventListener('pointerup', () => setTimeout(render, 0));
    window.addEventListener('load', () => setTimeout(render, 150));
    render();
  }

  function setupScroll() {
    if (!ScrollTrigger || !gsap) return;

    // قتل أي ScrollTriggers سابقة بالكامل لمنع تراكم pin-spacers وتكرار العناصر
    ScrollTrigger.getAll().forEach(t => t.kill());

    // مزامنة محرك التمرير السلس Lenis مع GSAP ScrollTrigger
    if (typeof window.Lenis !== 'undefined') {
      if (window.__forno_lenis) {
        window.__forno_lenis.destroy();
      }
      const newLenis = new window.Lenis({
        duration: 1.2,
        smoothWheel: true,
        smoothTouch: false,
      });
      window.__forno_lenis = newLenis;
      newLenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.lagSmoothing(0);

      if (window.__forno_lenis_ticker) {
        gsap.ticker.remove(window.__forno_lenis_ticker);
      }
      window.__forno_lenis_ticker = (time) => {
        newLenis.raf(time * 1000);
      };
      gsap.ticker.add(window.__forno_lenis_ticker);
    }

    const lenis = getLenis ? getLenis() : window.__forno_lenis;

    const scrollToTarget = (target, offset = -30) => {
      if (!target) return;
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0) + offset;
      const l = getLenis ? getLenis() : window.__forno_lenis;
      if (l && typeof l.scrollTo === 'function') {
        l.scrollTo(absoluteTop, { immediate: false, duration: 1.1 });
      } else {
        window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
      }
    };
    window.fornoScrollTo = scrollToTarget;

    function goBuilder() {
      scrollToTarget('#builder', 0);
    }

    $('#ctaBuild')?.addEventListener('click', goBuilder);
    $$('.nav-links button').forEach(b => b.addEventListener('click', () => scrollToTarget(b.dataset.go, -40)));

    const closeMobileMenu = () => {
      document.body.classList.remove('mm-open');
    };

    $('#burgerBtn')?.addEventListener('click', () => {
      document.body.classList.toggle('mm-open');
    });

    $('#mMenuClose')?.addEventListener('click', closeMobileMenu);
    $('#mMenuOverlay')?.addEventListener('click', closeMobileMenu);

    $$('#mMenu button[data-go]').forEach(b => {
      b.addEventListener('click', () => {
        closeMobileMenu();
        scrollToTarget(b.dataset.go, -40);
      });
    });

    $('#ctaMenu')?.addEventListener('click', () => scrollToTarget('#menu', 0));
    window.addEventListener('scroll', () => $('#nav')?.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

    // هيدر وتأثيرات الهيرو
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      gsap.to('#hero', {
        backgroundPosition: '0 0',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top' }
      });
      gsap.to('.hero-grid', {
        y: -60,
        autoAlpha: 0.2,
        scrollTrigger: { trigger: '#hero', start: '40% top', end: 'bottom top', scrub: true }
      });
    }

    // 🍕 تثبيت سكشن البيلدر أثناء تفاعل العميل وصنع البيتزا - زيادة الثِقل ومدة التثبيت
    const builderEl = document.getElementById('builder');
    if (builderEl) {
      ScrollTrigger.create({
        id: 'builderPin',
        trigger: '#builder',
        start: 'top top',
        end: () => '+=' + (window.innerWidth > 980 ? 3000 : (window.innerHeight < 580 ? 1200 : 2200)),
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    }

    // 🍕 تثبيت المنيو وسحب الكروت أفقياً على شاشات الكمبيوتر بسلاسة فائقة ومتوافقة مع Lenis
    const track = $('#menuTrack');
    const menuEl = document.getElementById('menu');
    if (track && menuEl && window.innerWidth > 980) {
      gsap.to(track, {
        x: () => -Math.max(0, track.scrollWidth - window.innerWidth + 100),
        ease: 'none',
        scrollTrigger: {
          id: 'menuPin',
          trigger: '#menu',
          start: 'top top',
          end: () => '+=' + Math.max(1600, track.scrollWidth - window.innerWidth + 200),
          scrub: 0.25, // استجابة سلسة وفورية دون تأخير أو ثِقل مزعج
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const bar = $('#menuBar');
            if (bar) bar.style.width = Math.min(100, Math.max(0, self.progress * 100)) + '%';
          }
        }
      });
    } else if (track) {
      const menuView = track.closest('.menu-view');
      if (menuView) {
        menuView.addEventListener('scroll', () => {
          const bar = $('#menuBar');
          if (bar) {
            const maxScroll = menuView.scrollWidth - menuView.clientWidth;
            if (maxScroll > 0) {
              bar.style.width = ((menuView.scrollLeft / maxScroll) * 100) + '%';
            }
          }
        }, { passive: true });
      }
    }

    // ظهور السكاشن بثبات واستقرار تام
    gsap.utils.toArray('[data-rev]').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          toggleActions: 'play none none none',
          once: true,
          onEnter: () => el.classList.add('rev-in')
        }
      });
    });

    ScrollTrigger.sort();
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 350);

    const handleLayoutResize = () => {
      if (typeof window.__forno_start_wheel_track === 'function') {
        window.__forno_start_wheel_track(850);
      } else if (typeof window.__forno_place_wheel === 'function') {
        window.__forno_place_wheel();
      }
      if (ScrollTrigger) {
        ScrollTrigger.refresh(true);
      }
    };

    if (window.__forno_layout_resize) {
      window.removeEventListener('resize', window.__forno_layout_resize);
      window.removeEventListener('orientationchange', window.__forno_layout_resize);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', window.__forno_layout_resize);
      }
    }
    window.__forno_layout_resize = () => {
      handleLayoutResize();
      setTimeout(handleLayoutResize, 150);
      setTimeout(handleLayoutResize, 450);
      setTimeout(handleLayoutResize, 850);
    };
    window.addEventListener('resize', window.__forno_layout_resize, { passive: true });
    window.addEventListener('orientationchange', window.__forno_layout_resize, { passive: true });
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', window.__forno_layout_resize);
    }
  }

  function heroFX() {
    const v = $('#heroVideo');
    if (v) {
      v.muted = true;
      v.playsInline = true;
      v.play().catch(() => {});

      v.addEventListener('timeupdate', () => {
        if (v.currentTime >= 11) {
          v.currentTime = 0;
          v.play();
        }
      });

      const heroObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }, { threshold: 0.1 });

      const heroEl = document.getElementById('hero');
      if (heroEl) heroObserver.observe(heroEl);
    }
  }

  return {
    buildRail,
    paintRail,
    goStep,
    renderPanel,
    renderSummary,
    setupMobileSizeAnimation,
    setupMobileLivePrice,
    setupScroll,
    heroFX,
    getCurStep: () => curStep,
    getMaxReached: () => maxReached,
    setMaxReached: (m) => { maxReached = m; }
  };
}
