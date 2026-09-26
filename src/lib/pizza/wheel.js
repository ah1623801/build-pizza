// src/lib/pizza/wheel.js
"use client";

import { GROUPS, TOPCFG } from './config';
import { ICON } from './toppings';

export function setupWheel({
  state,
  getState,
  stage,
  toast,
  startBake,
  baseHas,
  isMobileSizeChosen,
  triggerSizeAlert,
  updateBadge
}) {
  const getStateFn = typeof getState === 'function' ? getState : () => state;
  const gsap = window.gsap;
  const wrap = document.querySelector('.stage-wrap');
  if (!wrap) return;

  const isWheelActive = () => {
    const w = document.getElementById('ingWheel');
    return w && window.getComputedStyle(w).display !== 'none';
  };

  if (window.__forno_wheel_raf) {
    cancelAnimationFrame(window.__forno_wheel_raf);
    window.__forno_wheel_raf = null;
  }

  const ow = document.getElementById('ingWheel');
  if (ow) ow.remove();
  const ob = document.getElementById('wheelBake');
  if (ob) ob.remove();

  wrap.insertAdjacentHTML('beforeend', '<div id="ingWheel"><div id="wheelRot"></div></div>');
  const wheel = document.getElementById('ingWheel'),
    rot = document.getElementById('wheelRot');

  document.getElementById('builder')?.insertAdjacentHTML('beforeend', '<button id="wheelBake" class="btn solid"><svg class="wb-oven-icon" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M153.6 15.6h204.8v163.8H153.6z" fill="#d77a38" stroke="#292320" stroke-width="16" stroke-linejoin="round"/><path d="M153.6 60.5h204.8M153.6 112.6h204.8" stroke="#292320" stroke-width="16"/><path d="M256 15.6v44.9M204.8 60.5v52.1M307.2 60.5v52.1M256 112.6v66.8" stroke="#292320" stroke-width="16"/><path d="M30 496.4h452V380c0-124.8-101.2-226-226-226S30 255.2 30 380v116.4z" fill="#d77a38" stroke="#292320" stroke-width="16" stroke-linejoin="round"/><path d="M85 496.4V380c0-94.4 76.6-171 171-171s171 76.6 171 171v116.4" fill="#ee8b43" stroke="#292320" stroke-width="16" stroke-linejoin="round"/><path d="M30 405h55M427 405h55M55 315l48 24M409 339l48-24M102 240l42 35M368 275l42-35M172 186l28 47M312 233l28-47M256 154v55" stroke="#292320" stroke-width="16"/><path d="M106 496.4h300v-98c0-82.8-67.2-150-150-150s-150 67.2-150 150v98z" fill="#c36224" stroke="#292320" stroke-width="16" stroke-linejoin="round"/><rect x="120" y="454" width="272" height="42" rx="8" fill="#a44b1c" stroke="#292320" stroke-width="14"/><path d="M256 242c16 38 6 70 28 88 18 15 36 2 46 28 14 36-12 78-52 86-42 8-82-20-88-62-5-38 20-64 26-92 4-20-4-32 4-58 10 24 16 38 36 10z" fill="#e03348" stroke="#292320" stroke-width="14" stroke-linejoin="round"/><path d="M256 385c-16 0-30-14-30-31 0-20 18-36 24-52 6 12 14 20 20 28 10 14 16 26 12 40-4 9-14 15-26 15z" fill="#fbb034" stroke="#292320" stroke-width="10" stroke-linejoin="round"/></svg><span>BAKE PIZZA</span></button>');

  const total = GROUPS.reduce((a, g) => a + g.ids.length, 0),
    GAP = 6,
    usable = 360 - GAP * GROUPS.length;
  let ang = -90;
  const icons = [];

  GROUPS.forEach((g) => {
    const span = (usable * g.ids.length) / total,
      start = ang,
      mid = start + span / 2;
    const lab = document.createElement('div');
    lab.className = 'wg-label';
    lab.dataset.cat = g.cat;
    lab.textContent = g.label;
    lab.style.color = g.color;
    const mr = (mid * Math.PI) / 180;
    lab.style.left = 50 + Math.cos(mr) * 50.5 + '%';
    lab.style.top = 50 + Math.sin(mr) * 50.5 + '%';
    lab.style.transform = 'translate(-50%,-50%) rotate(' + (mid + 90) + 'deg)';
    rot.appendChild(lab);
    g.ids.forEach((id, i) => {
      const a = start + span * ((i + 0.5) / g.ids.length),
        r = (a * Math.PI) / 180;
      const el = document.createElement('div');
      el.className = 'wi';
      el.dataset.cat = g.cat;
      el.dataset.id = id;
      el.style.setProperty('--gc', g.color);
      el.style.left = 50 + Math.cos(r) * 44.3 + '%';
      el.style.top = 50 + Math.sin(r) * 44.3 + '%';
      const inn = document.createElement('div');
      inn.className = 'wi-in';
      const f = ICON[g.cat + ':' + id] || ICON[id];
      if (f) inn.appendChild(f());
      el.appendChild(inn);
      rot.appendChild(el);
      icons.push(el);
    });
    ang = start + span + GAP;
  });

  function isOn(cat, id) {
    const s = getStateFn();
    if (!s) return false;
    if (cat === 'dough') return s.dough === id;
    if (cat === 'sauce') return s.sauce === id;
    if (cat === 'cheese') return s.cheese === id;
    if (cat === 'meat') return id in (s.meats || {});
    if (cat === 'veg') return (s.vegs || []).includes(id);
    return (s.extras || []).includes(id);
  }

  function paint() {
    icons.forEach((el) => el.classList.toggle('on', isOn(el.dataset.cat, el.dataset.id)));
  }

  function toggle(cat, id) {
    if (!isMobileSizeChosen() && window.innerWidth <= 980) {
      triggerSizeAlert();
      return;
    }
    if (baseHas(cat, id)) {
      toast('INCLUDED IN COMBO 🔒');
      return;
    }
    if (cat === 'dough') {
      state.dough = id;
      stage.setDough(id, 1);
    } else if (cat === 'sauce') {
      state.sauce = id;
      stage.setSauce(id, 1);
    } else if (cat === 'cheese') {
      state.cheese = id;
      stage.setCheese(id, 1);
    } else if (cat === 'meat') {
      if (state.meats[id]) {
        delete state.meats[id];
        stage.setTopping(id, 0, 1);
      } else {
        state.meats[id] = 'normal';
        stage.setTopping(id, TOPCFG[id].counts.normal, 1);
      }
    } else if (cat === 'veg') {
      if (state.vegs.includes(id)) {
        state.vegs = state.vegs.filter((v) => v !== id);
        stage.setTopping(id, 0, 1);
      } else {
        state.vegs.push(id);
        stage.setTopping(id, TOPCFG[id].fixed, 1);
      }
    } else {
      if (state.extras.includes(id)) {
        state.extras = state.extras.filter((v) => v !== id);
        stage.setExtra(id, false, 1);
      } else {
        state.extras.push(id);
        stage.setExtra(id, true, 1);
      }
    }
    paint();
    updateBadge();
  }

  let A = 0,
    vel = 0,
    drag = false,
    lastA = 0,
    lastT = 0,
    moved = 0,
    downEl = null;
  const AUTO = 360 / 140;

  function center() {
    const r = wheel.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function angOf(e) {
    const c = center();
    return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
  }

  wrap.addEventListener(
    'touchmove',
    (e) => {
      if (drag && downEl) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  wrap.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const a = angOf(e);
    let d = a - lastA;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    moved += Math.abs(d);
    const t = performance.now(),
      dt = Math.max(8, t - lastT);
    vel = (d / dt) * 1000;
    A += d;
    lastA = a;
    lastT = t;
  });

  wrap.addEventListener('pointerdown', (e) => {
    if (!isWheelActive()) return;
    const ovenScene = document.getElementById('ovenScene');
    if (ovenScene && ovenScene.classList.contains('on')) return;
    drag = true;
    moved = 0;
    vel = 0;
    downEl = e.target.closest('.wi');
    lastA = angOf(e);
    lastT = performance.now();
  });

  wrap.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = false;
    if (moved < 7 && downEl) toggle(downEl.dataset.cat, downEl.dataset.id);
    downEl = null;
  });

  wrap.addEventListener('pointercancel', () => {
    drag = false;
    downEl = null;
  });

  let builderInView = false;
  const builderEl = document.getElementById('builder');
  if (builderEl && typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(
      (en) => {
        builderInView = en[0].isIntersecting;
      },
      { threshold: 0.15 }
    ).observe(builderEl);
  }

  let prevT = performance.now();
  let cachedPzRot = null; // كاش للعنصر لمنع البحث في الدوم 120 مرة في الثانية
  let pzA = 0; // زاوية دوران البيتزا المستقلة (لوحدها)
  const PZ_AUTO = -360 / 90; // دوران البيتزا لوحدها عكس اتجاه العجلة (دورة كاملة كل 90 ثانية)

  function loop(t) {
    window.__forno_wheel_raf = requestAnimationFrame(loop);
    // إيقاف المعالجة تماماً لو التاب مخفي أو العجلة مش ظاهرة لتوفير البطارية والمعالج
    if (document.hidden || !isWheelActive() || !builderInView) return;

    const dt = Math.min(0.05, (t - prevT) / 1000);
    prevT = t;

    if (!drag) {
      vel *= Math.pow(0.0025, dt);
      A += (AUTO + vel) * dt;
    }

    rot.style.transform = `rotate(${A}deg)`;
    for (let i = 0; i < icons.length; i++) {
      if (icons[i].firstChild) {
        icons[i].firstChild.style.transform = `rotate(${-A}deg)`;
      }
    }

    // البيتزا تدور لوحدها حركة حرة ومستقلة عكس اتجاه العجلة
    pzA += PZ_AUTO * dt;
    if (pzA <= -360000) pzA += 360000;

    // جلب العنصر مرة واحدة وإعادة استخدامه بسلاسة
    if (!cachedPzRot || !cachedPzRot.isConnected) {
      cachedPzRot = document.querySelector('#stageHost .pz-rot');
    }
    if (cachedPzRot) {
      cachedPzRot.style.transform = `rotate(${pzA}deg)`;
    }
  }
  requestAnimationFrame(loop);

  function place() {
    const host = document.getElementById('stageHost');
    if (!host || !wheel) return;
    const hr = host.getBoundingClientRect(),
      wr = wrap.getBoundingClientRect();
    if (!hr.width || !hr.height) return;

    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobilePhone = window.innerWidth <= 600;

    let factor = 1.22;
    if (isPortrait) {
      factor = isMobilePhone ? 1.18 : 1.09;
    }
const S = Math.min(document.querySelector('#stageHost .pz-rot')?.offsetWidth || hr.width, hr.width, hr.height) * factor;
    wheel.style.width = S + 'px';
    wheel.style.height = S + 'px';
    wheel.style.left = hr.left - wr.left + hr.width / 2 + 'px';
    wheel.style.top = hr.top - wr.top + hr.height / 2 + 'px';
  }

  wheel.style.transition = 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1), left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  window.__forno_place_wheel = place;
  if (gsap) gsap.set(wheel, { xPercent: -50, yPercent: -50 });

  // تتبع دوران الشاشة وتغيير المقاسات لحظياً فريم بفريم بدون لاج
  let orientTrackingRaf = null;
  const startTracking = (duration = 850) => {
    const start = performance.now();
    if (orientTrackingRaf) cancelAnimationFrame(orientTrackingRaf);
    const step = (now) => {
      place();
      if (now - start < duration) {
        orientTrackingRaf = requestAnimationFrame(step);
      } else {
        place();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh(true);
      }
    };
    orientTrackingRaf = requestAnimationFrame(step);
  };
  window.__forno_start_wheel_track = startTracking;

  const handleResizeOrOrient = () => {
    startTracking(850);
  };

  // مراقبة انتهاء أي ترانزيشن سي إس إس لعنصر البيتزا للتأكد من المحاذاة النهائية
  const hostEl = document.getElementById('stageHost');
  if (hostEl) {
    hostEl.addEventListener('transitionend', () => place(), { passive: true });
  }
  if (wrap) {
    wrap.addEventListener('transitionend', () => place(), { passive: true });
  }

  // استخدام ResizeObserver لضبط المقاس تلقائياً عند أي تغير في الحجم
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      place();
    });
    if (wrap) ro.observe(wrap);
    if (hostEl) ro.observe(hostEl);
  }

  // تنظيف أي مستمعات أحداث قديمة لمنع تسريب الذاكرة وتراكم الفانكشنز
  if (window.__forno_wheel_resize_handler) {
    window.removeEventListener('resize', window.__forno_wheel_resize_handler);
    window.removeEventListener('orientationchange', window.__forno_wheel_resize_handler);
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.removeEventListener('change', window.__forno_wheel_resize_handler);
    }
  }
  window.__forno_wheel_resize_handler = handleResizeOrOrient;
  window.addEventListener('resize', handleResizeOrOrient, { passive: true });
  window.addEventListener('orientationchange', handleResizeOrOrient, { passive: true });
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', handleResizeOrOrient, { passive: true });
  }

  setTimeout(place, 150);
  setTimeout(place, 600);
  setTimeout(place, 1200);

  document.getElementById('wheelBake')?.addEventListener('click', () => {
    const s = getStateFn();
    if (!s.dough || !s.sauce || !s.cheese) {
      toast('PICK DOUGH, SAUCE & CHEESE FROM THE WHEEL FIRST');
      return;
    }
    startBake();
  });

  function clearSelection() {
    icons.forEach((el) => el.classList.remove('on'));
    paint();
  }

  window.__forno_wheel = {
    paint,
    place,
    startTracking,
    clearSelection
  };

  paint();

  return {
    paint,
    place,
    startTracking,
    clearSelection
  };
}
